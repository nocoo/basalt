#!/usr/bin/env bun
import { existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { checkTool } from "./tools";

const args = process.argv.slice(2);
const value = (name: string) =>
	args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);

const indexSnapshot = args.includes("--index-snapshot");
const range = value("range");
const snapshotRoot = process.env.GATE_SNAPSHOT_ROOT;

if (indexSnapshot === Boolean(range)) {
	console.error("G1: pass exactly one of --index-snapshot or --range=<a..b>");
	process.exit(2);
}

const sameDir = (first: string | undefined, second: string) => {
	if (!first) return false;
	try {
		return realpathSync(first) === realpathSync(second);
	} catch {
		return false;
	}
};

if (indexSnapshot && !sameDir(snapshotRoot, process.cwd())) {
	console.error(
		`G1: --index-snapshot requires GATE_SNAPSHOT_ROOT to be the current directory (got ${snapshotRoot ?? "unset"})`,
	);
	process.exit(2);
}

const tool = await checkTool("gitleaks");
if (!tool.ok) {
	console.error(`G1: scanner unavailable — ${tool.detail}`);
	process.exit(2);
}

const cwd = process.cwd();
const config = [join(cwd, ".gitleaks.toml")].find((path) => existsSync(path));
if (!config) {
	console.error(`G1: .gitleaks.toml not found in ${cwd}`);
	process.exit(2);
}

const target = range ? `range ${range}` : "index snapshot";
const invocation = range
	? ["gitleaks", "git", `--log-opts=${range}`, "--no-banner", "--redact"]
	: ["gitleaks", "dir", ".", "--no-banner", "--redact"];
invocation.push(`--config=${config}`, `--gitleaks-ignore-path=${cwd}`);

console.log(`G1: gitleaks (${tool.detail}) — ${target} in ${cwd}`);
const proc = Bun.spawn(invocation, { cwd, stdout: "inherit", stderr: "inherit" });
const code = await proc.exited;

if (code === 0) {
	console.log(`G1: 0 leaks in ${target}`);
	process.exit(0);
}
if (code === 1) {
	console.error(`G1: leaks found in ${target}`);
	process.exit(1);
}
console.error(`G1: gitleaks itself failed (exit ${code}) for ${target}`);
process.exit(1);
