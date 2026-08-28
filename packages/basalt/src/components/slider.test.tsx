import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Slider } from "./slider";

describe("Slider", () => {
	it("renders a slider", () => {
		const { container } = render(<Slider defaultValue={[40]} aria-label="Volume" />);
		expect(container.querySelector('[role="slider"]')).toBeTruthy();
	});
});
