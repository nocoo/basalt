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
		expect(screen.getByRole("button", { name: /Date/ })).toHaveTextContent("formatted");
	});

	it("passes the civil local day to formatDate", () => {
		render(
			<DatePicker
				value="2024-01-15"
				formatDate={(date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
				aria-label="Date"
			/>,
		);
		expect(screen.getByRole("button", { name: /Date/ })).toHaveTextContent("2024-1-15");
	});

	it("keeps civil dates stable across time zones", () => {
		render(<DatePicker value="2024-01-15" locale="en-US" timeZone="UTC" aria-label="Date" />);
		expect(screen.getByRole("button", { name: /Date/ })).toHaveTextContent("Jan 15, 2024");
	});

	it("shows a placeholder before a value is chosen", () => {
		render(<DatePicker aria-label="Date" name="when" />);
		expect(screen.getByRole("button", { name: "Date" })).toHaveTextContent("Pick a date");
	});

	it("closes the calendar when it becomes disabled", () => {
		const onChange = vi.fn();
		const { rerender } = render(
			<DatePicker defaultValue="2024-01-15" onChange={onChange} aria-label="Date" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(screen.getByRole("button", { name: "2024-01-15" })).toBeInTheDocument();
		rerender(
			<DatePicker defaultValue="2024-01-15" disabled onChange={onChange} aria-label="Date" />,
		);
		expect(screen.queryByRole("button", { name: "2024-01-16" })).not.toBeInTheDocument();
		expect(onChange).not.toHaveBeenCalled();
	});

	it("moves calendar focus with arrow keys", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const selected = screen.getByRole("button", { name: "2024-01-15" });
		expect(selected).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(selected, { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "2024-01-16" })).toHaveAttribute("tabindex", "0");
	});

	it("moves into the next month from the last day", () => {
		render(<DatePicker defaultValue="2024-01-31" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.keyDown(screen.getByRole("button", { name: "2024-01-31" }), { key: "ArrowRight" });
		expect(screen.getByText("February 2024")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "2024-02-01" })).toHaveAttribute("tabindex", "0");
	});

	it("resets the visible month when the value is cleared", () => {
		const { rerender } = render(<DatePicker value="2024-01-15" aria-label="Date" />);
		rerender(<DatePicker value="" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: "Date" }));
		expect(screen.queryByText("January 2024")).not.toBeInTheDocument();
	});

	it("commits a day from the calendar", () => {
		const onChange = vi.fn();
		render(
			<DatePicker defaultValue="2024-01-15" onChange={onChange} aria-label="Date" name="when" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		fireEvent.click(screen.getByRole("button", { name: "Prev" }));
		fireEvent.click(screen.getByRole("button", { name: "2024-01-15" }));
		expect(onChange).toHaveBeenCalled();
		expect(screen.queryByRole("button", { name: "2024-01-16" })).not.toBeInTheDocument();
	});
});
