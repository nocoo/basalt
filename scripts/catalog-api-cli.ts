import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	checkCatalogApiFiles,
	failCatalogApi,
	generateCatalogApiFiles,
	writeCatalogApiFiles,
} from "./catalog-api";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const mode = process.argv[2];
const files = generateCatalogApiFiles(repoRoot);

if (mode === "generate") {
	writeCatalogApiFiles(repoRoot, files);
} else if (mode === "check") {
	checkCatalogApiFiles(repoRoot, files);
} else {
	failCatalogApi("usage: bun scripts/catalog-api-cli.ts generate|check");
}
