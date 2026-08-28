import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
	it("renders a date input", () => {
		const { container } = render(<DatePicker aria-label="Date" />);
		expect(container.querySelector('input[type="date"]')).toBeTruthy();
	});

	it("formats the selected value with locale props", () => {
		render(
			<DatePicker
				value="2024-01-15"
				locale="en-US"
				weekStartsOn={1}
				timeZone="UTC"
				formatDate={() => "formatted"}
				aria-label="Date"
			/>,
		);
		expect(screen.getByRole("button", { name: "Date" })).toHaveTextContent("formatted");
	});

	it("keeps civil dates stable across time zones", () => {
		render(<DatePicker value="2024-01-15" locale="en-US" timeZone="UTC" aria-label="Date" />);
		expect(screen.getByRole("button", { name: "Date" })).toHaveTextContent("Jan 15, 2024");
	});

	it("shows a placeholder before a value is chosen", () => {
		render(<DatePicker aria-label="Date" name="when" />);
		expect(screen.getByRole("button", { name: "Date" })).toHaveTextContent("Pick a date");
	});

	it("commits a day from the calendar", () => {
		const onChange = vi.fn();
		render(
			<DatePicker defaultValue="2024-01-15" onChange={onChange} aria-label="Date" name="when" />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Date" }));
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		fireEvent.click(screen.getByRole("button", { name: "Prev" }));
		fireEvent.click(screen.getByRole("button", { name: "15" }));
		expect(onChange).toHaveBeenCalled();
	});
});
