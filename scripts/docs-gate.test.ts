import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	computeDocModuleFilename,
	computeScenarioModuleFilename,
	computeUsageModuleFilename,
	discoverDocumentationFiles,
	extractCompilableDocModules,
	generateCatalogInstallationSnippets,
	loadCatalogModules,
	loadCatalogUsageModules,
	scanDocFences,
	validateCompleteConsumerModule,
} from "./docs-gate";

describe("documentation tarball compilation gate", () => {
	it("scans and classifies all documentation tsx fences across required docs", () => {
		const fences = scanDocFences();
		expect(fences.length).toBeGreaterThanOrEqual(18);

		const compileFences = fences.filter((f) => f.kind === "compile");
		const excerptFences = fences.filter((f) => f.kind === "excerpt");

		expect(compileFences.length).toBeGreaterThanOrEqual(13);
		expect(excerptFences.length).toBeGreaterThanOrEqual(10);

		const compileIds = compileFences.map((f) => f.id);
		expect(compileIds).toContain("README-md-readme-quickstart");
		expect(compileIds).toContain("packages-basalt-README-md-pkg-readme-root-import");
		expect(compileIds).toContain("packages-basalt-README-md-pkg-readme-granular-import");
		expect(compileIds).toContain("packages-basalt-README-md-pkg-readme-client-app");
		expect(compileIds).toContain("INTEGRATION-md-integration-projects-page-basic");
		expect(compileIds).toContain("INTEGRATION-md-integration-projects-page-full");
		expect(compileIds).toContain("INTEGRATION-md-integration-profile-form");
		expect(compileIds).toContain("INTEGRATION-md-integration-controlled-date-picker");
		expect(compileIds).toContain("INTEGRATION-md-integration-rhf-controller");
		expect(compileIds).toContain("INTEGRATION-md-integration-vite-standalone");
		expect(compileIds).toContain("INTEGRATION-md-integration-nextjs-client-boundary");
		expect(compileIds).toContain("INTEGRATION-md-integration-router-adapter");
		expect(compileIds).toContain("INTEGRATION-md-integration-native-form-reset");

		for (const fence of compileFences) {
			expect(fence.code.length).toBeGreaterThan(0);
		}
	});

	it("extracts exact verbatim bytes for compilable documentation modules", () => {
		const modules = extractCompilableDocModules();
		expect(modules.length).toBeGreaterThanOrEqual(13);

		const projectsBasic = modules.find(
			(m) => m.id === "INTEGRATION-md-integration-projects-page-basic",
		);
		expect(projectsBasic).toBeDefined();
		expect(projectsBasic?.code).toContain("export default function ProjectsPage");
		expect(projectsBasic?.code).toContain(
			'import { PageHeader } from "@nocoo/basalt/components/page-header"',
		);

		const projectsFull = modules.find(
			(m) => m.id === "INTEGRATION-md-integration-projects-page-full",
		);
		expect(projectsFull).toBeDefined();
		expect(projectsFull?.code).toContain('SectionRule title="Overview"');

		const rhfModule = modules.find((m) => m.id === "INTEGRATION-md-integration-rhf-controller");
		expect(rhfModule).toBeDefined();
		expect(rhfModule?.code).toContain("useForm<ProjectFormValues>");
		expect(rhfModule?.code).toContain("Controller");
	});

	it("generates installation snippets for all ready catalog entries using strict metadata", () => {
		const result = generateCatalogInstallationSnippets();
		expect(result.readyCount).toBe(99);
		expect(result.granularCount).toBe(99);
		expect(result.barrelCount).toBe(34);

		expect(result.code).toContain("import { CustomChart as Granular_");
		expect(result.code).toContain("import { PageHeader as Granular_");
		expect(result.code).toContain("import { ResourceList as Granular_");
		expect(result.code).toContain("import { DeleteResource as Granular_");
		expect(result.code).toContain("import { Button as Barrel_");
	});

	it("fails fast if a required documentation file is missing", () => {
		const tempFixtureDir = join(tmpdir(), `basalt-docs-gate-test-${Date.now()}`);
		mkdirSync(tempFixtureDir, { recursive: true });

		try {
			expect(() => scanDocFences(tempFixtureDir)).toThrow(/required documentation file missing/);
		} finally {
			rmSync(tempFixtureDir, { recursive: true, force: true });
		}
	});

	it("fails fast if a tsx block is unclassified or duplicate IDs exist", () => {
		const tempFixtureDir = join(tmpdir(), `basalt-docs-gate-dup-${Date.now()}`);
		mkdirSync(join(tempFixtureDir, "packages/basalt/ai"), { recursive: true });

		writeFileSync(join(tempFixtureDir, "README.md"), "```tsx\nexport const x = 1;\n```");
		writeFileSync(join(tempFixtureDir, "packages/basalt/README.md"), "# empty");
		writeFileSync(join(tempFixtureDir, "INTEGRATION.md"), "# empty");
		writeFileSync(join(tempFixtureDir, "packages/basalt/ai/USAGE.md"), "# empty");
		writeFileSync(join(tempFixtureDir, "packages/basalt/ai/COMPATIBILITY.md"), "# empty");
		writeFileSync(join(tempFixtureDir, "packages/basalt/ai/INTEGRATION.md"), "# empty");

		try {
			expect(() => scanDocFences(tempFixtureDir)).toThrow(/unclassified tsx code block/);

			writeFileSync(
				join(tempFixtureDir, "README.md"),
				"```tsx compile:dup-id\nexport const a = 1;\n```\n```tsx compile:dup-id\nexport const b = 2;\n```",
			);
			expect(() => scanDocFences(tempFixtureDir)).toThrow(/duplicate code block id 'dup-id'/);
		} finally {
			rmSync(tempFixtureDir, { recursive: true, force: true });
		}
	});

	it("automatically discovers all markdown files in packages/basalt/ai including newly added files", () => {
		const tempFixtureDir = join(tmpdir(), `basalt-docs-gate-discover-${Date.now()}`);
		const aiDir = join(tempFixtureDir, "packages/basalt/ai");
		mkdirSync(aiDir, { recursive: true });

		// Seed all required docs
		writeFileSync(join(tempFixtureDir, "README.md"), "# Root");
		writeFileSync(join(tempFixtureDir, "packages/basalt/README.md"), "# Package");
		writeFileSync(join(tempFixtureDir, "INTEGRATION.md"), "# Integration");
		writeFileSync(join(aiDir, "USAGE.md"), "# Usage");
		writeFileSync(join(aiDir, "COMPATIBILITY.md"), "# Compatibility");
		writeFileSync(join(aiDir, "INTEGRATION.md"), "# Integration mirror");

		// Add an arbitrary newly created in-package ai Markdown file
		const customDocRel = "packages/basalt/ai/CUSTOM-RECIPES.md";
		writeFileSync(
			join(tempFixtureDir, customDocRel),
			"# Custom Recipes\n```tsx compile:custom-recipe\nexport const x = 42;\n```",
		);

		// Add a nested in-package ai Markdown file (e.g. packages/basalt/ai/recipes/nested-guide.md)
		const nestedDir = join(aiDir, "recipes");
		mkdirSync(nestedDir, { recursive: true });
		const nestedDocRel = "packages/basalt/ai/recipes/nested-guide.md";
		writeFileSync(
			join(tempFixtureDir, nestedDocRel),
			"# Nested Recipes\n```tsx compile:nested-recipe\nexport const nestedVal = 100;\n```",
		);

		try {
			const discovered = discoverDocumentationFiles(tempFixtureDir);
			expect(discovered).toContain(customDocRel);
			expect(discovered).toContain(nestedDocRel);
			expect(discovered.length).toBe(8);

			// Scanning fences picks up both top-level and nested ai doc files
			const fences = scanDocFences(tempFixtureDir);
			const customFence = fences.find((f) => f.file === customDocRel);
			expect(customFence).toBeDefined();
			expect(customFence?.id).toBe("packages-basalt-ai-CUSTOM-RECIPES-md-custom-recipe");

			const nestedFence = fences.find((f) => f.file === nestedDocRel);
			expect(nestedFence).toBeDefined();
			expect(nestedFence?.id).toBe("packages-basalt-ai-recipes-nested-guide-md-nested-recipe");

			// Negative proof: If the nested file has an unclassified tsx fence, scanDocFences must fail
			writeFileSync(
				join(tempFixtureDir, nestedDocRel),
				"# Nested Recipes\n```tsx\nexport const broken = true;\n```",
			);
			expect(() => scanDocFences(tempFixtureDir)).toThrow(
				/unclassified tsx code block in packages\/basalt\/ai\/recipes\/nested-guide\.md/,
			);
		} finally {
			rmSync(tempFixtureDir, { recursive: true, force: true });
		}
	});

	it("prevents filename collision between user doc IDs and catalog installation harness", () => {
		const tempFixtureDir = join(tmpdir(), `basalt-docs-gate-coll-${Date.now()}`);
		const harnessDir = join(tempFixtureDir, "src/__generated_harness__");
		const docsDir = join(tempFixtureDir, "src/__generated_docs__");
		mkdirSync(harnessDir, { recursive: true });
		mkdirSync(docsDir, { recursive: true });

		try {
			// Write installation harness
			const harnessPath = join(harnessDir, "catalog-snippets.tsx");
			writeFileSync(harnessPath, "// harness content");

			// Doc module with id 'catalog-snippets' must not overwrite or conflict with harness
			const modFilename0 = computeDocModuleFilename(0, "catalog-snippets");
			expect(modFilename0).toBe("doc_000_catalog-snippets.tsx");
			const docPath0 = join(docsDir, modFilename0);
			writeFileSync(docPath0, "// doc module 0");

			// Distinct user IDs with different punctuation like a.b and a/b must not overwrite each other
			const modFilename1 = computeDocModuleFilename(1, "a.b");
			const modFilename2 = computeDocModuleFilename(2, "a/b");
			expect(modFilename1).not.toBe(modFilename2);
			expect(modFilename1).toBe("doc_001_a_b.tsx");
			expect(modFilename2).toBe("doc_002_a_b.tsx");

			const docPath1 = join(docsDir, modFilename1);
			const docPath2 = join(docsDir, modFilename2);
			writeFileSync(docPath1, "// doc module 1");
			writeFileSync(docPath2, "// doc module 2");

			// All four files exist distinctly
			expect(readFileSync(harnessPath, "utf8")).toBe("// harness content");
			expect(readFileSync(docPath0, "utf8")).toBe("// doc module 0");
			expect(readFileSync(docPath1, "utf8")).toBe("// doc module 1");
			expect(readFileSync(docPath2, "utf8")).toBe("// doc module 2");
		} finally {
			rmSync(tempFixtureDir, { recursive: true, force: true });
		}
	});

	it("loads verbatim usage modules for all ready catalog items", async () => {
		const usageModules = await loadCatalogUsageModules();
		expect(usageModules).toHaveLength(99);

		for (const [index, mod] of usageModules.entries()) {
			expect(mod.slug.length).toBeGreaterThan(0);
			expect(mod.code.trim().length).toBeGreaterThan(0);
			expect(mod.code).toMatch(/export (default )?function/);

			const filename = computeUsageModuleFilename(index, mod.slug);
			expect(filename).toMatch(/^usage_\d{3}_[a-zA-Z0-9_-]+\.tsx$/);
		}

		const confirmDialogUsage = usageModules.find((m) => m.slug === "confirm-dialog");
		expect(confirmDialogUsage).toBeDefined();
		expect(confirmDialogUsage?.code).toContain(
			'import { ConfirmDialog } from "@nocoo/basalt/components/confirm-dialog";',
		);
		expect(confirmDialogUsage?.code).toContain("const [open, setOpen] = useState(false);");

		const segmentControlUsage = usageModules.find((m) => m.slug === "segment-control");
		expect(segmentControlUsage).toBeDefined();
		expect(segmentControlUsage?.code).toContain("statusOptions");

		const slotBarUsage = usageModules.find((m) => m.slug === "slot-bar");
		expect(slotBarUsage).toBeDefined();
		expect(slotBarUsage?.code).toContain("items");

		const tablePagerUsage = usageModules.find((m) => m.slug === "table-pager");
		expect(tablePagerUsage).toBeDefined();
		expect(tablePagerUsage?.code).toContain("const [page, setPage] = useState(1);");
	});

	it("handles fixture repoRoot, whitespace fidelity, dynamic ready inclusion, and rejects missing or empty usage", async () => {
		const tempFixture = mkdtempSync(join(tmpdir(), "basalt-usage-fixture-"));
		const generatedDir = join(tempFixture, "src/pages/ui/generated");
		mkdirSync(generatedDir, { recursive: true });
		writeFileSync(join(tempFixture, "vite.config.ts"), "export default {};\n");

		const whitespaceCode =
			'\n  import React from "react";\n  export default function Example() { return <span>Whitespace preservation</span>; }\n\n';

		function defaultExamples(slug: string) {
			return [
				{
					id: `${slug}-scenario`,
					title: "Sample",
					code: 'import React from "react";\nexport default function Example() { return <div>Ok</div>; }',
				},
			];
		}

		function setupFixture(
			options: {
				catalog?: string[];
				status?: Record<string, string>;
				record?: Record<
					string,
					{
						docs?: { usage?: string };
						examples?: Array<{ id: string; title: string; code: string }>;
					}
				>;
			} = {},
		) {
			const catalog = options.catalog ?? ["alpha", "beta", "inactive"];
			const status = options.status ?? { alpha: "ready", beta: "ready", inactive: "planned" };
			const record = options.record ?? {
				alpha: { docs: { usage: whitespaceCode }, examples: defaultExamples("alpha") },
				beta: {
					docs: {
						usage:
							'import React from "react";\nexport default function Example() { return <i>Beta</i>; }',
					},
					examples: defaultExamples("beta"),
				},
			};
			writeFileSync(
				join(tempFixture, "src/pages/ui/catalog.ts"),
				`export const CATALOG = ${JSON.stringify(catalog.map((slug) => ({ slug })))};\n`,
			);
			writeFileSync(
				join(tempFixture, "src/pages/ui/generated/catalog-page-status.ts"),
				`export const CATALOG_PAGE_STATUS = ${JSON.stringify(status)};\n`,
			);
			writeFileSync(
				join(tempFixture, "src/pages/ui/catalog-content-registry.ts"),
				`export async function loadCatalogContentRecord() { return ${JSON.stringify(record)}; }\n`,
			);
		}

		try {
			// 1. Alternate root controls inventory and preserves exact whitespace without trimming
			setupFixture();
			const loaded = await loadCatalogUsageModules(tempFixture);
			expect(loaded.map((e) => e.slug).sort()).toEqual(["alpha", "beta"]);
			const alphaItem = loaded.find((e) => e.slug === "alpha");
			expect(alphaItem?.code).toBe(whitespaceCode);

			// 2. New ready entry automatically enters inventory
			setupFixture({
				catalog: ["alpha", "beta", "gamma"],
				status: { alpha: "ready", beta: "ready", gamma: "ready" },
				record: {
					alpha: { docs: { usage: whitespaceCode }, examples: defaultExamples("alpha") },
					beta: { docs: { usage: whitespaceCode }, examples: defaultExamples("beta") },
					gamma: { docs: { usage: whitespaceCode }, examples: defaultExamples("gamma") },
				},
			});
			const withGamma = await loadCatalogUsageModules(tempFixture);
			expect(withGamma).toHaveLength(3);
			expect(withGamma.some((e) => e.slug === "gamma")).toBe(true);

			// 3. Missing ready record throws
			setupFixture({
				record: {
					alpha: { docs: { usage: whitespaceCode }, examples: defaultExamples("alpha") },
				},
			});
			await expect(loadCatalogUsageModules(tempFixture)).rejects.toThrow(
				/ready catalog entry "beta" did not load in catalog record/,
			);

			// 4. Missing usage throws
			setupFixture({
				record: {
					alpha: { docs: {}, examples: defaultExamples("alpha") },
					beta: { docs: { usage: whitespaceCode }, examples: defaultExamples("beta") },
				},
			});
			await expect(loadCatalogUsageModules(tempFixture)).rejects.toThrow(
				/catalog usage "alpha" \(id: "usage"\) is missing or empty code/,
			);

			// 5. Whitespace-only usage throws
			setupFixture({
				record: {
					alpha: { docs: { usage: "  \n\t  " }, examples: defaultExamples("alpha") },
					beta: { docs: { usage: whitespaceCode }, examples: defaultExamples("beta") },
				},
			});
			await expect(loadCatalogUsageModules(tempFixture)).rejects.toThrow(
				/catalog usage "alpha" \(id: "usage"\) is missing or empty code/,
			);
		} finally {
			rmSync(tempFixture, { recursive: true, force: true });
		}
	});

	it("loads verbatim scenario modules for all ready catalog items and validates complete consumer modules", async () => {
		const { usageModules, scenarioModules } = await loadCatalogModules();
		expect(usageModules).toHaveLength(99);
		expect(scenarioModules).toHaveLength(262);

		const seenScenarioIds = new Set<string>();
		const seenFilenames = new Set<string>();

		for (const [index, mod] of scenarioModules.entries()) {
			expect(mod.slug.length).toBeGreaterThan(0);
			expect(mod.id.length).toBeGreaterThan(0);
			expect(mod.code.trim().length).toBeGreaterThan(0);

			expect(seenScenarioIds.has(mod.id)).toBe(false);
			seenScenarioIds.add(mod.id);

			const filename = computeScenarioModuleFilename(index, mod.slug, mod.id);
			expect(filename).toMatch(/^scenario_\d{3}_[a-zA-Z0-9_-]+\.tsx$/);
			expect(seenFilenames.has(filename)).toBe(false);
			seenFilenames.add(filename);
		}

		// Ensure specific non-hero and interactive scenarios are present and complete
		const dialogSizes = scenarioModules.find((m) => m.id === "dialog-sizes");
		expect(dialogSizes).toBeDefined();
		expect(dialogSizes?.code).toContain("Table");
		expect(dialogSizes?.code).toContain('size: "sm"');
		expect(dialogSizes?.code).toContain('size: "xl"');
		expect(dialogSizes?.code).toContain('This size="{size}"');

		const toastVariants = scenarioModules.find((m) => m.id === "toast-success-variant");
		expect(toastVariants).toBeDefined();
		expect(toastVariants?.code).toContain(
			'import { toast } from "@nocoo/basalt/components/toast";',
		);
		expect(toastVariants?.code).toContain("toast.success");

		const popoverSides = scenarioModules.find((m) => m.id === "popover-sides");
		expect(popoverSides).toBeDefined();
		expect(popoverSides?.code).toContain("flex flex-wrap items-center justify-center gap-4 py-16");
	});

	it("rejects regressions from complete module to bare JSX fragments, empty exports, or unexported code", () => {
		// 1. Bare native JSX fragment without exports
		expect(() =>
			validateCompleteConsumerModule("<span>Incomplete</span>", {
				slug: "meter",
				id: "meter-low-value",
				kind: "scenario",
			}),
		).toThrow(/missing export statement/);

		// 2. Unexported code (has import, but no export)
		expect(() =>
			validateCompleteConsumerModule(
				'import { Meter } from "@nocoo/basalt/components/meter";\nconst el = <Meter value={8} label="Quota" />;',
				{
					slug: "meter",
					id: "meter-low-value",
					kind: "scenario",
				},
			),
		).toThrow(/missing export statement/);

		// 3. Empty export statement export {}; does not complete a bare fragment
		expect(() =>
			validateCompleteConsumerModule(
				'import React from "react";\nexport {};\n<span>Fragment</span>;',
				{
					slug: "meter",
					id: "meter-low-value",
					kind: "scenario",
				},
			),
		).toThrow(/missing export statement/);

		// 4. Type-only declaration or re-export does not complete a bare fragment
		expect(() =>
			validateCompleteConsumerModule(
				'import React from "react";\nexport type Placeholder = string;\n<span>Fragment</span>;',
				{
					slug: "meter",
					id: "meter-low-value",
					kind: "scenario",
				},
			),
		).toThrow(/missing export statement/);

		expect(() =>
			validateCompleteConsumerModule(
				'export type { ComponentType } from "react";\n<span>Fragment</span>;',
				{
					slug: "meter",
					id: "meter-low-value",
					kind: "scenario",
				},
			),
		).toThrow(/missing export statement/);

		// 5. Missing / empty code
		expect(() =>
			validateCompleteConsumerModule("", {
				slug: "slider",
				id: "slider-default",
				kind: "scenario",
			}),
		).toThrow(/missing or empty code/);

		expect(() =>
			validateCompleteConsumerModule("   \n\t  ", {
				slug: "slider",
				id: "slider-default",
				kind: "scenario",
			}),
		).toThrow(/missing or empty code/);

		// 6. Valid native and exported variations are accepted (imports checked by tsc)
		expect(() =>
			validateCompleteConsumerModule("export function Example() { return <span>Native</span>; }", {
				slug: "meter",
				id: "meter-low-value",
				kind: "scenario",
			}),
		).not.toThrow();

		expect(() =>
			validateCompleteConsumerModule("export const Example = () => <span>Arrow</span>;", {
				slug: "meter",
				id: "meter-low-value",
				kind: "scenario",
			}),
		).not.toThrow();

		expect(() =>
			validateCompleteConsumerModule("export default () => <span>Arrow</span>;", {
				slug: "meter",
				id: "meter-low-value",
				kind: "scenario",
			}),
		).not.toThrow();

		expect(() =>
			validateCompleteConsumerModule(
				"const Example = () => <span>Identifier</span>;\nexport default Example;",
				{
					slug: "meter",
					id: "meter-low-value",
					kind: "scenario",
				},
			),
		).not.toThrow();

		expect(() =>
			validateCompleteConsumerModule(
				"function Example() { return <span>Named</span>; }\nexport { Example as Demo };",
				{
					slug: "meter",
					id: "meter-low-value",
					kind: "scenario",
				},
			),
		).not.toThrow();
	});

	it("prevents collision between doc, usage, and scenario filenames across sanitization and relative path boundaries", () => {
		// 1. Sanitization collision in scenario filenames: 'case/a' and 'case_a' both sanitize similarly, but distinct index/sanitization prevents collision and directory jumps
		const scenarioSlash = computeScenarioModuleFilename(1, "catalog-item", "case/a");
		const scenarioUnderscore = computeScenarioModuleFilename(2, "catalog-item", "case_a");
		expect(scenarioSlash).not.toBe(scenarioUnderscore);
		expect(scenarioSlash).not.toContain("/");
		expect(scenarioSlash).not.toContain("\\");
		expect(scenarioUnderscore).not.toContain("/");
		expect(scenarioUnderscore).not.toContain("\\");

		// 2. Relative traversal boundaries: '../harness' is sanitized safely without directory traversal
		const traversalDoc = computeDocModuleFilename(3, "../harness");
		expect(traversalDoc).not.toContain("/");
		expect(traversalDoc).not.toContain("\\");

		const traversalUsage = computeUsageModuleFilename(4, "../harness");
		expect(traversalUsage).not.toContain("/");
		expect(traversalUsage).not.toContain("\\");

		const traversalScenario = computeScenarioModuleFilename(5, "../harness", "../../evil-id");
		expect(traversalScenario).not.toContain("/");
		expect(traversalScenario).not.toContain("\\");

		// 3. Category prefixes ensure no collision between categories for identical slug/id
		const docFilename = computeDocModuleFilename(0, "common-name");
		const usageFilename = computeUsageModuleFilename(0, "common-name");
		const scenarioFilename = computeScenarioModuleFilename(0, "common-name", "default");
		expect(new Set([docFilename, usageFilename, scenarioFilename]).size).toBe(3);

		// 4. Scenarios for the same slug with slash/dot variations maintain distinct filenames
		const scenarioSubSlash = computeScenarioModuleFilename(10, "button", "sub/action");
		const scenarioSubUnderscore = computeScenarioModuleFilename(11, "button", "sub_action");
		expect(scenarioSubSlash).not.toBe(scenarioSubUnderscore);
	});

	it("fails fast if a non-hero scenario regresses to bare native JSX, missing code, or duplicate ID in loadCatalogModules", async () => {
		const tempFixture = mkdtempSync(join(tmpdir(), "basalt-scenario-fixture-"));
		const generatedDir = join(tempFixture, "src/pages/ui/generated");
		mkdirSync(generatedDir, { recursive: true });
		writeFileSync(join(tempFixture, "vite.config.ts"), "export default {};\n");

		function setupFixture(
			record: Record<
				string,
				{
					docs?: { usage?: string };
					examples?: Array<{ id: string; title: string; code: string }>;
				}
			>,
		) {
			writeFileSync(
				join(tempFixture, "src/pages/ui/catalog.ts"),
				`export const CATALOG = ${JSON.stringify(Object.keys(record).map((slug) => ({ slug })))};\n`,
			);
			writeFileSync(
				join(tempFixture, "src/pages/ui/generated/catalog-page-status.ts"),
				`export const CATALOG_PAGE_STATUS = ${JSON.stringify(
					Object.fromEntries(Object.keys(record).map((slug) => [slug, "ready"])),
				)};\n`,
			);
			writeFileSync(
				join(tempFixture, "src/pages/ui/catalog-content-registry.ts"),
				`export async function loadCatalogContentRecord() { return ${JSON.stringify(record)}; }\n`,
			);
		}

		try {
			// Regression 1: non-hero scenario regresses to bare native JSX (e.g. <span>Incomplete</span>)
			setupFixture({
				meter: {
					docs: {
						usage:
							'import { Meter } from "@nocoo/basalt/components/meter";\nexport default function Example() { return <Meter value={50} label="Usage" />; }',
					},
					examples: [
						{
							id: "meter-basic-meter",
							title: "Basic",
							code: 'import { Meter } from "@nocoo/basalt/components/meter";\nexport default function Example() { return <Meter value={50} label="Usage" />; }',
						},
						{
							id: "meter-low-value",
							title: "Low value",
							code: "<span>Incomplete</span>", // Bare JSX regression!
						},
					],
				},
			});

			await expect(loadCatalogModules(tempFixture)).rejects.toThrow(
				/catalog scenario "meter" \(id: "meter-low-value"\) is not a complete consumable module: missing export statement/,
			);

			// Regression 2: non-hero scenario missing code
			setupFixture({
				meter: {
					docs: {
						usage:
							'import { Meter } from "@nocoo/basalt/components/meter";\nexport default function Example() { return <Meter value={50} label="Usage" />; }',
					},
					examples: [
						{
							id: "meter-basic-meter",
							title: "Basic",
							code: 'import { Meter } from "@nocoo/basalt/components/meter";\nexport default function Example() { return <Meter value={50} label="Usage" />; }',
						},
						{
							id: "meter-low-value",
							title: "Low value",
							code: "",
						},
					],
				},
			});

			await expect(loadCatalogModules(tempFixture)).rejects.toThrow(
				/catalog scenario "meter" \(id: "meter-low-value"\) is missing or empty code/,
			);

			// Regression 3: duplicate scenario IDs within ready entries
			setupFixture({
				meter: {
					docs: {
						usage:
							'import { Meter } from "@nocoo/basalt/components/meter";\nexport default function Example() { return <Meter value={50} label="Usage" />; }',
					},
					examples: [
						{
							id: "meter-duplicate-id",
							title: "First",
							code: 'import React from "react";\nexport default function First() { return 1; }',
						},
						{
							id: "meter-duplicate-id",
							title: "Second",
							code: 'import React from "react";\nexport default function Second() { return 2; }',
						},
					],
				},
			});

			await expect(loadCatalogModules(tempFixture)).rejects.toThrow(
				/duplicate scenario id "meter-duplicate-id"/,
			);
		} finally {
			rmSync(tempFixture, { recursive: true, force: true });
		}
	});
});
