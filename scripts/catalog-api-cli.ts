import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	checkCatalogApiFile,
	failCatalogApi,
	GENERATED_RELATIVE_PATH,
	generateCatalogApiModule,
	writeCatalogApiFile,
} from "./catalog-api";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const mode = process.argv[2];
const expected = generateCatalogApiModule(repoRoot);
const filePath = path.join(repoRoot, GENERATED_RELATIVE_PATH);

if (mode === "generate") {
	writeCatalogApiFile(filePath, expected);
} else if (mode === "check") {
	checkCatalogApiFile(filePath, expected);
} else {
	failCatalogApi("usage: bun scripts/catalog-api-cli.ts generate|check");
}
