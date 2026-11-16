import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter } from "./meter";

describe("Meter", () => {
	it("renders a labelled header row aligned above a continuous matte bar track", () => {
		const { container } = render(<Meter value={40} label="Usage" />);
		expect(container.firstElementChild).toHaveClass("basalt-ui");
		expect(screen.getByText("Usage")).toHaveAttribute("data-slot", "meter-label");
		expect(screen.getByText("40%")).toHaveAttribute("data-slot", "meter-value");

		const meter = screen.getByRole("meter", { name: "Usage" });
		expect(meter).toHaveAttribute("data-basalt-meter", "");
		expect(meter).toHaveAttribute("data-variant", "bar");
		expect(meter).toHaveAttribute("data-tone", "default");
		expect(meter).toHaveAttribute("data-size", "md");
		expect(meter).toHaveAttribute("aria-valuenow", "40");
		expect(meter).toHaveClass("basalt-meter-track", "h-basalt-2", "rounded-basalt-full");

		const indicator = container.querySelector('[data-slot="meter-indicator"]');
		expect(indicator).toHaveClass("basalt-meter-fill", "bg-basalt-primary");
		expect(indicator).toHaveStyle({ transform: "translateX(-60%)" });
	});

	it("renders inline compact reading without a header when label is omitted", () => {
		const { container } = render(<Meter value={42} aria-label="Quota" />);
		expect(container.querySelector('[data-slot="meter-label"]')).toBeNull();
		const value = screen.getByText("42%");
		expect(value).toHaveAttribute("data-slot", "meter-value");
		expect(value).toHaveClass("font-basalt-mono", "text-basalt-xs", "min-w-[3.5ch]", "text-end");
	});

	it("accepts a custom value display without numeric column padding when unlabelled", () => {
		const { rerender } = render(<Meter value={12} customValue="12 GB" aria-label="Storage" />);
		const inlineValue = screen.getByText("12 GB");
		expect(inlineValue).toHaveAttribute("data-slot", "meter-value");
		expect(inlineValue).not.toHaveClass("min-w-[3.5ch]");

		rerender(<Meter value={12} label="Storage" customValue="12 GB" />);
		expect(screen.getByText("12 GB")).toHaveClass("font-basalt-mono", "text-basalt-sm");
	});

	it("renders a bare track without captions when both label and value are omitted", () => {
		const { container } = render(<Meter value={8} hideValue />);
		expect(container.querySelector("[data-state]")).toBeTruthy();
		expect(container.querySelector('[data-slot="meter-label"]')).toBeNull();
		expect(container.querySelector('[data-slot="meter-value"]')).toBeNull();
	});

	it("hides the value while preserving a labelled header", () => {
		render(<Meter value={40} label="Usage" hideValue />);
		expect(screen.getByText("Usage")).toBeInTheDocument();
		expect(screen.queryByText("40%")).not.toBeInTheDocument();
	});

	it("supports explicit and threshold-driven auto semantic tones", () => {
		const { container, rerender } = render(<Meter value={50} label="Health" tone="success" />);
		expect(screen.getByRole("meter")).toHaveAttribute("data-tone", "success");
		expect(container.querySelector('[data-slot="meter-indicator"]')).toHaveClass(
			"bg-basalt-badge-green",
		);

		rerender(<Meter value={69} label="Memory" tone="auto" />);
		expect(screen.getByRole("meter")).toHaveAttribute("data-tone", "default");
		expect(container.querySelector('[data-slot="meter-indicator"]')).toHaveClass(
			"bg-basalt-primary",
		);

		rerender(<Meter value={70} label="Memory" tone="auto" />);
		expect(screen.getByRole("meter")).toHaveAttribute("data-tone", "warning");
		expect(container.querySelector('[data-slot="meter-indicator"]')).toHaveClass(
			"bg-basalt-warning",
		);

		rerender(<Meter value={90} label="Memory" tone="auto" />);
		expect(screen.getByRole("meter")).toHaveAttribute("data-tone", "danger");
		expect(container.querySelector('[data-slot="meter-indicator"]')).toHaveClass(
			"bg-basalt-danger",
		);
	});

	it("applies size height tiers across continuous and segmented variants", () => {
		const { rerender } = render(<Meter value={50} label="Bar" size="sm" />);
		expect(screen.getByRole("meter")).toHaveAttribute("data-size", "sm");
		expect(screen.getByRole("meter")).toHaveClass("h-basalt-1_5");

		rerender(<Meter value={50} label="Bar" size="lg" />);
		expect(screen.getByRole("meter")).toHaveClass("h-basalt-3");

		rerender(<Meter value={50} label="Segmented" variant="segmented" size="sm" />);
		expect(screen.getByRole("meter")).toHaveClass("h-basalt-2");

		rerender(<Meter value={50} label="Segmented" variant="segmented" size="lg" />);
		expect(screen.getByRole("meter")).toHaveClass("h-basalt-3_5");
	});

	it("renders twenty uniform cells in segmented variant and keeps minimum one cell when positive", () => {
		const { container, rerender } = render(
			<Meter value={82} variant="segmented" tone="warning" aria-label="Win probability" />,
		);
		const meter = screen.getByRole("meter", { name: "Win probability" });
		expect(meter).toHaveAttribute("data-variant", "segmented");
		expect(meter).toHaveAttribute("aria-valuenow", "82");
		const cells = container.querySelectorAll('[data-slot="meter-cell"]');
		expect(cells).toHaveLength(20);
		const filled = container.querySelectorAll('[data-filled="true"]');
		expect(filled).toHaveLength(16);
		for (const cell of filled) {
			expect(cell).toHaveClass("basalt-meter-cell", "bg-basalt-warning");
		}
		expect(cells[16]).toHaveAttribute("data-filled", "false");
		expect(cells[16]?.className).not.toContain("bg-basalt-warning");

		rerender(<Meter value={2} variant="segmented" label="Low positive" />);
		expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(1);
	});

	it.each([
		[0, 0, "translateX(-100%)"],
		[24, 5, "translateX(-76%)"],
		[38, 8, "translateX(-62%)"],
		[100, 20, "translateX(-0%)"],
		[-20, 0, "translateX(-100%)"],
		[150, 20, "translateX(-0%)"],
	])(
		"clamps %s and updates both indicator transform and segmented count (%s)",
		(value, count, transform) => {
			const clamped = Math.min(100, Math.max(0, value));
			const { container, rerender } = render(<Meter value={value} label="Usage" />);
			expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", String(clamped));
			const barIndicator = container.querySelector('[data-slot="meter-indicator"]');
			expect(barIndicator).toHaveStyle({ transform });
			if (clamped === 0) expect(barIndicator).toHaveClass("opacity-0");
			else expect(barIndicator).not.toHaveClass("opacity-0");

			rerender(<Meter value={value} label="Usage" variant="segmented" />);
			expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(count);
		},
	);

	it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
		"announces non-finite reading %s as unavailable",
		(value) => {
			const { container, rerender } = render(<Meter value={value} label="Usage" />);
			expect(screen.getByText("Unavailable")).toBeInTheDocument();
			expect(screen.getByRole("meter")).not.toHaveAttribute("aria-valuenow");
			expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "Unavailable");
			expect(container.querySelector('[data-slot="meter-indicator"]')).toHaveClass("opacity-0");

			rerender(<Meter value={value} label="Usage" variant="segmented" />);
			expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(0);
		},
	);

	it("defaults to zero and preserves custom accessible labels", () => {
		const { rerender } = render(<Meter />);
		expect(screen.getByText("0%")).toBeInTheDocument();
		rerender(<Meter value={12} label="Storage" customValue="12 GB" aria-label="Disk usage" />);
		expect(screen.getByRole("meter", { name: "Disk usage" })).toHaveAttribute(
			"aria-valuetext",
			"12 GB",
		);
	});
});
