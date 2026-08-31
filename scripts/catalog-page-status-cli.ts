import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	checkCatalogPageStatusFile,
	GENERATED_RELATIVE_PATH,
	generateCatalogPageStatusModule,
	writeCatalogPageStatusFile,
} from "./catalog-page-status";

const mode = process.argv[2];
if (mode !== "generate" && mode !== "check") {
	throw new Error("usage: bun scripts/catalog-page-status-cli.ts generate|check");
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expected = await generateCatalogPageStatusModule(repoRoot);
const filePath = path.join(repoRoot, GENERATED_RELATIVE_PATH);

if (mode === "generate") {
	writeCatalogPageStatusFile(filePath, expected);
} else {
	checkCatalogPageStatusFile(filePath, expected);
}
