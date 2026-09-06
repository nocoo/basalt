import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	checkCatalogApiFiles,
	failCatalogApi,
	generateCatalogApiFiles,
	writeCatalogApiFiles,
} from "./catalog-api";
import { checkSurfaceManifestFreshness, writeSurfaceManifest } from "./catalog-surface-owners";
import { checkAiPackageAssetsFreshness, syncAiPackageAssets } from "./package-registry";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const mode = process.argv[2];
const files = generateCatalogApiFiles(repoRoot);

if (mode === "generate") {
	writeCatalogApiFiles(repoRoot, files);
	writeSurfaceManifest(repoRoot);
	syncAiPackageAssets(repoRoot);
} else if (mode === "check") {
	checkCatalogApiFiles(repoRoot, files);
	checkSurfaceManifestFreshness(repoRoot);
	checkAiPackageAssetsFreshness(repoRoot);
} else {
	failCatalogApi("usage: bun scripts/catalog-api-cli.ts generate|check");
}
