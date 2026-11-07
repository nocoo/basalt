"""Derive right-sized AVIF/WebP variants for images the catalog site serves.

By default masters stay untouched. --template-captures replaces template masters
from fresh 3200x2000 PNG captures and updates only template preview variants.
Every output is recorded in assets/responsive-images.json.
"""

from hashlib import sha256
from pathlib import Path
import argparse
import json
import subprocess

from PIL import Image, ImageFilter, __version__ as pillow_version

root = Path(__file__).resolve().parents[1]
public = root / "public"
landing = public / "landing"
outputs = []
parser = argparse.ArgumentParser()
parser.add_argument("--template-captures", type=Path)
captures = parser.parse_args().template_captures
if captures:
    metadata = json.loads((captures / "capture.json").read_text())
    version = json.loads((root / "package.json").read_text())["version"]
    if metadata["version"] != version:
        raise ValueError("Template captures must match the current package version")
    for name in ["dashboard", "banking", "network"]:
        for mode in ["light", "dark"]:
            with Image.open(captures / f"{name}-{mode}.png") as image:
                if image.size != (3200, 2000):
                    raise ValueError("Template captures must be 3200x2000")

WEBP = {"format": "WEBP", "quality": 82, "method": 6}
AVIF = {"format": "AVIF", "quality": 60, "speed": 4}
# The tower is a detailed, transparent illustration; keep more of its fine structure.
AVIF_DETAIL = {"format": "AVIF", "quality": 72, "speed": 4}


def save(image: Image.Image, relative: str, role: str, source: str, options: dict) -> None:
    destination = public / relative
    image.save(destination, **options)
    decoded = Image.open(destination)
    outputs.append({
        "path": f"public/{relative}",
        "role": role,
        "source": source,
        "width": decoded.width,
        "height": decoded.height,
        "bytes": destination.stat().st_size,
        "sha256": sha256(destination.read_bytes()).hexdigest(),
    })


def write_manifest() -> None:
    manifest = {
        "generator": "scripts/generate-responsive-images.py",
        "pillow": pillow_version,
        "files": outputs,
    }
    (root / "assets/responsive-images.json").write_text(json.dumps(manifest, indent="\t") + "\n")
    for record in outputs:
        print(f"{record['path']}: {record['width']}x{record['height']} {record['bytes']} B")


def resized(image: Image.Image, width: int) -> Image.Image:
    if width == image.width:
        return image
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


# Template previews: 3200x2000 masters, shown from ~350px (mobile cards) to 1456px (desktop hero).
TEMPLATE_WEBP_WIDTHS = [640, 960, 1600]  # 1200 and 3200 WebP already ship
TEMPLATE_AVIF_WIDTHS = [640, 960, 1200, 1600, 3200]
for name in ["dashboard", "banking", "network"]:
    for mode in ["light", "dark"]:
        source = f"public/landing/{name}-{mode}.webp"
        master_path = captures / f"{name}-{mode}.png" if captures else root / source
        master = Image.open(master_path).convert("RGB")
        if captures:
            save(master, f"landing/{name}-{mode}.webp", "template preview", source, WEBP)
            save(resized(master, 1200), f"landing/{name}-{mode}-1200.webp",
                 "template preview", source, WEBP)
        for width in TEMPLATE_WEBP_WIDTHS:
            save(resized(master, width), f"landing/{name}-{mode}-{width}.webp",
                 "template preview", source, WEBP)
        for width in TEMPLATE_AVIF_WIDTHS:
            suffix = "" if width == master.width else f"-{width}"
            save(resized(master, width), f"landing/{name}-{mode}{suffix}.avif",
                 "template preview", source, AVIF)

if captures:
    previous = json.loads((root / "assets/responsive-images.json").read_text())
    outputs.extend(record for record in previous["files"] if record["role"] != "template preview")
    write_manifest()
    provenance = root / "assets/landing/template-previews.json"
    provenance.write_text(json.dumps(metadata, indent="\t") + "\n")
    subprocess.run([root / "node_modules/.bin/biome", "format", "--write", provenance], check=True)
    raise SystemExit(0)

# Brand tower: 1280px RGBA master, displayed at ~320-560 CSS px below the fold. 600w covers a
# typical phone (about 330 CSS px at 1.75x) without stepping up to 720w.
tower_source = "public/landing/tower.webp"
tower = Image.open(root / tower_source).convert("RGBA")
for width in [480, 600, 720, 960]:
    save(resized(tower, width), f"landing/tower-{width}.webp", "brand tower", tower_source, WEBP)
for width in [480, 600, 720, 960, 1280]:
    suffix = "" if width == tower.width else f"-{width}"
    save(resized(tower, width), f"landing/tower{suffix}.avif", "brand tower", tower_source,
         AVIF_DETAIL)

# Scene backgrounds: re-derive from the untouched PNG masters exactly as backgrounds.json
# records (crop + Gaussian diffusion, no resizing), encoded as AVIF instead of WebP.
backgrounds = json.loads((root / "assets/landing/backgrounds.json").read_text())
scenes = {scene["id"]: scene for scene in backgrounds["scenes"]}
for asset in backgrounds["assets"]:
    scene = scenes[asset["scene"]]
    master_path = root / scene["master"]
    if sha256(master_path.read_bytes()).hexdigest() != scene["sha256"]:
        raise ValueError(f"Background master changed: {scene['master']}")
    image = Image.open(master_path).convert("RGB").crop(tuple(asset["sourceCrop"]))
    image = image.filter(ImageFilter.GaussianBlur(asset["gaussianBlurRadius"]))
    relative = asset["path"].removeprefix("public/").removesuffix(".webp") + ".avif"
    save(image, relative, "scene background", scene["master"], AVIF)
    # Phones: the hero is taller than it is wide, so `cover` scales the 2:1 ridge by height and
    # shows only its middle. A centered square crop renders the same framing at half the bytes.
    if asset["scene"] == "mountains":
        left = (image.width - image.height) // 2
        square = image.crop((left, 0, left + image.height, image.height))
        stem = asset["path"].removeprefix("public/").removesuffix(".webp") + "-square"
        save(square, stem + ".avif", "scene background (phone crop)", scene["master"], AVIF)
        save(square, stem + ".webp", "scene background (phone crop)", scene["master"], WEBP)

# Logo mark: shown at 24-32 CSS px in headers, so 2x/3x screens need 64-96px, not 256px.
logo_source = "logo.png"
logo = Image.open(root / logo_source).convert("RGBA")
for size in [64, 96]:
    save(logo.resize((size, size), Image.Resampling.LANCZOS), f"logo-{size}.webp",
         "transparent application mark", logo_source, {"format": "WEBP", "lossless": True, "method": 6})

write_manifest()
