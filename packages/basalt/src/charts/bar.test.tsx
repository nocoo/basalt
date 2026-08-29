import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./bar";

describe("BarChart", () => {
	it("renders", () => {
		expect(render(<BarChart />).container.firstChild).toBeTruthy();
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
});
