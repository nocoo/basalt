import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { catalogPageStatus } from "./catalog-page-status";

const ROOT = path.join(process.cwd(), "src");
const POLLUTION = /Cloudflare|Kumo|Workers?\b|API key|\bsecret\b/i;
const LOCAL_UI = /from ["']@\/components\/ui\//;
const DEMO_TABLE_PAGES = ["DataPage.tsx", "AccountsPage.tsx", "PortfolioPage.tsx"] as const;
const LIVE_SHELL = ["DashboardLayout.tsx", "AppSidebar.tsx"] as const;

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const name of readdirSync(dir)) {
		const full = path.join(dir, name);
		if (statSync(full).isDirectory()) {
			files.push(...walk(full));
			continue;
		}
		if (full.endsWith(".ts") || full.endsWith(".tsx")) {
			files.push(full);
		}
	}
	return files;
}

describe("S9 package consume", () => {
	it("keeps owned pages and examples on package exports instead of local ui copies", () => {
		const files = [
			...walk(path.join(ROOT, "pages")).filter(
				(file) => !file.includes(`${path.sep}generated${path.sep}`),
			),
			...walk(path.join(ROOT, "pages", "ui", "examples")),
			...walk(path.join(ROOT, "components")),
		];
		expect(files.length).toBeGreaterThan(0);
		for (const file of files) {
			expect(readFileSync(file, "utf8"), file).not.toMatch(LOCAL_UI);
		}
		expect(readFileSync(path.join(ROOT, "pages", "LayoutPage.tsx"), "utf8")).toContain(
			"@nocoo/basalt/components/grid",
		);
	});

	it("keeps live shell composition on package shell primitives", () => {
		const layout = readFileSync(path.join(ROOT, "components", LIVE_SHELL[0]), "utf8");
		const sidebar = readFileSync(path.join(ROOT, "components", LIVE_SHELL[1]), "utf8");
		expect(layout).toContain("@nocoo/basalt/components/app-shell");
		expect(layout).toContain("@nocoo/basalt/components/app-header");
		expect(layout).toContain("@nocoo/basalt/components/sidebar");
		expect(sidebar).toContain("@nocoo/basalt/components/sidebar");
	});

	it("does not keep leftover local ui copies on the shipped site path", () => {
		expect(existsSync(path.join(ROOT, "components", "ui"))).toBe(false);
		expect(existsSync(path.join(ROOT, "components", "ThemeToggle.tsx"))).toBe(false);
	});

	it("uses library table primitives on demo table pages", () => {
		for (const name of DEMO_TABLE_PAGES) {
			const source = readFileSync(path.join(ROOT, "pages", name), "utf8");
			expect(source, name).toContain("@nocoo/basalt/components/table");
			expect(source, name).not.toMatch(/<table\b/);
		}
	});

	it("keeps catalog examples free of pollution copy", () => {
		for (const file of walk(path.join(ROOT, "pages", "ui", "examples"))) {
			expect(readFileSync(file, "utf8"), file).not.toMatch(POLLUTION);
		}
	});

	it("makes owned block slugs ready and leaves maps as the only planned chart", () => {
		expect(catalogPageStatus("resource-list")).toBe("ready");
		expect(catalogPageStatus("delete-resource")).toBe("ready");
		expect(catalogPageStatus("page-header")).toBe("ready");
		expect(catalogPageStatus("maps")).toBe("planned");
		expect(
			CATALOG.filter((entry) => entry.category === "block").map((entry) => [
				entry.slug,
				catalogPageStatus(entry.slug),
			]),
		).toEqual([
			["page-header", "ready"],
			["resource-list", "ready"],
			["delete-resource", "ready"],
		]);
	});
});
