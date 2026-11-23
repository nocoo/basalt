import { render, screen, within } from "@testing-library/react";
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
			item("table-pager", "layout"),
			item("grid", "layout"),
			item("filter-bar", "layout"),
		],
	},
	{
		id: "action",
		label: "Actions",
		items: [item("button", "action"), item("tag-color-picker", "action")],
	},
	{
		id: "card",
		label: "Cards",
		items: [item("code", "card"), item("stat-card", "card")],
	},
	{
		id: "primitive",
		label: "Primitives",
		items: [item("skeleton", "primitive")],
	},
	{
		id: "block",
		label: "Blocks",
		items: [item("page-header", "block"), item("resource-list", "block")],
	},
];

describe("HomeGrid", () => {
	it("gives full and wide examples horizontal room and keeps compact primitives dense", () => {
		render(
			<MemoryRouter>
				<HomeGrid groups={GROUPS} />
			</MemoryRouter>,
		);
		for (const slug of ["table", "data-table"]) {
			const card = document.querySelector(`[data-catalog-card="${slug}"]`);
			expect(card, slug).toHaveAttribute("data-gallery-span", "full");
			expect(card, slug).toHaveClass("@[44rem]/island:col-span-2");
			expect(card?.querySelector("[data-gallery-preview]"), slug).toHaveClass(
				"overflow-x-auto",
				"p-basalt-space-lg",
				"[&>*]:w-full",
			);
		}
		const skeleton = document.querySelector('[data-catalog-card="skeleton"]');
		expect(skeleton).toHaveAttribute("data-gallery-span", "full");
		expect(skeleton).toHaveClass("col-span-full");
		for (const slug of [
			"tag-color-picker",
			"code",
			"stat-card",
			"filter-bar",
			"page-header",
			"resource-list",
		]) {
			const card = document.querySelector(`[data-catalog-card="${slug}"]`);
			expect(card, slug).toHaveAttribute("data-gallery-span", "wide");
			expect(card, slug).toHaveClass(
				"@[44rem]/island:col-span-2",
				"@[60rem]/island:col-span-3",
				"@[84rem]/island:col-span-2",
			);
			expect(card?.querySelector("[data-gallery-preview]"), slug).toHaveClass("[&>*]:w-full");
		}
		const pager = document.querySelector('[data-catalog-card="table-pager"]');
		expect(pager).toHaveAttribute("data-gallery-span", "compact");
		expect(pager).not.toHaveClass("@[44rem]/island:col-span-2");
		const tablesGrid = screen.getByRole("region", { name: "Tables" }).querySelector("ul");
		expect(tablesGrid).toHaveClass("@[44rem]/island:grid-cols-2", "-mb-px", "-mr-px");
		expect(tablesGrid).not.toHaveClass("@[60rem]/island:grid-cols-6");
		expect(document.querySelector('[data-catalog-card="button"]')).toHaveAttribute(
			"data-gallery-span",
			"compact",
		);
		expect(
			screen.getByRole("region", { name: "Tables" }).querySelectorAll("[data-slot='card-header']"),
		).toHaveLength(1);
		expect(screen.getByRole("region", { name: "Actions" }).querySelector("ul")).toHaveClass(
			"@[60rem]/island:grid-cols-6",
			"@[84rem]/island:grid-cols-4",
			"-mb-px",
			"-mr-px",
		);
		for (const [regionName, countLabel] of [
			["Tables", "3 items"],
			["Actions", "2 items"],
		] as const) {
			const region = screen.getByRole("region", { name: regionName });
			const header = region.querySelector("[data-slot='card-header']");
			const heading = within(region).getByRole("heading", { level: 2, name: regionName });
			const grid = region.querySelector("ul");
			expect(header).toHaveAttribute("data-divided", "true");
			expect(header).toHaveClass("p-basalt-card", "border-b");
			expect(header).not.toHaveClass("pb-0");
			expect(heading).not.toHaveClass("text-basalt-xl");
			expect(grid).not.toHaveClass("border-t");
			expect(within(region).getByText(countLabel)).toBeInTheDocument();
		}
		expect(screen.getByRole("link", { name: "Actions overview" })).toHaveAttribute(
			"href",
			"/ui/overview/action",
		);
	});
});
