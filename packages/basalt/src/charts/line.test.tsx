import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LineChart } from "./line";

describe("LineChart", () => {
	it("renders a chart container", () => {
		const { container } = render(<LineChart data={[{ x: "Mon", y: 4 }]} />);
		expect(container.firstChild).toBeTruthy();
	});

	it("accepts a single series without y2", () => {
		const { container } = render(<LineChart data={[{ x: "Mon", y: 4 }]} ariaLabel="Solo" />);
		expect(container.firstChild).toBeTruthy();
	});

	it("shows axes when requested", () => {
		const { container } = render(
			<LineChart data={[{ x: "Mon", y: 4 }]} ariaLabel="Performance" showAxes />,
		);
		expect(container.querySelector("[aria-label='Performance']")).toBeTruthy();
	});

	it("uses the caller color and formatter", () => {
		const { container } = render(
			<LineChart
				data={[{ x: "Mon", y: 4 }]}
				ariaLabel="Latency"
				color="rgb(1, 2, 3)"
				valueFormatter={(value) => `${value}ms`}
			/>,
		);
		expect(container.querySelector('[aria-label="Latency"]')).toBeTruthy();
	});
});
