import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { CatalogIndexGroup, CatalogIndexItem } from "@/pages/ui/catalog-index";
import { HomeGrid } from "@/pages/ui/HomeGrid";

function item(slug: string, category: CatalogIndexItem["entry"]["category"]): CatalogIndexItem {
	return {
		pageStatus: "ready",
		docs: {
			description: slug,
			usage: "",
			variants: [],
			api: [],
			implementationSource: {
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: slug,
			},
		},
		hero: {
			id: `${slug}-default`,
			title: slug,
			code: "",
			render: () => <span>{slug}</span>,
		},
		releaseStatus: "stable",
		entry: {
			slug,
			name: slug,
			exportName: slug,
			importPath: `@nocoo/basalt/components/${slug}`,
			hasRootBarrel: true,
			kind: "stable",
			category,
		},
	};
}

const GROUPS: CatalogIndexGroup[] = [
	{
		id: "layout",
		label: "Layouts",
		items: [
			item("table", "layout"),
			item("data-table", "layout"),
			item("diff-table", "layout"),
			item("table-pager", "layout"),
			item("grid", "layout"),
		],
	},
	{
		id: "action",
		label: "Actions",
		items: [item("button", "action")],
	},
];

describe("HomeGrid", () => {
	it("gives full table examples horizontal room and keeps compact primitives dense", () => {
		render(
			<MemoryRouter>
				<HomeGrid groups={GROUPS} />
			</MemoryRouter>,
		);
		for (const slug of ["table", "data-table", "diff-table"]) {
			const card = document.querySelector(`[data-catalog-card="${slug}"]`);
			expect(card, slug).toHaveAttribute("data-gallery-span", "full");
			expect(card, slug).toHaveClass("md:col-span-2");
			expect(card?.querySelector("[data-gallery-preview]"), slug).toHaveClass(
				"overflow-x-auto",
				"p-basalt-space-lg",
			);
		}
		const pager = document.querySelector('[data-catalog-card="table-pager"]');
		expect(pager).toHaveAttribute("data-gallery-span", "compact");
		expect(pager).not.toHaveClass("md:col-span-2");
		const tablesGrid = screen.getByRole("region", { name: "Tables" }).querySelector("ul");
		expect(tablesGrid).toHaveClass("md:grid-cols-2");
		expect(tablesGrid).not.toHaveClass("lg:grid-cols-3");
		expect(document.querySelector('[data-catalog-card="button"]')).toHaveAttribute(
			"data-gallery-span",
			"compact",
		);
		expect(
			screen.getByRole("region", { name: "Tables" }).querySelectorAll("[data-slot='card-header']"),
		).toHaveLength(1);
		expect(screen.getByRole("region", { name: "Actions" }).querySelector("ul")).toHaveClass(
			"lg:grid-cols-3",
		);
	});
});
