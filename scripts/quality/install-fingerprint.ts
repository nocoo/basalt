#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

export interface InstallFingerprint {
	version: number;
	toolchain: string;
	manifests: Record<string, string>;
	lockfile: string;
	trees: string[];
	digest: string;
}

export const FINGERPRINT_VERSION = 2;
export const FINGERPRINT_FILE = join("node_modules", ".cache", "basalt-install-fingerprint.json");

export function currentToolchain(): string {
	const runtime = (process.versions as { bun?: string }).bun;
	if (runtime) return `bun@${runtime}`;
	const result = spawnSync("bun", ["--version"], { encoding: "utf8" });
	const version = (result.stdout ?? "").trim().split("\n")[0];
	return version ? `bun@${version}` : "bun@unknown";
}

function sha256(contents: string | Buffer): string {
	return createHash("sha256").update(contents).digest("hex");
}

function sha256File(path: string): string | undefined {
	if (!existsSync(path)) return undefined;
	return sha256(readFileSync(path));
}

function expandWorkspace(root: string, pattern: string): string[] {
	const segments = pattern.split("/").filter(Boolean);
	let directories = [root];
	for (const [index, segment] of segments.entries()) {
		const last = index === segments.length - 1;
		const next: string[] = [];
		for (const directory of directories) {
			if (!segment.includes("*")) {
				const candidate = join(directory, segment);
				if (!existsSync(candidate)) continue;
				if (!last) {
					next.push(candidate);
					continue;
				}
				if (existsSync(join(candidate, "package.json"))) next.push(candidate);
				continue;
			}
			let entries: string[] = [];
			try {
				entries = readdirSync(directory);
			} catch {
				continue;
			}
			for (const entry of entries) {
				const candidate = join(directory, entry);
				try {
					if (!statSync(candidate).isDirectory()) continue;
				} catch {
					continue;
				}
				if (!last) {
					next.push(candidate);
					continue;
				}
				if (existsSync(join(candidate, "package.json"))) next.push(candidate);
			}
		}
		directories = next;
	}
	return directories;
}

export function workspaceRoots(root: string): string[] {
	const manifestPath = join(root, "package.json");
	if (!existsSync(manifestPath)) return [root];
	let manifest: { workspaces?: string[] | { packages?: string[] } };
	try {
		manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as typeof manifest;
	} catch {
		return [root];
	}
	const patterns = Array.isArray(manifest.workspaces)
		? manifest.workspaces
		: (manifest.workspaces?.packages ?? []);
	const roots = new Set<string>([root]);
	for (const pattern of patterns) {
		for (const directory of expandWorkspace(root, pattern)) roots.add(directory);
	}
	return [...roots].sort();
}

function digestFor(payload: {
	version: number;
	toolchain: string;
	manifests: Record<string, string>;
	lockfile: string;
}): string {
	return sha256(
		JSON.stringify({
			version: payload.version,
			toolchain: payload.toolchain,
			manifests: Object.fromEntries(Object.entries(payload.manifests).sort()),
			lockfile: payload.lockfile,
		}),
	);
}

export function computeFingerprint(
	root: string,
	toolchain = currentToolchain(),
): InstallFingerprint {
	const manifests: Record<string, string> = {};
	const trees: string[] = [];
	for (const workspace of workspaceRoots(root)) {
		const manifestPath = join(workspace, "package.json");
		const hash = sha256File(manifestPath);
		if (!hash) continue;
		const key = relative(root, manifestPath).split("\\").join("/");
		manifests[key] = hash;
		if (existsSync(join(workspace, "node_modules"))) {
			trees.push(relative(root, workspace).split("\\").join("/"));
		}
	}
	const lockfile = sha256File(join(root, "bun.lock")) ?? "missing";
	return {
		version: FINGERPRINT_VERSION,
		toolchain,
		manifests,
		lockfile,
		trees,
		digest: digestFor({ version: FINGERPRINT_VERSION, toolchain, manifests, lockfile }),
	};
}

export function fingerprintPath(root: string): string {
	return join(root, FINGERPRINT_FILE);
}

export function writeFingerprint(root: string): InstallFingerprint {
	const fingerprint = computeFingerprint(root);
	const path = fingerprintPath(root);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(fingerprint, null, "\t")}\n`);
	return fingerprint;
}

export function readFingerprint(root: string): InstallFingerprint | undefined {
	const path = fingerprintPath(root);
	if (!existsSync(path)) return undefined;
	try {
		return JSON.parse(readFileSync(path, "utf8")) as InstallFingerprint;
	} catch {
		return undefined;
	}
}

export interface FingerprintVerdict {
	ok: boolean;
	detail: string;
}

export function verifyFingerprint(installed: string, target: string): FingerprintVerdict {
	const stored = readFingerprint(installed);
	if (!stored) {
		return {
			ok: false,
			detail: `no install fingerprint in ${fingerprintPath(installed)} — run bun install`,
		};
	}
	if (stored.version !== FINGERPRINT_VERSION) {
		return {
			ok: false,
			detail: `install fingerprint version ${stored.version} is not ${FINGERPRINT_VERSION} — run bun install`,
		};
	}
	const toolchain = currentToolchain();
	if (stored.toolchain !== toolchain) {
		return {
			ok: false,
			detail: `install fingerprint was written by ${stored.toolchain} but ${toolchain} is running — run bun install`,
		};
	}
	if (digestFor(stored) !== stored.digest) {
		return { ok: false, detail: "install fingerprint is corrupt — run bun install" };
	}
	for (const tree of stored.trees ?? []) {
		if (!existsSync(join(installed, tree, "node_modules"))) {
			return {
				ok: false,
				detail: `installed tree ${tree || "."} has no node_modules — run bun install`,
			};
		}
	}
	const computed = computeFingerprint(target, toolchain);
	if (computed.digest !== stored.digest) {
		return {
			ok: false,
			detail:
				`install fingerprint mismatch (stored ${stored.digest.slice(0, 12)} for ${stored.toolchain}, ` +
				`target ${computed.digest.slice(0, 12)} for ${computed.toolchain}) — run bun install`,
		};
	}
	return { ok: true, detail: `install fingerprint matches (${stored.toolchain})` };
}

const args = process.argv.slice(2);
const argValue = (name: string) =>
	args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const command = args.find((arg) => !arg.startsWith("--")) ?? "verify";

if (import.meta.main) {
	const scriptRoot = resolve(import.meta.dir, "../..");
	if (command === "write") {
		const fingerprint = writeFingerprint(scriptRoot);
		console.log(
			`install fingerprint written: ${fingerprint.digest.slice(0, 12)} (${fingerprint.toolchain}, ${Object.keys(fingerprint.manifests).length} manifests)`,
		);
	} else if (command === "verify") {
		const installed = resolve(argValue("installed") ?? scriptRoot);
		const target = resolve(argValue("target") ?? scriptRoot);
		const verdict = verifyFingerprint(installed, target);
		if (!verdict.ok) {
			console.error(`install fingerprint: ${verdict.detail}`);
			process.exit(1);
		}
		console.log(`install fingerprint: ${verdict.detail}`);
	} else if (command === "print") {
		const target = resolve(argValue("target") ?? scriptRoot);
		console.log(JSON.stringify(computeFingerprint(target), null, "\t"));
	} else {
		console.error("install-fingerprint: write|verify|print is required");
		process.exit(2);
	}
}
