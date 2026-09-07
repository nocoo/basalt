import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { CATALOG } from "../src/pages/ui/catalog";
import { derivePublicSurfaceManifest } from "./catalog-surface-owners";
import {
	checkAiPackageAssetsFreshness,
	formatJsonDeterministic,
	generatePackageRegistry,
	mapToPackageDoc,
	syncAiPackageAssets,
	validatePackageDocReferences,
} from "./package-registry";

describe("package registry generator and AI package assets", () => {
	let referenceManifest: ReturnType<typeof derivePublicSurfaceManifest>;
	let referenceRegistry: ReturnType<typeof generatePackageRegistry>;

	// Parse the real export graph once for read-only assertions. Mutating cases receive
	// their own clone; freshness fixtures still perform independent filesystem scans.
	beforeAll(() => {
		referenceManifest = derivePublicSurfaceManifest();
		referenceRegistry = generatePackageRegistry(process.cwd(), referenceManifest);
	}, 30_000);

	it("derives complete package registry with all 122 modules and 111 ready catalog entries", () => {
		const registry = structuredClone(referenceRegistry);

		const rootPkg = JSON.parse(readFileSync("package.json", "utf8")) as {
			version: string;
		};
		expect(registry.packageName).toBe("@nocoo/basalt");
		expect(registry.packageVersion).toBe(rootPkg.version);
		expect(registry.totalModules).toBe(122);
		expect(registry.totalSymbols).toBe(741);
		expect(registry.totalValues).toBe(395);
		expect(registry.totalTypes).toBe(346);
		expect(registry.totalCssExports).toBe(3);
		expect(registry.totalCatalogEntries).toBe(111);

		// Catalog entries completeness
		expect(registry.catalogEntries).toHaveLength(111);
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
		const registry = structuredClone(referenceRegistry);
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
		const registry = structuredClone(referenceRegistry);

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
		const registry = structuredClone(referenceRegistry);

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
		const registry = structuredClone(referenceRegistry);

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

	it("formats valid JSON deterministically using the pinned local formatter and rejects malformed input", () => {
		const raw = '{\n"z": 1,\n "a":  [2,3]\n}\n';
		const formatted = formatJsonDeterministic(raw, "test.json");
		expect(formatted).toBe('{\n\t"z": 1,\n\t"a": [2, 3]\n}\n');

		// Malformed JSON must throw
		expect(() => formatJsonDeterministic('{\n"unclosed": \n', "bad.json")).toThrow();
	});

	it("invokes the pinned local formatter independently of external bunx binaries in PATH", () => {
		const fakeBinDir = mkdtempSync(path.join(tmpdir(), "basalt-fake-bunx-"));
		const fakeBunx = path.join(fakeBinDir, "bunx");
		// Create a fake bunx executable in PATH that exits with 86
		writeFileSync(fakeBunx, "#!/bin/sh\nexit 86\n", { mode: 0o755 });

		const oldPath = process.env.PATH;
		try {
			process.env.PATH = `${fakeBinDir}:${oldPath}`;
			const raw = '{\n"test": 123\n}\n';
			// Must succeed and not invoke fake bunx
			const formatted = formatJsonDeterministic(raw, "probe.json");
			expect(formatted).toBe('{\n\t"test": 123\n}\n');
		} finally {
			process.env.PATH = oldPath;
			rmSync(fakeBinDir, { recursive: true, force: true });
		}
	});

	it("passes asset freshness check on sync", () => {
		expect(() => checkAiPackageAssetsFreshness()).not.toThrow();
	}, 30_000);

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
		}, 30_000);

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
		}, 30_000);

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
		}, 30_000);

		it("rejects invalid or missing packageDoc markdown anchors", () => {
			const registry = structuredClone(referenceRegistry);
			// Add a fictitious invalid markdown anchor reference
			registry.modules[0].packageDoc = "README.md#non-existent-anchor-for-test";
			expect(() => validatePackageDocReferences(registry)).toThrow(
				/Package doc validation error: missing anchor '#non-existent-anchor-for-test'/,
			);
		});

		it("rejects invalid or missing packageDoc json anchors", () => {
			const registry = structuredClone(referenceRegistry);
			// Add a fictitious invalid catalog entry json anchor reference
			registry.modules[0].packageDoc = "ai/registry.json#non-existent-slug-xyz";
			expect(() => validatePackageDocReferences(registry)).toThrow(
				/Package doc validation error: anchor #non-existent-slug-xyz not found/,
			);
		});

		it("preserves isolation and detects file modifications across distinct validation calls without persistent cache leakage", () => {
			const registry = structuredClone(referenceRegistry);
			// Baseline passes
			expect(() => validatePackageDocReferences(registry)).not.toThrow();

			const tempDocRoot = mkdtempSync(path.join(tmpdir(), "basalt-doc-freshness-"));
			try {
				const tempPkgDir = path.join(tempDocRoot, "packages/basalt");
				mkdirSync(path.join(tempPkgDir, "ai"), { recursive: true });

				// 1. Markdown documents: multiple anchors, dynamic edit and recovery
				const mockRegistry = {
					...registry,
					modules: [
						{
							...registry.modules[0],
							packageDoc: "ai/test-doc.md#valid-anchor-1",
							symbols: [
								{
									...registry.modules[0].symbols[0],
									packageDoc: "ai/test-doc.md#valid-anchor-2",
								},
							],
						},
					],
					cssExports: [],
					catalogEntries: [],
				};

				const testDocPath = path.join(tempPkgDir, "ai/test-doc.md");
				writeFileSync(
					testDocPath,
					"# Guide\n\n<a id='valid-anchor-1'></a>\n<a id='valid-anchor-2'></a>\n",
				);

				// First call with all valid anchors passes
				expect(() => validatePackageDocReferences(mockRegistry, tempDocRoot)).not.toThrow();

				// Subsequent call with modified content removing one anchor throws immediately
				writeFileSync(
					testDocPath,
					"# Guide\n\n<a id='valid-anchor-1'></a>\n<a id='different-anchor'></a>\n",
				);
				expect(() => validatePackageDocReferences(mockRegistry, tempDocRoot)).toThrow(
					/Package doc validation error: missing anchor '#valid-anchor-2'/,
				);

				// Restoring file content allows next call to pass
				writeFileSync(
					testDocPath,
					"# Guide\n\n<a id='valid-anchor-1'></a>\n<a id='valid-anchor-2'></a>\n",
				);
				expect(() => validatePackageDocReferences(mockRegistry, tempDocRoot)).not.toThrow();

				// 2. JSON documents: multiple catalog entry slug anchors, dynamic edit and recovery
				const testJsonPath = path.join(tempPkgDir, "ai/registry.json");
				const jsonContent = {
					catalogEntries: [{ slug: "button" }, { slug: "input" }],
				};
				writeFileSync(testJsonPath, JSON.stringify(jsonContent));

				const jsonMockRegistry = {
					...registry,
					modules: [
						{
							...registry.modules[0],
							packageDoc: "ai/registry.json#button",
							symbols: [
								{
									...registry.modules[0].symbols[0],
									packageDoc: "ai/registry.json#input",
								},
							],
						},
					],
					cssExports: [],
					catalogEntries: [],
				};

				// Initial check with both anchors passes
				expect(() => validatePackageDocReferences(jsonMockRegistry, tempDocRoot)).not.toThrow();

				// Removing 'input' slug in next call throws missing anchor
				writeFileSync(testJsonPath, JSON.stringify({ catalogEntries: [{ slug: "button" }] }));
				expect(() => validatePackageDocReferences(jsonMockRegistry, tempDocRoot)).toThrow(
					/Package doc validation error: anchor #input not found/,
				);

				// Restoring JSON passes on next call
				writeFileSync(testJsonPath, JSON.stringify(jsonContent));
				expect(() => validatePackageDocReferences(jsonMockRegistry, tempDocRoot)).not.toThrow();
			} finally {
				rmSync(tempDocRoot, { recursive: true, force: true });
			}
		});

		it("detects source modifications in subsequent generation calls, terminates cycles, and keeps entry visited sets independent", () => {
			const fixture = createIsolatedFixture();
			try {
				// The copied exports and declarations match the real repo. Reuse their
				// relative-path manifest, but rescan modified source imports on every call.
				const surfaceManifest = structuredClone(referenceManifest);
				const baseline = generatePackageRegistry(fixture, surfaceManifest);
				const buttonBefore = baseline.modules.find(
					(m) => m.importPath === "@nocoo/basalt/components/button",
				);
				const paletteBefore = baseline.modules.find(
					(m) => m.importPath === "@nocoo/basalt/charts/palette",
				);
				expect(buttonBefore?.optionalPeers).not.toContain("recharts");

				const cnPath = path.join(fixture, "packages/basalt/src/utils/cn.ts");
				const controlPath = path.join(fixture, "packages/basalt/src/utils/control-surface.ts");
				const originalCn = readFileSync(cnPath, "utf8");
				const originalControl = readFileSync(controlPath, "utf8");

				// Create mutual circular import between cn and control-surface, and introduce recharts into control-surface
				writeFileSync(cnPath, `${originalCn}\nimport "./control-surface";\n`);
				writeFileSync(controlPath, `${originalControl}\nimport "./cn";\nimport "recharts";\n`);

				// Subsequent generatePackageRegistry on the exact same repoRoot fixture reusing surfaceManifest
				const updated = generatePackageRegistry(fixture, surfaceManifest);
				const buttonAfter = updated.modules.find(
					(m) => m.importPath === "@nocoo/basalt/components/button",
				);
				const rootAfter = updated.modules.find((m) => m.importPath === "@nocoo/basalt");
				const paletteAfter = updated.modules.find(
					(m) => m.importPath === "@nocoo/basalt/charts/palette",
				);

				// Button and root transitively depend on cn/control-surface, so they receive recharts
				expect(buttonAfter?.optionalPeers).toContain("recharts");
				expect(rootAfter?.optionalPeers).toContain("recharts");

				// Unrelated palette does not depend on cn/control-surface and must NOT be polluted
				expect(paletteAfter?.optionalPeers).toEqual(paletteBefore?.optionalPeers);

				// Restore sources
				writeFileSync(cnPath, originalCn);
				writeFileSync(controlPath, originalControl);

				// Restoring sources returns exact baseline output on subsequent call
				const restored = generatePackageRegistry(fixture, surfaceManifest);
				expect(restored).toEqual(baseline);

				// Second repoRoot remains fresh and equal to baseline
				const secondFixture = createIsolatedFixture();
				try {
					expect(generatePackageRegistry(secondFixture, surfaceManifest)).toEqual(baseline);
				} finally {
					rmSync(secondFixture, { recursive: true, force: true });
				}
			} finally {
				rmSync(fixture, { recursive: true, force: true });
			}
		}, 30_000);

		// Two full AST scans plus an isolated tree copy exceed the interaction-test
		// budget on CI runners under coverage instrumentation.
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
		}, 60_000);
	});
});
