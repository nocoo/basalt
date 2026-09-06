import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Slider } from "./slider";

describe("Slider", () => {
	it("renders a slider with single thumb and attributes", () => {
		const { container } = render(<Slider defaultValue={[40]} aria-label="Volume" />);
		const thumb = container.querySelector('[role="slider"]');
		expect(thumb).toBeTruthy();
		expect(thumb).toHaveAttribute("aria-label", "Volume");
		expect(thumb).toHaveAttribute("aria-valuenow", "40");
	});

	it("renders multiple thumbs for multi-value range and uses labels prop", () => {
		const { container } = render(
			<Slider defaultValue={[20, 80]} labels={["Minimum range", "Maximum range"]} />,
		);
		const thumbs = container.querySelectorAll('[role="slider"]');
		expect(thumbs).toHaveLength(2);
		expect(thumbs[0]).toHaveAttribute("aria-label", "Minimum range");
		expect(thumbs[0]).toHaveAttribute("aria-valuenow", "20");
		expect(thumbs[1]).toHaveAttribute("aria-label", "Maximum range");
		expect(thumbs[1]).toHaveAttribute("aria-valuenow", "80");
	});

	it("uses contextual root aria-label for multi-value range without labels prop", () => {
		const { container } = render(<Slider defaultValue={[20, 80]} aria-label="Selected range" />);
		const thumbs = container.querySelectorAll('[role="slider"]');
		expect(thumbs).toHaveLength(2);
		expect(thumbs[0]).toHaveAttribute("aria-label", "Selected range minimum");
		expect(thumbs[1]).toHaveAttribute("aria-label", "Selected range maximum");
	});

	it("falls back to Radix default label when neither labels nor aria-label is provided", () => {
		const { container } = render(<Slider defaultValue={[20, 80]} />);
		const thumbs = container.querySelectorAll('[role="slider"]');
		expect(thumbs).toHaveLength(2);
		expect(thumbs[0]).toHaveAttribute("aria-label", "Minimum");
		expect(thumbs[1]).toHaveAttribute("aria-label", "Maximum");
	});

	it("passes aria-labelledby to single thumb", () => {
		const { container } = render(
			<div>
				<span id="vol-lbl">Volume Level</span>
				<Slider defaultValue={[50]} aria-labelledby="vol-lbl" />
			</div>,
		);
		const thumb = container.querySelector('[role="slider"]');
		expect(thumb).toHaveAttribute("aria-labelledby", "vol-lbl");
	});

	it("renders default single thumb when no value or defaultValue is provided", () => {
		const { container } = render(<Slider min={10} max={90} aria-label="Default" />);
		const thumbs = container.querySelectorAll('[role="slider"]');
		expect(thumbs).toHaveLength(1);
		expect(thumbs[0]).toHaveAttribute("aria-label", "Default");
		expect(thumbs[0]).toHaveAttribute("aria-valuenow", "10");
	});

	it("preserves initial thumb count across rerenders for uncontrolled slider", () => {
		const { container, rerender } = render(<Slider defaultValue={[20, 80]} aria-label="Range" />);
		expect(container.querySelectorAll('[role="slider"]')).toHaveLength(2);

		rerender(<Slider defaultValue={[20, 50, 80]} aria-label="Range" />);
		expect(container.querySelectorAll('[role="slider"]')).toHaveLength(2);
	});

	it("updates thumb count when controlled value array changes length", () => {
		const { container, rerender } = render(<Slider value={[30]} aria-label="Controlled" />);
		expect(container.querySelectorAll('[role="slider"]')).toHaveLength(1);

		rerender(<Slider value={[10, 40, 90]} aria-label="Controlled" />);
		expect(container.querySelectorAll('[role="slider"]')).toHaveLength(3);

		rerender(<Slider value={[]} aria-label="Controlled" />);
		expect(container.querySelectorAll('[role="slider"]')).toHaveLength(0);
	});

	it("adapts layout classes for vertical orientation", () => {
		const { container } = render(
			<Slider orientation="vertical" defaultValue={[30]} aria-label="Vertical slider" />,
		);
		const root = container.firstElementChild as HTMLElement;
		expect(root).toHaveAttribute("data-orientation", "vertical");
		expect(root.className).toContain("flex-col");
		const track = root.querySelector('[data-orientation="vertical"]');
		expect(track?.className).toContain("h-full");
		expect(track?.className).toContain("w-2");
	});
});
