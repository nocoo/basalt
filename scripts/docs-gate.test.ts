import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	extractCompilableDocModules,
	generateCatalogInstallationSnippets,
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
});
