import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LineChart } from "./line";

describe("LineChart", () => {
	it("renders a chart container", () => {
		const { container } = render(<LineChart />);
		expect(container.firstChild).toBeTruthy();
	});
});
