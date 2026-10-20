import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LayoutPage from "@/pages/LayoutPage";

describe("LayoutPage", () => {
	it("keeps full-page layout links on a shared content island", () => {
		render(<LayoutPage />);
		const section = screen.getByRole("region", { name: "Full-page layout examples" });
		expect(
			within(section).getByRole("heading", { name: "Full-page layout examples" }),
		).toBeInTheDocument();
		const links = within(section).getAllByRole("link");
		expect(links.map((link) => link.getAttribute("href"))).toEqual([
			"/examples/reader",
			"/examples/list-detail",
			"/examples/workspace",
		]);
		const island = links[0].closest("[data-basalt-surface]");
		expect(island).not.toBeNull();
		for (const link of links) expect(link.closest("[data-basalt-surface]")).toBe(island);
	});

	it("teaches nested surfaces with LayerCard instead of card wells", () => {
		const { container } = render(<LayoutPage />);
		expect(screen.getByRole("heading", { name: "Nested surfaces" })).toBeInTheDocument();
		expect(screen.getByText("L2 · LayerCard")).toBeInTheDocument();
		expect(screen.getByText("L3 · LayerCard.Well")).toBeInTheDocument();
		expect(container.querySelector("[data-basalt-surface]")).not.toBeNull();
		expect(container.querySelector(".bg-card")).toBeNull();
		expect(container.querySelector(".bg-muted")).toBeNull();
	});
});
