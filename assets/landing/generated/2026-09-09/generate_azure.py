#!/usr/bin/env python3
"""Archive one reference-guided image request through Azure OpenAI v1."""

import argparse
import base64
from datetime import datetime, timezone
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import struct
import sys
import time
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import uuid


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent="\t") + "\n")


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", required=True, type=Path)
    parser.add_argument("--image", action="append", required=True, type=Path)
    parser.add_argument("--size", default="2048x2048")
    args = parser.parse_args()
    run_dir = args.run_dir.resolve()
    prompt_path = run_dir / "prompt.txt"
    request_path = run_dir / "request.json"
    response_path = run_dir / "response.json"
    review_path = run_dir / "raw-review.json"
    output_path = run_dir / "raw" / "generated.png"
    if any(path.exists() for path in [request_path, response_path, review_path, output_path]):
        parser.error("Use a new study directory; previous requests are immutable.")
    prompt = prompt_path.read_text()
    endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
    api_key = os.environ.get("AZURE_OPENAI_API_KEY", "")
    endpoint_parts = urlsplit(endpoint)
    if not api_key or not endpoint:
        parser.error("Supply AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY through direnv.")
    if endpoint_parts.scheme != "https" or not endpoint.endswith("/openai/v1"):
        parser.error("Expected the configured HTTPS Azure OpenAI v1 endpoint.")
    width, height = (int(value) for value in args.size.split("x"))
    if not (
        width % 16 == height % 16 == 0
        and max(width, height) <= 3840
        and max(width, height) / min(width, height) <= 3
        and 655360 <= width * height <= 8294400
    ):
        parser.error("Size is outside the documented gpt-image-2 limits.")

    fields = {
        "model": "gpt-image-2",
        "prompt": prompt,
        "size": args.size,
        "quality": "high",
        "n": "1",
        "background": "opaque",
        "output_format": "png",
    }
    boundary = "hexly-image-" + uuid.uuid4().hex
    parts = []
    for name, value in fields.items():
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
        )
    references = []
    for index, image_path in enumerate(args.image, 1):
        image_path = image_path.resolve()
        data = image_path.read_bytes()
        mime = mimetypes.guess_type(image_path.name)[0] or "application/octet-stream"
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="reference-{index}{image_path.suffix}"\r\nContent-Type: {mime}\r\n\r\n'.encode()
            + data
            + b"\r\n"
        )
        references.append({
            "index": index,
            "path": os.path.relpath(image_path, run_dir),
            "sha256": hashlib.sha256(data).hexdigest(),
            "bytes": len(data),
            "mime": mime,
        })
    parts.append(f"--{boundary}--\r\n".encode())
    url = endpoint + "/images/edits"
    write_json(request_path, {
        "startedAt": timestamp(),
        "provider": "Azure OpenAI / Foundry",
        "endpoint": url,
        "method": "POST",
        "contentType": "multipart/form-data",
        "parameters": {key: value for key, value in fields.items() if key != "prompt"},
        "promptFile": "prompt.txt",
        "promptSha256": hashlib.sha256(prompt.encode()).hexdigest(),
        "images": references,
        "transportReference": "workflow/agents/skills/azure-gpt-image-cover/scripts/generate.py",
        "documentation": "https://developers.openai.com/api/docs/guides/image-generation",
    })
    request = Request(url, data=b"".join(parts), method="POST", headers={
        "api-key": api_key,
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    })
    started = time.monotonic()
    print(f"Requesting gpt-image-2 {args.size}, high quality, {len(references)} reference images.", flush=True)
    try:
        with urlopen(request, timeout=600) as response:
            body = json.loads(response.read())
            request_id = response.headers.get("x-request-id") or response.headers.get("apim-request-id")
        items = body.get("data") or []
        if len(items) != 1 or not items[0].get("b64_json"):
            raise ValueError("Expected exactly one base64-encoded image.")
        image_bytes = base64.b64decode(items[0]["b64_json"], validate=True)
        if image_bytes[:8] != b"\x89PNG\r\n\x1a\n":
            raise ValueError("The response is not a PNG image.")
        actual_size = struct.unpack(">II", image_bytes[16:24])
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(image_bytes)
        metadata = {key: value for key, value in body.items() if key != "data"}
        metadata["data"] = [{key: value for key, value in items[0].items() if key != "b64_json"}]
        write_json(response_path, {
            "status": "succeeded",
            "finishedAt": timestamp(),
            "elapsedSeconds": round(time.monotonic() - started, 2),
            "requestId": request_id,
            "response": metadata,
            "output": {
                "path": str(output_path.relative_to(run_dir)),
                "width": actual_size[0], "height": actual_size[1],
                "bytes": len(image_bytes),
                "sha256": hashlib.sha256(image_bytes).hexdigest(),
                "nativeSizeMatchesRequest": actual_size == (width, height),
                "rawResponseBytesPreserved": True,
            },
        })
        write_json(review_path, {
            "status": "pending",
            "imageSha256": hashlib.sha256(image_bytes).hexdigest(),
            "recordedAt": timestamp(),
            "nextStep": "Show this untouched image to the owner immediately. Await confirmation before extraction, compositing, exports, or catalogue integration.",
        })
        print(f"Saved native {actual_size[0]}x{actual_size[1]} PNG to {output_path}")
        print("Raw image review is pending. Show the original and wait for owner confirmation.")
    except Exception as error:
        detail = error.read().decode(errors="replace")[:4000] if isinstance(error, HTTPError) else str(error)
        detail = detail.replace(api_key, "[redacted]")
        write_json(response_path, {
            "status": "failed" if isinstance(error, HTTPError) else "outcome-unknown",
            "finishedAt": timestamp(),
            "elapsedSeconds": round(time.monotonic() - started, 2),
            "errorType": type(error).__name__,
            "httpStatus": error.code if isinstance(error, HTTPError) else None,
            "detail": detail,
        })
        print(f"Generation did not complete: {type(error).__name__}: {detail}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
