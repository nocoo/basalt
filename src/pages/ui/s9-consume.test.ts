import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { catalogPageStatus } from "./catalog-page-status";

const ROOT = path.join(process.cwd(), "src");
const POLLUTION = /Cloudflare|Kumo|Workers?\b|API key|\bsecret\b/i;
const LOCAL_UI = /from ["']@\/components\/ui\//;

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
		];
		expect(files.length).toBeGreaterThan(0);
		for (const file of files) {
			expect(readFileSync(file, "utf8"), file).not.toMatch(LOCAL_UI);
		}
		expect(readFileSync(path.join(ROOT, "pages", "LayoutPage.tsx"), "utf8")).toContain(
			"@nocoo/basalt/components/grid",
		);
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
