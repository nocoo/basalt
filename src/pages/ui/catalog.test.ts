import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
	CATALOG,
	CATALOG_BY_SLUG,
	CATALOG_CATEGORIES,
	catalogBarrelImport,
	catalogExportName,
	catalogGranularImport,
	catalogImportPath,
	libraryNavEntries,
} from "./catalog";
import { catalogCategory, catalogCategoryPath } from "./catalog-categories";
import { CATEGORY_GUIDES } from "./catalog-category-guides";

describe("catalog entries", () => {
	it("assigns every original component to its DESIGN category, including module aliases", () => {
		const design = readFileSync("DESIGN.md", "utf8");
		const designNames = [
			"Inline",
			"Action",
			"Banner",
			"Card / content surface",
			"Layout / composite",
			"Overlay composite",
			"Graphic / text primitive",
		];
		const componentCategories = CATALOG_CATEGORIES.filter(
			(category) => category.id !== "chart" && category.id !== "block",
		);
		for (const [index, category] of componentCategories.entries()) {
			const row = design.split("\n").find((line) => line.startsWith(`| ${designNames[index]} |`));
			expect(row).toBeDefined();
			for (const entry of libraryNavEntries(category.id)) {
				if (entry.kind === "provider") {
					expect(category.id).toBe("layout");
				} else {
					expect(row, entry.slug).toContain(`\`${entry.importPath.split("/").pop()}\``);
				}
			}
		}
		expect(CATALOG_BY_SLUG.get("code-block")?.category).toBe("card");
		expect(CATALOG_BY_SLUG.get("link-button")?.category).toBe("action");
	});

	it("provides one overview and complete navigation per category without duplicating exports", () => {
		const paths = CATALOG_CATEGORIES.map((category) => catalogCategoryPath(category.id));
		expect(new Set(paths).size).toBe(9);
		const entries = CATALOG_CATEGORIES.flatMap((category) => {
			expect(catalogCategory(category.id)).toBe(category);
			expect(CATEGORY_GUIDES[category.id].practices).toHaveLength(4);
			return libraryNavEntries(category.id);
		});
		expect(entries).toHaveLength(CATALOG.length);
		expect(new Set(entries.map((entry) => entry.slug)).size).toBe(CATALOG.length);
		expect(catalogCategory("unknown")).toBeUndefined();
		expect(catalogCategory(undefined)).toBeUndefined();
	});

	it("does not carry a maturity field on catalog entries", () => {
		expect(
			CATALOG.filter((entry) => entry.category !== "chart" && entry.category !== "block"),
		).toHaveLength(93);
		expect(CATALOG.every((entry) => !("maturity" in entry))).toBe(true);
	});

	it("strictly defines required exportName, importPath, and hasRootBarrel without fallback guesses", () => {
		for (const entry of CATALOG) {
			expect(typeof entry.exportName).toBe("string");
			expect(entry.exportName.length).toBeGreaterThan(0);
			expect(/^[A-Za-z_$][\w$]*$/.test(entry.exportName)).toBe(true);

			expect(typeof entry.importPath).toBe("string");
			expect(entry.importPath.startsWith("@nocoo/basalt/")).toBe(true);

			expect(typeof entry.hasRootBarrel).toBe("boolean");

			expect(catalogExportName(entry)).toBe(entry.exportName);
			expect(catalogImportPath(entry)).toBe(entry.importPath);
			expect(catalogGranularImport(entry)).toBe(
				`import { ${entry.exportName} } from "${entry.importPath}";`,
			);

			if (entry.hasRootBarrel) {
				expect(catalogBarrelImport(entry)).toBe(
					`import { ${entry.exportName} } from "@nocoo/basalt";`,
				);
			} else {
				expect(catalogBarrelImport(entry)).toBeNull();
			}
		}
	});

	it("accurately maps multi-word blocks and charts to valid PascalCase export names", () => {
		const customChart = CATALOG_BY_SLUG.get("custom-chart");
		if (!customChart) throw new Error("custom-chart missing");
		expect(customChart.name).toBe("Custom Chart");
		expect(customChart.exportName).toBe("CustomChart");
		expect(customChart.importPath).toBe("@nocoo/basalt/charts/custom-chart");
		expect(customChart.hasRootBarrel).toBe(false);
		expect(catalogGranularImport(customChart)).toBe(
			'import { CustomChart } from "@nocoo/basalt/charts/custom-chart";',
		);
		expect(catalogBarrelImport(customChart)).toBeNull();

		const pageHeader = CATALOG_BY_SLUG.get("page-header");
		if (!pageHeader) throw new Error("page-header missing");
		expect(pageHeader.name).toBe("Page Header");
		expect(pageHeader.exportName).toBe("PageHeader");
		expect(pageHeader.importPath).toBe("@nocoo/basalt/components/page-header");
		expect(pageHeader.hasRootBarrel).toBe(false);
		expect(catalogGranularImport(pageHeader)).toBe(
			'import { PageHeader } from "@nocoo/basalt/components/page-header";',
		);
		expect(catalogBarrelImport(pageHeader)).toBeNull();

		const resourceList = CATALOG_BY_SLUG.get("resource-list");
		if (!resourceList) throw new Error("resource-list missing");
		expect(resourceList.name).toBe("Resource List");
		expect(resourceList.exportName).toBe("ResourceList");
		expect(resourceList.importPath).toBe("@nocoo/basalt/components/resource-list");
		expect(resourceList.hasRootBarrel).toBe(false);
		expect(catalogGranularImport(resourceList)).toBe(
			'import { ResourceList } from "@nocoo/basalt/components/resource-list";',
		);
		expect(catalogBarrelImport(resourceList)).toBeNull();

		const deleteResource = CATALOG_BY_SLUG.get("delete-resource");
		if (!deleteResource) throw new Error("delete-resource missing");
		expect(deleteResource.name).toBe("Delete Resource");
		expect(deleteResource.exportName).toBe("DeleteResource");
		expect(deleteResource.importPath).toBe("@nocoo/basalt/components/delete-resource");
		expect(deleteResource.hasRootBarrel).toBe(false);
		expect(catalogGranularImport(deleteResource)).toBe(
			'import { DeleteResource } from "@nocoo/basalt/components/delete-resource";',
		);
		expect(catalogBarrelImport(deleteResource)).toBeNull();
	});

	it("strictly respects hasRootBarrel for root barrel generation", () => {
		const button = CATALOG_BY_SLUG.get("button");
		if (!button) throw new Error("button missing");
		expect(button.hasRootBarrel).toBe(true);
		expect(catalogBarrelImport(button)).toBe('import { Button } from "@nocoo/basalt";');

		const linkButton = CATALOG_BY_SLUG.get("link-button");
		if (!linkButton) throw new Error("link-button missing");
		expect(linkButton.exportName).toBe("LinkButton");
		expect(linkButton.importPath).toBe("@nocoo/basalt/components/button");
		expect(linkButton.hasRootBarrel).toBe(false);
		expect(catalogBarrelImport(linkButton)).toBeNull();
		expect(catalogGranularImport(linkButton)).toBe(
			'import { LinkButton } from "@nocoo/basalt/components/button";',
		);
	});
});
