import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
	it("renders a date input", () => {
		const { container } = render(<DatePicker aria-label="Date" />);
		expect(container.querySelector('input[type="date"]')).toBeTruthy();
	});
});
