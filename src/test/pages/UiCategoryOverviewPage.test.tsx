import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { catalogNavName, libraryNavEntries } from "@/pages/ui/catalog";
import { CATALOG_CATEGORIES, catalogCategoryPath } from "@/pages/ui/catalog-categories";
import { CATEGORY_GUIDES } from "@/pages/ui/catalog-category-guides";
import { catalogPageStatus } from "@/pages/ui/catalog-page-status";
import UiCategoryOverviewPage from "@/pages/ui/UiCategoryOverviewPage";

function renderOverview(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route path="/ui/overview/:category" element={<UiCategoryOverviewPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("category overview pages", () => {
	it.each(CATALOG_CATEGORIES)(
		"documents $label without loading interactive catalog demos",
		(category) => {
			const { container } = renderOverview(catalogCategoryPath(category.id));
			const page = container.querySelector("[data-showcase-page]");
			expect(page).toHaveAttribute("data-category-overview", category.id);
			expect(page?.className).not.toMatch(/\bp-/);
			const cards = Array.from(container.querySelectorAll("[data-basalt-surface]")).filter(
				(card) => !card.parentElement?.closest("[data-basalt-surface]"),
			);
			expect(cards).toHaveLength(6);
			for (const card of cards) {
				expect(card).toHaveClass("p-basalt-card");
				expect(card).not.toHaveAttribute("data-card-structured");
				expect(card.querySelector('[data-slot="card-header"], [data-slot="card-body"]')).toBeNull();
			}
			expect(screen.getByText(CATEGORY_GUIDES[category.id].rationale)).toHaveClass(
				"text-basalt-foreground",
			);
			expect(
				screen.getByText(CATEGORY_GUIDES[category.id].rationale).closest("[data-basalt-surface]"),
			).toBe(cards[0]);
			expect(
				within(cards[1] as HTMLElement).getByRole("heading", { name: "Size and spacing" }),
			).toBeInTheDocument();
			expect(
				within(cards[2] as HTMLElement).getByRole("heading", { name: "Interaction and motion" }),
			).toBeInTheDocument();
			expect(cards[3].querySelector("ul")).not.toBeNull();
			expect(cards[4].querySelector("ul")).not.toBeNull();
			expect(
				within(cards[5] as HTMLElement).getByRole("heading", { name: "One shared contract" }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: `${category.label} overview` }),
			).toBeInTheDocument();
			for (const title of [
				"Design thinking",
				"Size and spacing",
				"Interaction and motion",
				"Best practices",
				"In this group",
				"One shared contract",
			]) {
				expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
			}
			for (const practice of CATEGORY_GUIDES[category.id].practices)
				expect(screen.getByText(practice)).toBeInTheDocument();
			expect(screen.getByText(category.size)).toBeInTheDocument();
			for (const entry of libraryNavEntries(category.id)) {
				if (catalogPageStatus(entry.slug) === "ready") {
					expect(screen.getByRole("link", { name: catalogNavName(entry) })).toHaveAttribute(
						"href",
						`/ui/${entry.slug}`,
					);
				} else {
					expect(
						screen.queryByRole("link", { name: catalogNavName(entry) }),
					).not.toBeInTheDocument();
					expect(screen.getByText("Planned")).toBeInTheDocument();
				}
			}
			expect(screen.getByRole("link", { name: "Design contract" })).toHaveAttribute(
				"href",
				"https://github.com/nocoo/basalt/blob/main/DESIGN.md",
			);
			expect(document.querySelector("[data-hero-scenario]")).toBeNull();
		},
	);

	it("does not silently render another category for an invalid URL", () => {
		renderOverview("/ui/overview/missing");
		expect(screen.getByRole("heading", { name: "Category not found" })).toBeInTheDocument();
		const indexLink = screen.getByRole("link", { name: "Library index" });
		expect(indexLink).toHaveAttribute("href", "/ui");
		expect(indexLink.closest("[data-basalt-surface]")).toHaveClass("p-basalt-card");
	});
	it.each(["card", "layout"] as const)("previews the extra-large %s spacing tier", (category) => {
		const { container } = renderOverview(`/ui/overview/${category}`);
		fireEvent.keyDown(screen.getByRole("combobox", { name: "Spacing tier" }), { key: "ArrowDown" });
		fireEvent.click(screen.getByRole("option", { name: "Extra large - 32px / 2rem" }));
		expect(container.querySelector(`[data-spacing-preview="${category}"]`)).toHaveClass(
			category === "card" ? "p-basalt-card-xl" : "gap-basalt-layout-xl",
		);
	});
});
