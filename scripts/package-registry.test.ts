import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../src/pages/ui/catalog";
import {
	checkAiPackageAssetsFreshness,
	generatePackageRegistry,
	mapToPackageDoc,
	syncAiPackageAssets,
	validatePackageDocReferences,
} from "./package-registry";

describe("package registry generator and AI package assets", () => {
	it("derives complete package registry with all 110 modules and 99 ready catalog entries", () => {
		const registry = generatePackageRegistry();

		const rootPkg = JSON.parse(readFileSync("package.json", "utf8")) as {
			version: string;
		};
		expect(registry.packageName).toBe("@nocoo/basalt");
		expect(registry.packageVersion).toBe(rootPkg.version);
		expect(registry.totalModules).toBe(110);
		expect(registry.totalSymbols).toBe(685);
		expect(registry.totalValues).toBe(375);
		expect(registry.totalTypes).toBe(310);
		expect(registry.totalCssExports).toBe(3);
		expect(registry.totalCatalogEntries).toBe(99);

		// Catalog entries completeness
		expect(registry.catalogEntries).toHaveLength(99);
		for (const cat of registry.catalogEntries) {
			expect(cat.slug.length).toBeGreaterThan(0);
			expect(cat.name.length).toBeGreaterThan(0);
			expect(cat.exportName.length).toBeGreaterThan(0);
			expect(cat.importPath.startsWith("@nocoo/basalt")).toBe(true);
			expect(cat.sourceFile.startsWith("packages/basalt/src/")).toBe(true);
			expect(cat.sourceHash).toHaveLength(16);
			expect(cat.packageDoc).toBe(`ai/registry.json#${cat.slug}`);
			expect(Array.isArray(cat.api)).toBe(true);
			expect(cat.api.length).toBeGreaterThan(0);
		}

		// CSS exports
		expect(registry.cssExports).toHaveLength(3);
		expect(registry.cssExports.map((c) => c.contract)).toEqual([
			"tailwind",
			"tailwind",
			"standalone",
		]);
	});

	it("preserves full Toast callable API and Toaster props in registry", () => {
		const registry = generatePackageRegistry();
		const toastCat = registry.catalogEntries.find((c) => c.slug === "toast");
		expect(toastCat).toBeDefined();
		expect(toastCat?.api).toHaveLength(7);

		const toasterSurface = toastCat?.api.find((s) => s.name === "Toaster");
		expect(toasterSurface).toBeDefined();
		expect(toasterSurface?.props.length).toBe(21);

		const toastCallable = toastCat?.api.find((s) => s.name === "toast");
		expect(toastCallable).toBeDefined();
		expect(toastCallable?.callSignature).toBe(
			"toast(message: React.ReactNode, options?: ToastCallOptions): number | string",
		);
		expect(toastCallable?.options?.name).toBe("ToastCallOptions");
		expect(toastCallable?.options?.props.map((p) => p.name)).toContain("variant");

		const successCallable = toastCat?.api.find((s) => s.name === "toast.success");
		expect(successCallable).toBeDefined();
		expect(successCallable?.options?.name).toBe("ToastOptions");

		const dismissCallable = toastCat?.api.find((s) => s.name === "toast.dismiss");
		expect(dismissCallable).toBeDefined();
		expect(dismissCallable?.description).toContain("returns `undefined` at runtime");
	});

	it("accurately derives rootAvailable per catalog entry from hasRootBarrel and symbols", () => {
		const registry = generatePackageRegistry();

		const buttonCat = registry.catalogEntries.find((c) => c.slug === "button");
		expect(buttonCat?.rootAvailable).toBe(true);

		const linkButtonCat = registry.catalogEntries.find((c) => c.slug === "link-button");
		expect(linkButtonCat?.rootAvailable).toBe(false);

		const codeCat = registry.catalogEntries.find((c) => c.slug === "code");
		expect(codeCat?.rootAvailable).toBe(false);

		const codeBlockCat = registry.catalogEntries.find((c) => c.slug === "code-block");
		expect(codeBlockCat?.rootAvailable).toBe(false);

		const radioCat = registry.catalogEntries.find((c) => c.slug === "radio");
		expect(radioCat?.rootAvailable).toBe(false);

		for (const cat of registry.catalogEntries) {
			const cEntry = CATALOG.find((c) => c.slug === cat.slug);
			expect(cat.rootAvailable).toBe(Boolean(cEntry?.hasRootBarrel));
		}
	});

	it("accurately identifies modules with co-located catalog entries (e.g. Button/LinkButton, Code/CodeBlock)", () => {
		const registry = generatePackageRegistry();

		const buttonMod = registry.modules.find(
			(m) => m.importPath === "@nocoo/basalt/components/button",
		);
		expect(buttonMod).toBeDefined();
		expect(buttonMod?.catalogEntries).toHaveLength(2);
		expect(buttonMod?.catalogEntries?.map((c) => c.slug)).toEqual(["button", "link-button"]);
		expect(buttonMod?.catalogEntries?.find((c) => c.slug === "button")?.rootAvailable).toBe(true);
		expect(buttonMod?.catalogEntries?.find((c) => c.slug === "link-button")?.rootAvailable).toBe(
			false,
		);

		const codeMod = registry.modules.find((m) => m.importPath === "@nocoo/basalt/components/code");
		expect(codeMod).toBeDefined();
		expect(codeMod?.catalogEntries).toHaveLength(2);
		expect(codeMod?.catalogEntries?.map((c) => c.slug)).toEqual(["code", "code-block"]);
	});

	it("accurately reports optional peers without false positives", () => {
		const registry = generatePackageRegistry();

		const rootMod = registry.modules.find((m) => m.subpath === ".");
		expect(rootMod?.optionalPeers).toEqual([]);

		const datePickerMod = registry.modules.find(
			(m) => m.importPath === "@nocoo/basalt/components/date-picker",
		);
		expect(datePickerMod?.optionalPeers).toEqual([]);

		const dataTableMod = registry.modules.find(
			(m) => m.importPath === "@nocoo/basalt/components/data-table",
		);
		expect(dataTableMod?.optionalPeers).toEqual([]);

		const rechartsModules = registry.modules.filter((m) => m.optionalPeers.includes("recharts"));
		expect(rechartsModules).toHaveLength(17);
		for (const rm of rechartsModules) {
			expect(rm.importPath.startsWith("@nocoo/basalt/charts/")).toBe(true);
		}
	});

	it("maps repository docs to published in-package paths", () => {
		expect(mapToPackageDoc("INTEGRATION.md#appheader-and-breadcrumbs")).toBe(
			"ai/INTEGRATION.md#appheader-and-breadcrumbs",
		);
		expect(mapToPackageDoc("README.md#css-setup")).toBe("README.md#css-setup");
		expect(mapToPackageDoc("packages/basalt/ai/COMPATIBILITY.md#chart-config")).toBe(
			"ai/COMPATIBILITY.md#chart-config",
		);
		expect(mapToPackageDoc("src/pages/ui/button")).toBe("ai/registry.json#button");
	});

	it("passes asset freshness check on sync", () => {
		expect(() => checkAiPackageAssetsFreshness()).not.toThrow();
	});

	describe("isolated negative regression fixtures for registry freshness & validation", () => {
		function createIsolatedFixture(modifier?: (fixtureDir: string) => void): string {
			const tempRoot = mkdtempSync(path.join(tmpdir(), "basalt-registry-fixture-"));
			// Copy minimal structure needed for generatePackageRegistry and freshness checks
			const filesToCopy = [
				"package.json",
				"biome.json",
				"INTEGRATION.md",
				"packages/basalt/package.json",
				"packages/basalt/README.md",
				"packages/basalt/ai/COMPATIBILITY.md",
				"packages/basalt/ai/registry.json",
				"packages/basalt/ai/USAGE.md",
				"packages/basalt/ai/INTEGRATION.md",
				"packages/basalt/ai/sources.json",
				"src/pages/ui/generated/catalog-source-files.ts",
			];

			for (const rel of filesToCopy) {
				const src = path.join(process.cwd(), rel);
				const dst = path.join(tempRoot, rel);
				mkdirSync(path.dirname(dst), { recursive: true });
				cpSync(src, dst);
			}

			// Copy packages/basalt/src directory (needed by manifest discovery and AST scanning)
			cpSync(
				path.join(process.cwd(), "packages/basalt/src"),
				path.join(tempRoot, "packages/basalt/src"),
				{ recursive: true },
			);

			// Copy src/pages/ui/generated/catalog-api directory
			cpSync(
				path.join(process.cwd(), "src/pages/ui/generated/catalog-api"),
				path.join(tempRoot, "src/pages/ui/generated/catalog-api"),
				{ recursive: true },
			);

			if (modifier) {
				modifier(tempRoot);
			}

			return tempRoot;
		}

		it("rejects version drift between root package.json and packages/basalt/package.json", () => {
			const fixture = createIsolatedFixture((dir) => {
				const pkgPath = path.join(dir, "packages/basalt/package.json");
				const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
				pkg.version = "9.9.9";
				writeFileSync(pkgPath, JSON.stringify(pkg, null, "\t"));
			});
			try {
				expect(() => generatePackageRegistry(fixture)).toThrow(
					/Version mismatch between root package.json/,
				);
			} finally {
				rmSync(fixture, { recursive: true, force: true });
			}
		});

		it("rejects missing packages/basalt/ai/sources.json in freshness check", () => {
			const fixture = createIsolatedFixture((dir) => {
				rmSync(path.join(dir, "packages/basalt/ai/sources.json"));
			});
			try {
				expect(() => checkAiPackageAssetsFreshness(fixture)).toThrow(
					/Missing packages\/basalt\/ai\/sources\.json/,
				);
			} finally {
				rmSync(fixture, { recursive: true, force: true });
			}
		});

		it("rejects stale content in packages/basalt/ai/sources.json in freshness check", () => {
			const fixture = createIsolatedFixture((dir) => {
				const p = path.join(dir, "packages/basalt/ai/sources.json");
				writeFileSync(p, JSON.stringify({ stale: true }));
			});
			try {
				expect(() => checkAiPackageAssetsFreshness(fixture)).toThrow(
					/Stale packages\/basalt\/ai\/sources\.json/,
				);
			} finally {
				rmSync(fixture, { recursive: true, force: true });
			}
		});

		it("rejects stale packages/basalt/ai/registry.json in freshness check", () => {
			const fixture = createIsolatedFixture((dir) => {
				const p = path.join(dir, "packages/basalt/ai/registry.json");
				const json = JSON.parse(readFileSync(p, "utf8")) as { totalModules: number };
				json.totalModules = 0;
				writeFileSync(p, JSON.stringify(json, null, "\t"));
			});
			try {
				expect(() => checkAiPackageAssetsFreshness(fixture)).toThrow(
					/Stale packages\/basalt\/ai\/registry\.json/,
				);
			} finally {
				rmSync(fixture, { recursive: true, force: true });
			}
		});

		it("rejects invalid or missing packageDoc markdown anchors", () => {
			const registry = generatePackageRegistry();
			// Add a fictitious invalid markdown anchor reference
			registry.modules[0].packageDoc = "README.md#non-existent-anchor-for-test";
			expect(() => validatePackageDocReferences(registry)).toThrow(
				/Package doc validation error: missing anchor '#non-existent-anchor-for-test'/,
			);
		});

		it("rejects invalid or missing packageDoc json anchors", () => {
			const registry = generatePackageRegistry();
			// Add a fictitious invalid catalog entry json anchor reference
			registry.modules[0].packageDoc = "ai/registry.json#non-existent-slug-xyz";
			expect(() => validatePackageDocReferences(registry)).toThrow(
				/Package doc validation error: anchor #non-existent-slug-xyz not found/,
			);
		});

		// Full isolated tree copy, registry generation, freshness check and baseline comparison
		// takes ~5.6s - 6.7s under coverage instrumentation, exceeding default 5s budget.
		it("syncAiPackageAssets correctly synchronizes bumped version while keeping public-api-baseline byte-identical", () => {
			// Copy public-api-baseline into isolated fixture to verify byte-invariance
			const fixture = createIsolatedFixture((dir) => {
				const baselineSrc = path.join(process.cwd(), "packages/basalt/public-api-baseline.json");
				const baselineDst = path.join(dir, "packages/basalt/public-api-baseline.json");
				cpSync(baselineSrc, baselineDst);

				// Bump version in both root and package package.json to 9.8.7
				const rootPkgPath = path.join(dir, "package.json");
				const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8")) as { version: string };
				rootPkg.version = "9.8.7";
				writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, "\t"));

				const pkgPath = path.join(dir, "packages/basalt/package.json");
				const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
				pkg.version = "9.8.7";
				writeFileSync(pkgPath, JSON.stringify(pkg, null, "\t"));
			});

			try {
				const baselinePath = path.join(fixture, "packages/basalt/public-api-baseline.json");
				const baselineBytesBefore = readFileSync(baselinePath);

				// Run sync on the bumped fixture
				syncAiPackageAssets(fixture);

				// Verify assets freshness passes
				expect(() => checkAiPackageAssetsFreshness(fixture)).not.toThrow();

				// Verify registry.json has bumped version
				const registryJson = JSON.parse(
					readFileSync(path.join(fixture, "packages/basalt/ai/registry.json"), "utf8"),
				) as { packageVersion: string };
				expect(registryJson.packageVersion).toBe("9.8.7");

				// Verify baseline bytes remain 100% byte-identical
				const baselineBytesAfter = readFileSync(baselinePath);
				expect(baselineBytesAfter.equals(baselineBytesBefore)).toBe(true);
			} finally {
				rmSync(fixture, { recursive: true, force: true });
			}
		}, 15000);
	});
});
