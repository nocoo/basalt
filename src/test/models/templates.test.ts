import { describe, expect, it } from "vitest";
import { filterTemplates, getTemplateBySlug, TEMPLATES } from "@/lib/template-catalog";
import { isKnownTemplateSlug, TEMPLATE_MANIFEST, TEMPLATE_SLUGS } from "@/models/template-manifest";
import { normalizeConsumerTemplateSource, viewportContainerClass } from "@/models/templates";

describe("template registry", () => {
	it("has one standalone source and matching metadata for each slug", () => {
		expect(TEMPLATES.map((entry) => entry.slug)).toEqual(TEMPLATE_SLUGS);
		expect(TEMPLATE_MANIFEST).toHaveLength(7);
		for (const entry of TEMPLATES) {
			expect(entry.consumerSource.startsWith('"use client";\n')).toBe(true);
			expect(isKnownTemplateSlug(entry.slug)).toBe(true);
			expect(getTemplateBySlug(entry.slug)).toBe(entry);
			expect(entry.consumerSource).toContain("export default function");
			expect(entry.consumerSource).not.toMatch(/from ["'](?:@\/|recharts)/);
			const imports = [...entry.consumerSource.matchAll(/from ["']([^"']+)["']/g)].map(
				(match) => match[1],
			);
			expect(imports.length).toBeGreaterThan(0);
			for (const specifier of imports)
				expect(specifier).toMatch(/^(?:react|lucide-react|@nocoo\/basalt\/)/);
		}
		expect(isKnownTemplateSlug("unknown")).toBe(false);
		expect(getTemplateBySlug("unknown")).toBeUndefined();
	});
	it("filters categories and featured entries", () => {
		expect(filterTemplates("all")).toHaveLength(7);
		expect(filterTemplates("featured")).toHaveLength(4);
		expect(filterTemplates("workspaces").map((entry) => entry.slug)).toEqual([
			"agent-workspace",
			"ops-inbox",
			"workspace-settings",
		]);
		expect(filterTemplates("dashboards")).toHaveLength(1);
		expect(filterTemplates("standalone").map((entry) => entry.slug)).toEqual([
			"visitor-login",
			"document-page",
			"not-found",
		]);
	});
	it("cleans preview-only comments and maps viewport widths", () => {
		expect(normalizeConsumerTemplateSource('"use client";\n\nexport default 1;\n')).toBe(
			'"use client";\n\nexport default 1;',
		);
		expect(
			normalizeConsumerTemplateSource(
				"/* Preview banner */\n// @ts-ignore\n// preview helper: mock\nexport default 1;\n",
			),
		).toBe("export default 1;");
		expect(viewportContainerClass("desktop")).toBe("w-full");
		expect(viewportContainerClass("tablet")).toContain("48rem");
		expect(viewportContainerClass("mobile")).toContain("24.375rem");
	});
});
