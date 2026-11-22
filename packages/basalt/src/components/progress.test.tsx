import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress";

describe("Progress", () => {
	it("renders determinate progress, indicator transform, and semantic tone", () => {
		const ref = createRef<HTMLDivElement>();
		render(<Progress ref={ref} value={65} tone="success" size="lg" aria-label="Upload progress" />);

		const bar = screen.getByRole("progressbar", { name: "Upload progress" });
		expect(ref.current).toBe(bar);
		expect(bar).toHaveAttribute("data-slot", "progress");
		expect(bar).toHaveAttribute("data-size", "lg");
		expect(bar).toHaveAttribute("data-tone", "success");
		expect(bar).toHaveAttribute("data-state", "loading");
		expect(bar).toHaveAttribute("aria-valuenow", "65");
		expect(bar).toHaveAttribute("aria-valuemax", "100");
		expect(bar).toHaveClass("basalt-ui", "basalt-meter-track", "h-basalt-3");

		const indicator = bar.querySelector('[data-slot="progress-indicator"]');
		expect(indicator).toHaveStyle({ transform: "translateX(-35%)" });
		expect(indicator).toHaveClass("bg-basalt-success-solid");
		expect(indicator).not.toHaveClass("opacity-0");
	});

	it("clamps out-of-range values, handles zero opacity, complete state, and custom max", () => {
		const { rerender } = render(<Progress value={-10} aria-label="Build" />);
		let bar = screen.getByRole("progressbar", { name: "Build" });
		expect(bar).toHaveAttribute("aria-valuenow", "0");
		expect(bar.querySelector('[data-slot="progress-indicator"]')).toHaveClass("opacity-0");

		rerender(<Progress value={300} max={200} tone="warning" size="sm" aria-label="Build" />);
		bar = screen.getByRole("progressbar", { name: "Build" });
		expect(bar).toHaveAttribute("aria-valuenow", "200");
		expect(bar).toHaveAttribute("aria-valuemax", "200");
		expect(bar).toHaveAttribute("data-state", "complete");
		expect(bar).toHaveClass("h-basalt-1_5");
		expect(bar.querySelector('[data-slot="progress-indicator"]')).toHaveClass(
			"bg-basalt-warning-solid",
		);

		rerender(<Progress value={25} max={0} tone="danger" aria-label="Build" />);
		bar = screen.getByRole("progressbar", { name: "Build" });
		expect(bar).toHaveAttribute("aria-valuemax", "100");
		expect(bar).toHaveAttribute("aria-valuenow", "25");
		expect(bar.querySelector('[data-slot="progress-indicator"]')).toHaveClass(
			"bg-basalt-danger-solid",
		);
	});

	it("renders indeterminate progress when value is omitted, null, or non-finite", () => {
		const { rerender } = render(<Progress aria-label="Syncing" />);
		const bar = screen.getByRole("progressbar", { name: "Syncing" });
		expect(bar).toHaveAttribute("data-state", "indeterminate");
		expect(bar).not.toHaveAttribute("aria-valuenow");
		expect(bar.querySelector('[data-slot="progress-indicator"]')).toHaveClass(
			"animate-basalt-progress-indeterminate",
			"motion-reduce:animate-none",
		);

		rerender(<Progress value={null} aria-label="Syncing" />);
		expect(screen.getByRole("progressbar", { name: "Syncing" })).toHaveAttribute(
			"data-state",
			"indeterminate",
		);

		rerender(<Progress value={Number.NaN} aria-label="Syncing" />);
		expect(screen.getByRole("progressbar", { name: "Syncing" })).toHaveAttribute(
			"data-state",
			"indeterminate",
		);
	});
});
