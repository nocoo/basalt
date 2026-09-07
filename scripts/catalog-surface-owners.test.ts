import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	checkSurfaceManifestFreshness,
	derivePublicSurfaceManifest,
	validateSurfaceManifestDocs,
	writeSurfaceManifest,
} from "./catalog-surface-owners";

const fixtureRoots: string[] = [];

afterEach(() => {
	while (fixtureRoots.length > 0) {
		const root = fixtureRoots.pop();
		if (root) {
			rmSync(root, { recursive: true, force: true });
		}
	}
});

function createIsolatedRepoFixture(
	files: Record<string, string> = {},
	exportsExtra: Record<string, unknown> = {},
): string {
	const root = mkdtempSync(path.join(tmpdir(), "basalt-surface-fixture-"));
	fixtureRoots.push(root);

	const all: Record<string, string> = {
		"package.json": JSON.stringify({ type: "module" }),
		"packages/basalt/package.json": JSON.stringify({
			name: "@nocoo/basalt",
			version: "2.0.3",
			exports: {
				".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
				"./components/*": { types: "./dist/components/*.d.ts", import: "./dist/components/*.js" },
				"./styles": "./dist/styles/tailwind.css",
				"./styles/tailwind": "./dist/styles/tailwind.css",
				"./styles/standalone": "./dist/styles/standalone.css",
				...exportsExtra,
			},
		}),
		"tsconfig.catalog-api.json": JSON.stringify({
			compilerOptions: {
				target: "ES2022",
				module: "ESNext",
				moduleResolution: "Bundler",
				strict: true,
				skipLibCheck: true,
				jsx: "react-jsx",
				types: [],
			},
			include: ["packages/basalt/src"],
		}),
		"packages/basalt/src/index.ts": 'export { Button } from "./components/button";\n',
		"packages/basalt/src/components/button.tsx":
			"export function Button() { return null; }\nexport type ButtonProps = { label?: string };\n",
		"README.md": "# Basalt\n\n## Component usage\n\n## CSS setup\n",
		...files,
	};

	for (const [rel, data] of Object.entries(all)) {
		const abs = path.join(root, rel);
		mkdirSync(path.dirname(abs), { recursive: true });
		writeFileSync(abs, data);
	}

	return root;
}

describe("public surface documentation ownership and freshness", () => {
	// Reusable test fixture for actual repo inspection across read-only inspection cases
	const getActualRepoManifest = (() => {
		let cached: ReturnType<typeof derivePublicSurfaceManifest> | null = null;
		return () => {
			if (!cached) {
				cached = derivePublicSurfaceManifest();
			}
			return cached;
		};
	})();

	it("derives complete public surface manifest for the actual repo", () => {
		const rootPkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as {
			version: string;
		};
		const manifest = getActualRepoManifest();

		expect(manifest.packageVersion).toBe(rootPkg.version);
		expect(manifest.totalModules).toBe(111);
		expect(manifest.totalSymbols).toBe(703);
		expect(manifest.totalValues).toBe(379);
		expect(manifest.totalTypes).toBe(324);
		expect(manifest.totalCssExports).toBe(3);

		// Every module must have valid documentation ownership
		for (const mod of manifest.modules) {
			expect(mod.ownerDoc.length).toBeGreaterThan(0);
			expect(mod.ownerKind).toMatch(
				/catalog-component|framework-chrome|provider|chart-subsystem|legacy-internal/,
			);
			expect(mod.summary.length).toBeGreaterThan(0);

			for (const sym of mod.symbols) {
				expect(sym.ownerDoc.length).toBeGreaterThan(0);
				expect(sym.originModule.length).toBeGreaterThan(0);
			}
		}

		// CSS exports verification
		expect(manifest.cssExports).toHaveLength(3);
		for (const css of manifest.cssExports) {
			expect(css.ownerDoc).toBe("README.md#css-setup");
			expect(css.ownerKind).toBe("stylesheet");
		}
	});

	it("traces root re-exports to origin component modules and documentation owners", () => {
		const manifest = getActualRepoManifest();
		const rootMod = manifest.modules.find((m) => m.subpath === ".");
		expect(rootMod).toBeDefined();

		const buttonSym = rootMod?.symbols.find((s) => s.name === "Button");
		expect(buttonSym?.originModule).toBe("@nocoo/basalt/components/button");
		expect(buttonSym?.ownerDoc).toBe("src/pages/ui/button");

		const themeProviderSym = rootMod?.symbols.find((s) => s.name === "ThemeProvider");
		expect(themeProviderSym?.originModule).toBe("@nocoo/basalt/providers/theme");
		expect(themeProviderSym?.ownerDoc).toBe("src/pages/ui/theme-provider");

		const compoundSubSym = rootMod?.symbols.find((s) => s.name === "AlertDialogAction");
		expect(compoundSubSym?.originModule).toBe("@nocoo/basalt/components/alert-dialog");
		expect(compoundSubSym?.ownerDoc).toBe("src/pages/ui/alert-dialog");
	});

	it("resolves specific catalog slug by longest exportName prefix for shared source modules", () => {
		const manifest = getActualRepoManifest();

		// button.tsx hosts both Button and LinkButton
		const buttonMod = manifest.modules.find((m) => m.subpath === "./components/button");
		expect(buttonMod).toBeDefined();

		const buttonPropSym = buttonMod?.symbols.find((s) => s.name === "ButtonProps");
		const linkButtonPropSym = buttonMod?.symbols.find((s) => s.name === "LinkButtonProps");
		const buttonVariantsSym = buttonMod?.symbols.find((s) => s.name === "buttonVariants");

		expect(buttonPropSym?.ownerDoc).toBe("src/pages/ui/button");
		expect(linkButtonPropSym?.ownerDoc).toBe("src/pages/ui/link-button");
		expect(buttonVariantsSym?.ownerDoc).toBe("src/pages/ui/button");

		// code.tsx hosts both Code and CodeBlock
		const codeMod = manifest.modules.find((m) => m.subpath === "./components/code");
		expect(codeMod).toBeDefined();

		const codeSym = codeMod?.symbols.find((s) => s.name === "Code");
		const codeBlockSym = codeMod?.symbols.find((s) => s.name === "CodeBlock");
		const codeBlockPropsSym = codeMod?.symbols.find((s) => s.name === "CodeBlockProps");

		expect(codeSym?.ownerDoc).toBe("src/pages/ui/code");
		expect(codeBlockSym?.ownerDoc).toBe("src/pages/ui/code-block");
		expect(codeBlockPropsSym?.ownerDoc).toBe("src/pages/ui/code-block");
	});

	it("preserves exact type and value identity through star exports", () => {
		const fixtureRoot = createIsolatedRepoFixture({
			"packages/basalt/src/index.ts": 'export * from "./components/button";\n',
		});

		const manifest = derivePublicSurfaceManifest(fixtureRoot);
		const rootMod = manifest.modules.find((m) => m.subpath === ".");
		expect(rootMod).toBeDefined();

		const typeSym = rootMod?.symbols.find((s) => s.name === "ButtonProps");
		const valSym = rootMod?.symbols.find((s) => s.name === "Button");

		expect(typeSym).toBeDefined();
		expect(typeSym?.isType).toBe(true);
		expect(typeSym?.isValue).toBe(false);

		expect(valSym).toBeDefined();
		expect(valSym?.isType).toBe(false);
		expect(valSym?.isValue).toBe(true);
	});

	it("respects explicit null subpath overrides in package exports", () => {
		const fixtureRoot = createIsolatedRepoFixture({}, { "./components/button": null });
		const manifest = derivePublicSurfaceManifest(fixtureRoot);

		expect(manifest.modules.some((m) => m.subpath === "./components/button")).toBe(false);
	});

	it("fails fast when an unowned helper is added inside a known catalog module", () => {
		const fixtureRoot = createIsolatedRepoFixture({
			"packages/basalt/src/components/button.tsx":
				"export function Button() { return null; }\nexport type ButtonProps = { label?: string };\nexport const __AuditUnownedHelper = 1;\n",
		});

		expect(() => derivePublicSurfaceManifest(fixtureRoot)).toThrow(
			/unowned public helper or symbol '__AuditUnownedHelper' in '@nocoo\/basalt\/components\/button'/,
		);
	});

	it("fails fast when an unowned helper is added directly to root export", () => {
		const fixtureRoot = createIsolatedRepoFixture({
			"packages/basalt/src/index.ts":
				'export { Button } from "./components/button";\nexport const __AuditRootHelper = 1;\n',
		});

		expect(() => derivePublicSurfaceManifest(fixtureRoot)).toThrow(
			/unowned public symbol '__AuditRootHelper' re-exported on root/,
		);
	});

	it("fails fast when an unowned explicit alias export is declared in package.json", () => {
		const fixtureRoot = createIsolatedRepoFixture(
			{},
			{
				"./audit-button": {
					types: "./dist/components/button.d.ts",
					import: "./dist/components/button.js",
				},
			},
		);

		expect(() => derivePublicSurfaceManifest(fixtureRoot)).toThrow(
			/unowned public module surface: '@nocoo\/basalt\/audit-button'/,
		);
	});

	it("fails fast when an unknown wildcard category is added without registration", () => {
		const fixtureRoot = createIsolatedRepoFixture(
			{
				"packages/basalt/src/extensions/audit.ts": "export const AuditWidget = 1;\n",
			},
			{
				"./extensions/*": {
					types: "./dist/extensions/*.d.ts",
					import: "./dist/extensions/*.js",
				},
			},
		);

		expect(() => derivePublicSurfaceManifest(fixtureRoot)).toThrow(
			/unowned public module surface: '@nocoo\/basalt\/extensions\/audit'/,
		);
	});

	it("fails fast when a redirected public export target resolves to actual source with unowned helper", () => {
		const fixtureRoot = createIsolatedRepoFixture(
			{
				"packages/basalt/src/lib/audit-button.ts": "export const __AuditRedirectedHelper = 1;\n",
			},
			{
				"./components/button": {
					types: "./dist/lib/audit-button.d.ts",
					import: "./dist/lib/audit-button.js",
				},
			},
		);

		expect(() => derivePublicSurfaceManifest(fixtureRoot)).toThrow(
			/unowned public helper or symbol '__AuditRedirectedHelper' in '@nocoo\/basalt\/components\/button'/,
		);
	});

	it("fails fast when an aliased wildcard category is declared without module ownership registration", () => {
		const fixtureRoot = createIsolatedRepoFixture(
			{},
			{
				"./widgets/*": {
					types: "./dist/components/*.d.ts",
					import: "./dist/components/*.js",
				},
			},
		);

		expect(() => derivePublicSurfaceManifest(fixtureRoot)).toThrow(
			/unowned public module surface: '@nocoo\/basalt\/widgets\/button'/,
		);
	});

	it("fails fast when an unowned helper is added inside a registered legacy/internal module", () => {
		const fixtureRoot = createIsolatedRepoFixture({
			"packages/basalt/src/components/overlay.ts":
				"export const OVERLAY_GAP = 4;\nexport const __AuditUnownedLegacyHelper = 1;\n",
		});

		expect(() => derivePublicSurfaceManifest(fixtureRoot)).toThrow(
			/unowned public helper or symbol '__AuditUnownedLegacyHelper' in registered non-catalog module '@nocoo\/basalt\/components\/overlay'/,
		);
	});

	it("suppresses runtime value identity for explicit type-only re-exports", () => {
		const fixtureRoot = createIsolatedRepoFixture({
			"packages/basalt/src/index.ts": 'export type { Button } from "./components/button";\n',
		});

		const manifest = derivePublicSurfaceManifest(fixtureRoot);
		const rootMod = manifest.modules.find((m) => m.subpath === ".");
		const buttonSym = rootMod?.symbols.find((s) => s.name === "Button");

		expect(buttonSym).toBeDefined();
		expect(buttonSym?.isValue).toBe(false);
		expect(buttonSym?.isType).toBe(true);
	});

	it("fails fast when generated surface manifest is missing or stale", () => {
		const fixtureRoot = createIsolatedRepoFixture();

		// 1. Missing manifest
		expect(() => checkSurfaceManifestFreshness(fixtureRoot)).toThrow(
			/missing public surface manifest/,
		);

		// 2. Write and verify clean
		writeSurfaceManifest(fixtureRoot);
		expect(() => checkSurfaceManifestFreshness(fixtureRoot)).not.toThrow();

		// 3. Stale manifest content
		const manifestPath = path.join(
			fixtureRoot,
			"src/pages/ui/generated/public-surface-manifest.ts",
		);
		writeFileSync(manifestPath, `${readFileSync(manifestPath, "utf8")}// stale audit\n`);
		expect(() => checkSurfaceManifestFreshness(fixtureRoot)).toThrow(
			/stale public surface manifest/,
		);
	});

	it("registers documented native-only surfaces with explicit strategies", async () => {
		const { DOCUMENTED_NATIVE_ONLY_SURFACES, formatNativeSurfaceStrategy } = await import(
			"../src/pages/ui/catalog-native-surfaces"
		);
		const keys = Object.keys(DOCUMENTED_NATIVE_ONLY_SURFACES);
		expect(keys).toEqual([
			"BasaltMark",
			"Code",
			"CodeBlock",
			"Table",
			"TableCaption",
			"TableHead",
			"TableCell",
			"LayerCard.Secondary",
			"LayerCard.Header",
			"LayerCard.Body",
			"LayerCard.Footer",
			"InputGroup.Suffix",
			"Checkbox.Legend",
			"Radio.Legend",
			"Switch.Legend",
			"DialogHeader",
			"DialogFooter",
			"SheetHeader",
			"SheetFooter",
			"AlertDialogHeader",
			"AlertDialogFooter",
			"PopoverTitle",
			"PopoverDescription",
			"CommandShortcut",
			"SidebarHeader",
			"SidebarNav",
			"SidebarPartition",
			"SidebarFooter",
			"ContentIsland",
			"TableHeader",
			"TableBody",
			"TableFooter",
			"GridItem",
		]);

		for (const key of keys) {
			const entry = DOCUMENTED_NATIVE_ONLY_SURFACES[key];
			expect(entry.justification.length).toBeGreaterThan(10);
			expect(entry.inheritedElement.length).toBeGreaterThan(0);
			expect(typeof entry.forwardsRef).toBe("boolean");
			expect(typeof entry.forwardsRestProps).toBe("boolean");
			const strategy = formatNativeSurfaceStrategy(entry);
			expect(strategy).toContain(entry.inheritedElement);
		}
	});

	it("validates doc files and anchors for non-catalog surface owners", () => {
		const fixtureRoot = createIsolatedRepoFixture({
			"doc.md": '# Guide\n\n<a id="custom-anchor"></a>\n',
		});
		const testManifest = {
			packageVersion: "2.0.3",
			totalModules: 1,
			totalSymbols: 1,
			totalValues: 1,
			totalTypes: 0,
			totalCssExports: 0,
			modules: [
				{
					subpath: "./components/button",
					importPath: "@nocoo/basalt/components/button",
					sourceFile: "packages/basalt/src/components/button.tsx",
					ownerDoc: "doc.md#custom-anchor",
					ownerKind: "framework-chrome" as const,
					summary: "Button test module",
					symbols: [],
				},
			],
			cssExports: [],
		};

		const sampleModule = testManifest.modules[0];
		if (!sampleModule) {
			throw new Error("missing sample module in fixture manifest");
		}

		// 1. Valid doc file and anchor pass cleanly
		expect(() => validateSurfaceManifestDocs(testManifest, fixtureRoot)).not.toThrow();

		// 2. Missing doc file fails fast
		const missingFileManifest = {
			...testManifest,
			modules: [{ ...sampleModule, ownerDoc: "nonexistent.md#custom-anchor" }],
		};
		expect(() => validateSurfaceManifestDocs(missingFileManifest, fixtureRoot)).toThrow(
			/missing doc file 'nonexistent.md'/,
		);

		// 3. Missing anchor in existing doc file fails fast
		const missingAnchorManifest = {
			...testManifest,
			modules: [{ ...sampleModule, ownerDoc: "doc.md#nonexistent-anchor" }],
		};
		expect(() => validateSurfaceManifestDocs(missingAnchorManifest, fixtureRoot)).toThrow(
			/missing anchor '#nonexistent-anchor' in 'doc.md'/,
		);

		// 4. Stale doc anchor causes checkSurfaceManifestFreshness to fail
		writeSurfaceManifest(fixtureRoot);
		// Overwrite README.md in fixtureRoot to drop ## Component usage
		writeFileSync(path.join(fixtureRoot, "README.md"), "# Basalt\n\n## CSS setup\n");
		expect(() => checkSurfaceManifestFreshness(fixtureRoot)).toThrow(
			/missing anchor '#component-usage' in 'README.md'/,
		);
	});
});
