#!/usr/bin/env python3
"""Validate the System0 Z1 result against the native slot workflow."""

import json
import os
import sys
import urllib.request
from datetime import datetime

SLOT_JOBS = {
    "S1": ("s1-types", "S1: Types"),
    "S2": ("s2-lint", "S2: Lint"),
    "S3": ("s3-workflow", "S3: Workflow"),
    "G1": ("g1-secrets", "G1: Secrets"),
    "G2": ("g2-dependencies", "G2: Dependencies"),
    "B1": ("b1-build", "B1: Build"),
    "L1": ("l1-unit", "L1: Unit"),
    "L2": ("l2-runtime", "L2: Runtime"),
    "L3": ("l3-integration", "L3: Integration"),
    "L4": ("l4-e2e", "L4: E2E"),
    "P1": ("p1-package", "P1: Package"),
}
EXTRA_BLOCKING = {
    "consumer-next": "Next.js consumer",
    "hook-self-test": "Hook self-test",
    "unit-shard-1": "Unit shard 1/4",
    "unit-shard-2": "Unit shard 2/4",
    "unit-shard-3": "Unit shard 3/4",
    "unit-shard-4": "Unit shard 4/4",
}
VALID = ("impl", "na", "todo")
TARGET_SECONDS = 5 * 60
LIMIT_SECONDS = 10 * 60


class GateError(Exception):
    pass


def job_timings():
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    repo = os.environ.get("GITHUB_REPOSITORY", "").strip()
    run_id = os.environ.get("GITHUB_RUN_ID", "").strip()
    if not (token and repo and run_id):
        return {}, None

    base = os.environ.get("GITHUB_API_URL", "https://api.github.com")
    headers = {
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "basalt-z1-gate",
    }
    fmt = "%Y-%m-%dT%H:%M:%SZ"
    seconds = {}

    try:
        request = urllib.request.Request(
            f"{base}/repos/{repo}/actions/runs/{run_id}/jobs?per_page=100",
            headers=headers,
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = json.loads(response.read().decode("utf-8"))
        for job in payload.get("jobs", []):
            started = job.get("started_at")
            completed = job.get("completed_at")
            if started and completed:
                seconds[job.get("name", "")] = int(
                    (
                        datetime.strptime(completed, fmt)
                        - datetime.strptime(started, fmt)
                    ).total_seconds()
                )
    except Exception as exc:
        print(f"::warning::Z1 could not read job timings ({exc})")

    wall = None
    try:
        request = urllib.request.Request(
            f"{base}/repos/{repo}/actions/runs/{run_id}",
            headers=headers,
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            run = json.loads(response.read().decode("utf-8"))
        if run.get("run_started_at") and run.get("updated_at"):
            wall = int(
                (
                    datetime.strptime(run["updated_at"], fmt)
                    - datetime.strptime(run["run_started_at"], fmt)
                ).total_seconds()
            )
    except Exception as exc:
        print(f"::warning::Z1 could not read run duration ({exc})")

    return seconds, wall


def main():
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    summary = open(summary_file, "w") if summary_file else sys.stdout

    try:
        declarations = json.loads(os.environ["SLOT_STATUS"])
        needs = json.loads(os.environ["NEEDS_JSON"])
        expected_sha = os.environ.get("EXPECTED_SHA", "").strip()
        timings, wall = job_timings()

        if len(SLOT_JOBS) != 11:
            raise GateError("the slot map must contain 11 jobs plus Z1")
        if not isinstance(declarations, dict):
            raise GateError("SLOT_STATUS must be a JSON object")
        unknown = sorted(set(declarations) - set(SLOT_JOBS) - {"Z1"})
        if unknown:
            raise GateError("declares unknown slots: " + ", ".join(unknown))
        missing = [slot for slot in [*SLOT_JOBS, "Z1"] if slot not in declarations]
        if missing:
            raise GateError("is missing slot declarations: " + ", ".join(missing))

        verified = []
        rows = [
            "| Slot | Status | Reason | Result | Time |",
            "| --- | --- | --- | --- | --- |",
        ]
        for slot, (job, name) in SLOT_JOBS.items():
            entry = declarations[slot]
            if not isinstance(entry, dict) or entry.get("status") not in VALID:
                raise GateError(f"{slot} has an invalid status")
            status = entry["status"]
            reason = entry.get("reason", "")
            if status in ("na", "todo") and not str(reason).strip():
                raise GateError(f"{slot} is declared {status} without a reason")
            state = needs.get(job, {})
            result = state.get("result", "missing")
            sha = (state.get("outputs") or {}).get("tested-sha", "")
            seconds = timings.get(name, "")
            if status == "impl":
                if result != "success":
                    raise GateError(
                        f"{slot} is declared impl but its job finished '{result}'"
                    )
                if not sha:
                    raise GateError(f"{slot} is declared impl but reported no tested SHA")
                verified.append((slot, sha))
            elif result != "skipped":
                raise GateError(
                    f"{slot} is declared {status} but its job finished '{result}'"
                )
            rows.append(
                f"| {slot} | {status} | {reason or '-'} | {result} | {seconds or '-'} |"
            )

        if declarations.get("Z1", {}).get("status") != "impl":
            raise GateError("Z1 must be declared impl")
        if not verified:
            raise GateError("no implemented slot besides Z1")

        for job, name in EXTRA_BLOCKING.items():
            state = needs.get(job, {})
            result = state.get("result", "missing")
            sha = (state.get("outputs") or {}).get("tested-sha", "")
            rows.append(
                f"| {name} | extra | blocking, not a slot | {result} | {timings.get(name, '-') or '-'} |"
            )
            if result != "success":
                raise GateError(f"blocking job {name} finished '{result}'")
            if not sha:
                raise GateError(f"blocking job {name} reported no tested SHA")
            verified.append((name, sha))

        shas = {sha for _, sha in verified}
        if len(shas) != 1:
            detail = ", ".join(f"{name}={sha}" for name, sha in verified)
            raise GateError(f"slot jobs tested different commits: {detail}")
        tested_sha = shas.pop()
        if expected_sha and tested_sha != expected_sha:
            raise GateError(
                f"slot jobs tested {tested_sha} but this run is {expected_sha}"
            )

        output_file = os.environ.get("GITHUB_OUTPUT")
        if output_file:
            with open(output_file, "a", encoding="utf-8") as output:
                output.write(f"tested-sha={tested_sha}\n")

        verdict = ""
        if wall is not None:
            if wall <= TARGET_SECONDS:
                verdict = f"within the {TARGET_SECONDS // 60} min target"
            elif wall <= LIMIT_SECONDS:
                verdict = (
                    f"over the {TARGET_SECONDS // 60} min target, within the "
                    f"{LIMIT_SECONDS // 60} min limit"
                )
            else:
                verdict = f"over the {LIMIT_SECONDS // 60} min limit"
            verdict = f" — wall time {wall}s, {verdict}"

        rows.append("| Z1 | impl | all impl slots succeeded on the same SHA | success | - |")
        print("\n".join(rows), file=summary)
        print(f"\nTested SHA: `{tested_sha}`{verdict}", file=summary)
        print(f"Z1: {len(verified)} jobs verified on {tested_sha}{verdict}")
        return 0
    except GateError as exc:
        message = str(exc)
        sys.stderr.write(f"::error::{message}\n")
        print(f"| Z1 | **FAIL** | {message} |", file=summary)
        return 1
    except Exception as exc:
        message = f"invalid Z1 input: {exc}"
        sys.stderr.write(f"::error::{message}\n")
        print(f"| Z1 | **FAIL** | {message} |", file=summary)
        return 1
    finally:
        if summary is not sys.stdout:
            summary.close()


if __name__ == "__main__":
    sys.exit(main())
