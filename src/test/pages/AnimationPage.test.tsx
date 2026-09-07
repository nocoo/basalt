import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnimationPage from "@/pages/AnimationPage";

describe("AnimationPage", () => {
	it("renders continuous, overlay and collapse motion", () => {
		render(<AnimationPage />);
		expect(screen.getByRole("heading", { name: "Animation" })).toBeInTheDocument();
		expect(document.querySelector("[data-motion='running']")).toBeTruthy();
		expect(document.querySelectorAll(".animate-basalt-shimmer").length).toBeGreaterThan(0);
		expect(screen.getByRole("button", { name: "Open dialog" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Open sheet" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Open popover" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "First item" })).toBeInTheDocument();
	});

	it("pauses motion without removing the controls", () => {
		render(<AnimationPage />);
		fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));
		expect(document.querySelector("[data-motion='paused']")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Play motion" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Open dialog" })).toBeInTheDocument();
	});

	it("does not paint inner wells with bg-card", () => {
		const { container } = render(<AnimationPage />);
		expect(container.innerHTML).not.toContain("bg-card");
	});
});
