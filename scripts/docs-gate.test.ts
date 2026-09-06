import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	computeDocModuleFilename,
	computeUsageModuleFilename,
	extractCompilableDocModules,
	generateCatalogInstallationSnippets,
	loadCatalogUsageModules,
	scanDocFences,
} from "./docs-gate";

describe("documentation tarball compilation gate", () => {
	it("scans and classifies all documentation tsx fences across required docs", () => {
		const fences = scanDocFences();
		expect(fences.length).toBeGreaterThanOrEqual(18);

		const compileFences = fences.filter((f) => f.kind === "compile");
		const excerptFences = fences.filter((f) => f.kind === "excerpt");

		expect(compileFences.length).toBe(8);
		expect(excerptFences.length).toBeGreaterThanOrEqual(10);

		const compileIds = compileFences.map((f) => f.id);
		expect(compileIds).toContain("readme-quickstart");
		expect(compileIds).toContain("pkg-readme-root-import");
		expect(compileIds).toContain("pkg-readme-granular-import");
		expect(compileIds).toContain("pkg-readme-client-app");
		expect(compileIds).toContain("integration-projects-page-basic");
		expect(compileIds).toContain("integration-projects-page-full");
		expect(compileIds).toContain("integration-profile-form");
		expect(compileIds).toContain("integration-controlled-date-picker");

		for (const fence of compileFences) {
			expect(fence.code.length).toBeGreaterThan(0);
			expect(fence.code).toContain("import");
		}
	});

	it("extracts exact verbatim bytes for compilable documentation modules", () => {
		const modules = extractCompilableDocModules();
		expect(modules.length).toBe(8);

		const projectsBasic = modules.find((m) => m.id === "integration-projects-page-basic");
		expect(projectsBasic).toBeDefined();
		expect(projectsBasic?.code).toContain("export default function ProjectsPage");
		expect(projectsBasic?.code).toContain(
			'import { PageHeader } from "@nocoo/basalt/components/page-header"',
		);

		const projectsFull = modules.find((m) => m.id === "integration-projects-page-full");
		expect(projectsFull).toBeDefined();
		expect(projectsFull?.code).toContain('SectionRule title="Overview"');
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
		mkdirSync(join(tempFixtureDir, "packages/basalt"), { recursive: true });

		writeFileSync(join(tempFixtureDir, "README.md"), "```tsx\nexport const x = 1;\n```");
		writeFileSync(join(tempFixtureDir, "packages/basalt/README.md"), "# empty");
		writeFileSync(join(tempFixtureDir, "INTEGRATION.md"), "# empty");

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
			expect(mod.code).toContain("import");
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
});
