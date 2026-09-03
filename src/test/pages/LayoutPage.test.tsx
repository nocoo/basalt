import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LayoutPage from "@/pages/LayoutPage";

describe("LayoutPage", () => {
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
