import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./bar";

describe("BarChart", () => {
	it("renders", () => {
		expect(render(<BarChart />).container.firstChild).toBeTruthy();
	});
});
