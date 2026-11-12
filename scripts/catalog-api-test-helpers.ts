import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect } from "vitest";
import { CATALOG_API_TARGETS, DEFAULT_TSCONFIG, generateCatalogApi } from "./catalog-api";

export const repoRoot = process.cwd();
const fixtureRoots: string[] = [];

afterEach(() => {
	while (fixtureRoots.length > 0) {
		const root = fixtureRoots.pop();
		if (root) {
			rmSync(root, { recursive: true, force: true });
		}
	}
});

export function fixture(
	files: Record<string, string>,
	options?: { compilerOptions?: Record<string, unknown> },
): string {
	const root = mkdtempSync(path.join(tmpdir(), "catalog-api-"));
	fixtureRoots.push(root);
	writeFileSync(
		path.join(root, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				strict: true,
				target: "ES2022",
				module: "ESNext",
				moduleResolution: "bundler",
				jsx: "react-jsx",
				skipLibCheck: true,
				noEmit: true,
				...options?.compilerOptions,
			},
			include: ["./**/*.ts", "./**/*.tsx"],
		}),
	);
	for (const [relative, content] of Object.entries(files)) {
		const absolute = path.join(root, relative);
		mkdirSync(path.dirname(absolute), { recursive: true });
		writeFileSync(absolute, content);
	}
	return root;
}

export function generateFixture(root: string, sourceFile = "widget.ts", slug = "widget") {
	return generateCatalogApi({
		repoRoot: root,
		tsconfigPath: "tsconfig.json",
		targets: [{ slug, sourceFile, propsType: "WidgetProps", surface: "Widget" }],
	});
}

export function fixtureProps(root: string, sourceFile = "widget.ts", slug = "widget") {
	return generateFixture(root, sourceFile, slug)[slug]?.[0]?.props;
}

let productionApiCache: ReturnType<typeof generateCatalogApi> | undefined;

export function generateProductionApi() {
	productionApiCache ??= generateCatalogApi({
		repoRoot,
		tsconfigPath: DEFAULT_TSCONFIG,
		targets: CATALOG_API_TARGETS,
	});
	return productionApiCache;
}

function loadProductionProps() {
	const generated = generateProductionApi();
	const separatelyAssertedMultiSurfaceSlugs = new Set(["input-group", "select"]);
	return Object.fromEntries(
		Object.entries(generated)
			.filter(([slug]) => !separatelyAssertedMultiSurfaceSlugs.has(slug))
			.map(([slug, surfaces]) => {
				expect(surfaces.length, slug).toBeGreaterThan(0);
				return [slug, surfaces[0]?.props ?? []];
			}),
	);
}

let productionPropsCache: ReturnType<typeof loadProductionProps> | undefined;

export function generateProductionProps() {
	productionPropsCache ??= loadProductionProps();
	return productionPropsCache;
}
