import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./bar";

describe("BarChart", () => {
	it("renders", () => {
		expect(render(<BarChart data={[{ x: "Jan", y: 12 }]} />).container.firstChild).toBeTruthy();
	});

	it("accepts page data and visible axes", () => {
		const { container } = render(
			<BarChart
				data={[{ x: "Jan", y: 12 }]}
				ariaLabel="Budget vs actual"
				showAxes
				className="h-40 w-full"
			/>,
		);
		expect(container.querySelector("[aria-label='Budget vs actual']")).toBeTruthy();
	});

	it("uses the caller color", () => {
		const { container } = render(
			<BarChart data={[{ x: "Jan", y: 12 }]} ariaLabel="Tinted" color="rgb(1, 2, 3)" />,
		);
		expect(container.querySelector('[aria-label="Tinted"]')).toBeTruthy();
	});
});
