import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkSeoFiles, writeSeoFiles } from "./seo";

const mode = process.argv[2];
if (mode !== "generate" && mode !== "check") {
	throw new Error("usage: bun scripts/seo-cli.ts generate|check");
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (mode === "generate") {
	writeSeoFiles(repoRoot);
} else {
	checkSeoFiles(repoRoot);
}
