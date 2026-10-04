import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter } from "./meter";

describe("Meter", () => {
	it("shows the label", () => {
		render(<Meter value={40} label="Usage" />);
		expect(screen.getByText("Usage")).toBeInTheDocument();
		expect(screen.getByText("40%")).toBeInTheDocument();
	});

	it("accepts a custom value label", () => {
		render(<Meter value={12} customValue="12 GB" />);
		expect(screen.getByText("12 GB")).toBeInTheDocument();
	});

	it("renders without captions", () => {
		const { container } = render(<Meter value={8} />);
		expect(container.querySelector("[data-state]")).toBeTruthy();
	});

	it("can hide the value", () => {
		render(<Meter value={40} label="Usage" hideValue />);
		expect(screen.getByText("Usage")).toBeInTheDocument();
		expect(screen.queryByText("40%")).not.toBeInTheDocument();
	});

	it("renders seventeen slots with red, yellow and green filled segments", () => {
		const { container } = render(<Meter value={82} aria-label="Win probability" />);
		expect(screen.getByRole("progressbar", { name: "Win probability" })).toHaveAttribute(
			"aria-valuenow",
			"82",
		);
		expect(container.querySelectorAll("[data-filled]")).toHaveLength(17);
		const filled = container.querySelectorAll('[data-filled="true"]');
		expect(filled).toHaveLength(14);
		expect(filled[0]).toHaveClass("bg-basalt-danger");
		expect(filled[4]?.className).toContain("--basalt-chart-yellow");
		expect(filled[13]?.className).toContain("--basalt-chart-green");
	});

	it.each([
		[0, 0],
		[24, 4],
		[44, 7],
		[38, 6],
		[100, 17],
		[-20, 0],
		[150, 17],
	])("renders %s as %s filled slots", (value, count) => {
		const { container } = render(<Meter value={value} label="Usage" />);
		expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(count);
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuenow",
			String(Math.min(100, Math.max(0, value))),
		);
	});

	it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
		"announces non-finite reading %s as unavailable",
		(value) => {
			const { container } = render(<Meter value={value} label="Usage" />);
			expect(screen.getByText("Unavailable")).toBeInTheDocument();
			expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
			expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(0);
		},
	);

	it("defaults to zero and preserves a custom accessible value", () => {
		const { rerender } = render(<Meter />);
		expect(screen.getByText("0%")).toBeInTheDocument();
		rerender(<Meter value={12} label="Storage" customValue="12 GB" aria-label="Disk usage" />);
		expect(screen.getByRole("progressbar", { name: "Disk usage" })).toHaveAttribute(
			"aria-valuetext",
			"12 GB",
		);
	});
});
