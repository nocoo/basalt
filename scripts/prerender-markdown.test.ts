import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_ORIGIN } from "../src/lib/site";
import { APP_VERSION } from "../src/lib/version";
import { TEMPLATE_MANIFEST } from "../src/models/template-manifest";
import { CATALOG, catalogNavName } from "../src/pages/ui/catalog";
import { CATALOG_CATEGORIES } from "../src/pages/ui/catalog-categories";
import {
	type CatalogContentEntry,
	loadCatalogContentForBuild,
	prerenderMarkdown,
	verifyMarkdownCoverage,
} from "./prerender-markdown";

const DUMMY_RENDER = () => null;

function createFixtureContent(): Record<string, CatalogContentEntry> {
	const content: Record<string, CatalogContentEntry> = {};
	for (const entry of CATALOG) {
		content[entry.slug] = {
			docs: {
				description: `Fixture docs for ${catalogNavName(entry)}.`,
				usage: `import { ${entry.exportName} } from "${entry.importPath}";`,
				variants: [],
				api: [
					{
						name: entry.exportName,
						props: [{ name: "className", type: "string" }],
					},
				],
				implementationSource: {
					owner: "nocoo",
					repo: "basalt",
					ref: "main",
					file: `packages/basalt/src/components/${entry.slug}.tsx`,
				},
			},
			examples: [
				{
					id: `${entry.slug}-basic`,
					title: "Basic",
					code: `<${entry.exportName} />`,
					render: DUMMY_RENDER,
				},
			],
		};
	}
	return content;
}

describe("prerender-markdown", () => {
	it("writes all markdown files and md-catalog.json, and verifies coverage", async () => {
		const distDir = mkdtempSync(path.join(tmpdir(), "basalt-md-prerender-"));
		const catalogContent = createFixtureContent();

		const written = await prerenderMarkdown({
			distDir,
			repoRoot: process.cwd(),
			catalogContent,
			guides: {
				button: {
					useWhen: "Submitting actions.",
					avoidWhen: "Navigating between pages.",
					instead: "link-button",
					placement: "Toolbars and forms.",
				},
			},
		});

		const expectedFileCount =
			1 + 1 + CATALOG_CATEGORIES.length + CATALOG.length + 1 + TEMPLATE_MANIFEST.length + 1;
		expect(written).toHaveLength(expectedFileCount);

		expect(() => verifyMarkdownCoverage(distDir)).not.toThrow();

		const buttonMd = readFileSync(path.join(distDir, "ui/button.md"), "utf8");
		expect(buttonMd).toContain("# Button");
		expect(buttonMd).toContain("## When to use");
		expect(buttonMd).toContain(`(${SITE_ORIGIN}/ui/link-button.md)`);

		const templateMd = readFileSync(
			path.join(distDir, `templates/${TEMPLATE_MANIFEST[0].slug}.md`),
			"utf8",
		);
		expect(templateMd).toContain(`# ${TEMPLATE_MANIFEST[0].title}`);
		expect(templateMd).toContain("## Package Imports");
		expect(templateMd).toContain("```tsx");

		const catalogJson = JSON.parse(readFileSync(path.join(distDir, "md-catalog.json"), "utf8")) as {
			generatedFromVersion: string;
			origin: string;
			total: number;
			routes: Array<{ path: string; kind: string }>;
		};
		expect(catalogJson.generatedFromVersion).toBe(APP_VERSION);
		expect(catalogJson.origin).toBe(SITE_ORIGIN);
		expect(catalogJson.total).toBe(expectedFileCount - 1 + 2);
		expect(catalogJson.routes.some((r) => r.path === "/agents.md" && r.kind === "agent-doc")).toBe(
			true,
		);
		expect(catalogJson.routes.some((r) => r.path === "/setup.md" && r.kind === "agent-doc")).toBe(
			true,
		);

		rmSync(path.join(distDir, "ui/button.md"));
		writeFileSync(path.join(distDir, "templates.md"), "   \n");
		expect(() => verifyMarkdownCoverage(distDir)).toThrow(
			/Markdown prerender coverage check failed:[\s\S]*ui\/button\.md \(missing\)[\s\S]*templates\.md \(empty\)/,
		);
	});

	it("fails cleanly when catalogContent is missing an entry", async () => {
		const distDir = mkdtempSync(path.join(tmpdir(), "basalt-md-missing-"));
		const partial = createFixtureContent();
		delete partial.button;

		await expect(
			prerenderMarkdown({
				distDir,
				repoRoot: process.cwd(),
				catalogContent: partial,
			}),
		).rejects.toThrow('Missing catalog content for "button".');
	});

	it("loads all catalog content families via Vite SSR loader", async () => {
		const loaded = await loadCatalogContentForBuild(process.cwd());
		expect(Object.keys(loaded).length).toBeGreaterThanOrEqual(CATALOG.length - 5);
		expect(loaded.button?.docs.description.length).toBeGreaterThan(0);
		expect(loaded.button?.examples.length).toBeGreaterThan(0);
	}, 30_000);
});
