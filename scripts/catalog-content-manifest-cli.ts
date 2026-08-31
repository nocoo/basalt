import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	checkCatalogContentFamilyFile,
	GENERATED_RELATIVE_PATH,
	generateCatalogContentFamilyModule,
	writeCatalogContentFamilyFile,
} from "./catalog-content-manifest";

const mode = process.argv[2];
if (mode !== "generate" && mode !== "check") {
	throw new Error("usage: bun scripts/catalog-content-manifest-cli.ts generate|check");
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expected = await generateCatalogContentFamilyModule(repoRoot);
const filePath = path.join(repoRoot, GENERATED_RELATIVE_PATH);

if (mode === "generate") {
	writeCatalogContentFamilyFile(filePath, expected);
} else {
	checkCatalogContentFamilyFile(filePath, expected);
}
