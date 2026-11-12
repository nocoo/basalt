import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	computeFingerprint,
	FINGERPRINT_VERSION,
	fingerprintPath,
	verifyFingerprint,
	writeFingerprint,
} from "./install-fingerprint";

function project(): string {
	const root = mkdtempSync(join(tmpdir(), "basalt-install-fingerprint-"));
	mkdirSync(join(root, "node_modules"), { recursive: true });
	writeFileSync(join(root, "package.json"), '{"name":"fingerprint","private":true}\n');
	writeFileSync(join(root, "bun.lock"), "{}\n");
	return root;
}

describe("install fingerprint", () => {
	it("fails closed when the installed tree carries no proof", () => {
		const root = project();
		try {
			const verdict = verifyFingerprint(root, root);
			expect(verdict.ok).toBe(false);
			expect(verdict.detail).toMatch(/run bun install/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("accepts a matching install", () => {
		const root = project();
		try {
			writeFingerprint(root);
			const verdict = verifyFingerprint(root, root);
			expect(verdict.ok).toBe(true);
			expect(verdict.detail).toMatch(/matches/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects a target whose manifests differ from the installed ones", () => {
		const installed = project();
		const target = project();
		try {
			writeFingerprint(installed);
			writeFileSync(join(target, "package.json"), '{"name":"other","private":true}\n');
			const verdict = verifyFingerprint(installed, target);
			expect(verdict.ok).toBe(false);
			expect(verdict.detail).toMatch(/mismatch/);
		} finally {
			rmSync(installed, { recursive: true, force: true });
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("rejects a fingerprint written by another toolchain", () => {
		const installed = project();
		const target = project();
		try {
			const fingerprint = writeFingerprint(installed);
			fingerprint.toolchain = "bun@0.0.0";
			writeFileSync(fingerprintPath(installed), `${JSON.stringify(fingerprint, null, "\t")}\n`);
			const verdict = verifyFingerprint(installed, target);
			expect(verdict.ok).toBe(false);
			expect(verdict.detail).toMatch(/bun@0\.0\.0/);
		} finally {
			rmSync(installed, { recursive: true, force: true });
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("rejects an unknown fingerprint version", () => {
		const root = project();
		try {
			writeFingerprint(root);
			const fingerprint = computeFingerprint(root);
			expect(fingerprint.version).toBe(FINGERPRINT_VERSION);
			writeFileSync(fingerprintPath(root), `${JSON.stringify({ ...fingerprint, version: 0 })}\n`);
			const verdict = verifyFingerprint(root, root);
			expect(verdict.ok).toBe(false);
			expect(verdict.detail).toMatch(/version/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
