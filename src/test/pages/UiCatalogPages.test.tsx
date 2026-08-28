import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { CATALOG } from "@/pages/ui/catalog";
import UiIndexPage from "@/pages/ui/UiIndexPage";
import UiPlaceholderPage from "@/pages/ui/UiPlaceholderPage";

function renderCatalog(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route path="/ui" element={<UiIndexPage />} />
				<Route path="/ui/:slug" element={<UiPlaceholderPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("ui catalog", () => {
	it("lists 79 unique public exports", () => {
		const slugs = CATALOG.map((entry) => entry.slug);
		expect(slugs).toHaveLength(79);
		expect(new Set(slugs).size).toBe(79);
	});

	it("renders the index with links to every export", () => {
		renderCatalog("/ui");
		expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();
		for (const entry of CATALOG) {
			expect(screen.getByRole("link", { name: entry.name })).toHaveAttribute(
				"href",
				`/ui/${entry.slug}`,
			);
		}
	});

	it("renders a placeholder catalog page for a known slug", () => {
		renderCatalog("/ui/select");
		expect(screen.getByRole("heading", { name: "Select" })).toBeInTheDocument();
		expect(document.querySelector("[data-status='placeholder']")).toBeTruthy();
		expect(screen.getByText(/未实现/)).toBeInTheDocument();
	});

	it("marks unknown slugs as missing", () => {
		renderCatalog("/ui/not-a-control");
		expect(document.querySelector("[data-status='missing']")).toBeTruthy();
	});
});
