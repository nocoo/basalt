import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./date-picker";
import { Field } from "./field";

describe("DatePicker", () => {
	it("renders a date input", () => {
		const { container } = render(<DatePicker aria-label="Date" />);
		expect(container.querySelector('input[type="date"]')).toBeTruthy();
	});

	it("forwards field association props to the trigger", () => {
		render(
			<Field label="Start" htmlFor="start" error="Pick a date">
				<DatePicker id="start" />
			</Field>,
		);
		const trigger = screen.getByRole("button", { name: "Start" });
		expect(trigger).toHaveAttribute("id", "start");
		expect(trigger).not.toHaveAttribute("aria-label");
		expect(trigger).toHaveAttribute("aria-invalid", "true");
		expect(trigger).toHaveAttribute("aria-describedby", "start-error");
		expect(screen.getByLabelText("Start")).toBe(trigger);
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

	it("exposes native date constraints on the form control", () => {
		const { container } = render(
			<form>
				<DatePicker name="when" required min="2020-01-01" max="2030-12-31" aria-label="Date" />
			</form>,
		);
		const control = container.querySelector('input[name="when"]');
		expect(control).toHaveAttribute("type", "date");
		expect(control).toHaveAttribute("required");
		expect(control).toHaveAttribute("min", "2020-01-01");
		expect(control).toHaveAttribute("max", "2030-12-31");
		expect(control).not.toHaveAttribute("readonly");
		expect((control as HTMLInputElement).checkValidity()).toBe(false);
	});

	it("disables calendar days outside min and max", async () => {
		const onChange = vi.fn();
		render(
			<DatePicker
				defaultValue="2024-01-15"
				min="2024-01-10"
				max="2024-01-20"
				onChange={onChange}
				aria-label="Date"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Date: Jan 15, 2024" }));
		expect(await screen.findByRole("button", { name: "2024-01-09" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "2024-01-21" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "2024-01-09" }));
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "2024-01-12" }));
		expect(onChange).toHaveBeenCalledWith("2024-01-12");
	});

	it("focuses an enabled day when the selected date is out of bounds", async () => {
		render(
			<DatePicker defaultValue="2024-01-01" min="2024-01-10" max="2024-01-20" aria-label="Date" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2024-01-10");
		});
		expect(document.activeElement).not.toBeDisabled();
	});

	it("forwards native date input attributes", () => {
		const { container } = render(
			<form id="booking">
				<DatePicker name="when" form="booking" step={7} aria-label="Date" />
			</form>,
		);
		const control = container.querySelector('input[name="when"]');
		expect(control).toHaveAttribute("form", "booking");
		expect(control).toHaveAttribute("step", "7");
	});

	it("compares extended-year bounds numerically", async () => {
		render(<DatePicker defaultValue="9999-12-31" max="9999-12-31" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const overflow = await screen.findByRole("button", { name: "10000-01-01" });
		expect(overflow).toBeDisabled();
	});

	it("matches native date input year range", () => {
		const { container, rerender } = render(
			<form>
				<DatePicker value="0000-01-01" name="when" aria-label="Date" />
			</form>,
		);
		const form = container.querySelector("form") as HTMLFormElement;
		expect(new FormData(form).get("when")).toBe("");
		rerender(
			<form>
				<DatePicker value="10000-01-01" name="when" aria-label="Date" />
			</form>,
		);
		expect(new FormData(container.querySelector("form") as HTMLFormElement).get("when")).toBe(
			"10000-01-01",
		);
	});

	it("does not submit invalid dates", () => {
		const { container } = render(
			<form>
				<DatePicker value="2024-02-30" name="when" aria-label="Date" />
			</form>,
		);
		const form = container.querySelector("form");
		expect(form).toBeTruthy();
		expect(new FormData(form as HTMLFormElement).get("when")).toBe("");
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

	it("refocuses after a controlled value change while open", async () => {
		const { rerender } = render(<DatePicker value="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveFocus();
		});
		rerender(<DatePicker value="2024-01-22" aria-label="Date" />);
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-22" })).toHaveFocus();
		});
		rerender(<DatePicker value="2024-03-20" aria-label="Date" />);
		await waitFor(() => {
			expect(screen.getByText("March 2024")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-03-20" })).toHaveFocus();
		});
	});

	it("focuses the selected day when opened", async () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveFocus();
		});
	});

	it("moves calendar focus with arrow keys", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const selected = screen.getByRole("button", { name: "2024-01-15" });
		expect(selected).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(selected, { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "2024-01-16" })).toHaveAttribute("tabindex", "0");
	});

	it("keeps the tab stop in the navigated month", async () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		await waitFor(() => {
			expect(screen.getByText("February 2024")).toBeInTheDocument();
		});
		const stop = screen.getByRole("button", { name: "2024-02-01" });
		expect(stop).toHaveAttribute("tabindex", "0");
	});

	it("keeps focus on next after month navigation", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const next = screen.getByRole("button", { name: "Next" });
		next.focus();
		fireEvent.click(next);
		expect(screen.getByText("February 2024")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
	});

	it("moves day focus after month navigation when the index is unchanged", () => {
		render(<DatePicker defaultValue="2024-01-04" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const next = screen.getByRole("button", { name: "Next" });
		next.focus();
		fireEvent.click(next);
		expect(screen.getByText("February 2024")).toBeInTheDocument();
		const first = screen.getByRole("button", { name: "2024-02-01" });
		first.focus();
		fireEvent.keyDown(first, { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "2024-02-02" })).toHaveAttribute("tabindex", "0");
	});

	it("restores defaultValue on form reset without a name", async () => {
		render(
			<form>
				<DatePicker defaultValue="2024-01-15" aria-label="Date" />
				<button type="reset">Reset</button>
			</form>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.click(screen.getByRole("button", { name: "2024-01-16" }));
		expect(screen.getByRole("button", { name: /Date/ })).toHaveTextContent("Jan 16, 2024");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: /Date/ })).toHaveTextContent("Jan 15, 2024");
		});
	});

	it("restores defaultValue on form reset", async () => {
		render(
			<form>
				<DatePicker defaultValue="2024-01-15" name="when" aria-label="Date" />
				<button type="reset">Reset</button>
			</form>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.click(screen.getByRole("button", { name: "2024-01-16" }));
		expect(document.querySelector('input[name="when"]')).toHaveValue("2024-01-16");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(document.querySelector('input[name="when"]')).toHaveValue("2024-01-15");
		});
	});

	it("does not restore when form reset is canceled", async () => {
		render(
			<form
				onReset={(event) => {
					event.preventDefault();
				}}
			>
				<DatePicker defaultValue="2024-01-15" name="when" aria-label="Date" />
				<button type="reset">Reset</button>
			</form>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.click(screen.getByRole("button", { name: "2024-01-16" }));
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(document.querySelector('input[name="when"]')).toHaveValue("2024-01-16");
		});
	});

	it("labels the calendar dialog", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(screen.getByRole("dialog", { name: "Date calendar" })).toBeInTheDocument();
	});

	it("moves into the next month from the last day", () => {
		render(<DatePicker defaultValue="2024-01-31" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.keyDown(screen.getByRole("button", { name: "2024-01-31" }), { key: "ArrowRight" });
		expect(screen.getByText("February 2024")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "2024-02-01" })).toHaveAttribute("tabindex", "0");
	});

	it("restores the selected month when reopened", async () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(screen.getByText("February 2024")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(screen.getByText("January 2024")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveFocus();
		});
	});

	it("disables year-zero spillover days", () => {
		render(<DatePicker defaultValue="0001-01-01" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(screen.getByRole("button", { name: "0000-12-31" })).toBeDisabled();
	});

	it("selects canonical ISO days for padded years", async () => {
		render(<DatePicker value="02024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveAttribute(
				"aria-pressed",
				"true",
			);
		});
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveFocus();
		});
	});

	it("ignores values that are not iso dates", () => {
		render(<DatePicker value="not-a-date" aria-label="Date" />);
		expect(screen.getByRole("button", { name: "Date" })).toHaveTextContent("Pick a date");
	});

	it("commits a controlled day with Enter", () => {
		const onChange = vi.fn();
		render(<DatePicker value="2024-01-15" onChange={onChange} aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const grid = screen.getByRole("button", { name: "2024-01-15" }).parentElement;
		fireEvent.keyDown(grid as HTMLElement, { key: "Enter" });
		expect(onChange).toHaveBeenCalledWith("2024-01-15");
	});

	it("commits the focused day with Enter", () => {
		const onChange = vi.fn();
		render(<DatePicker defaultValue="2024-01-15" onChange={onChange} aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const grid = screen.getByRole("button", { name: "2024-01-15" }).parentElement;
		fireEvent.keyDown(grid as HTMLElement, { key: "Enter" });
		expect(onChange).toHaveBeenCalledWith("2024-01-15");
	});

	it("commits the focused day with Space", () => {
		const onChange = vi.fn();
		render(<DatePicker defaultValue="2024-01-15" onChange={onChange} aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const grid = screen.getByRole("button", { name: "2024-01-15" }).parentElement;
		fireEvent.keyDown(grid as HTMLElement, { key: " " });
		expect(onChange).toHaveBeenCalledWith("2024-01-15");
	});

	it("renders without an accessible name", () => {
		render(<DatePicker defaultValue="2024-01-15" />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByRole("dialog", { name: "Date calendar" })).toBeInTheDocument();
	});

	it("moves calendar focus left with arrow keys", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.keyDown(screen.getByRole("button", { name: "2024-01-15" }), { key: "ArrowLeft" });
		expect(screen.getByRole("button", { name: "2024-01-14" })).toHaveAttribute("tabindex", "0");
	});

	it("moves calendar focus down with arrow keys", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.keyDown(screen.getByRole("button", { name: "2024-01-15" }), { key: "ArrowDown" });
		expect(screen.getByRole("button", { name: "2024-01-22" })).toHaveAttribute("tabindex", "0");
	});

	it("moves calendar focus up with arrow keys", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.keyDown(screen.getByRole("button", { name: "2024-01-15" }), { key: "ArrowUp" });
		expect(screen.getByRole("button", { name: "2024-01-08" })).toHaveAttribute("tabindex", "0");
	});

	it("refocuses a day after the time zone changes", async () => {
		const { rerender } = render(<DatePicker aria-label="Date" timeZone="UTC" />);
		fireEvent.click(screen.getByRole("button", { name: "Date" }));
		await waitFor(() => {
			expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
		rerender(<DatePicker aria-label="Date" timeZone="Pacific/Kiritimati" />);
		await waitFor(() => {
			expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	it("keeps the selected day focused when the week start changes", async () => {
		const { rerender } = render(
			<DatePicker defaultValue="2024-01-15" weekStartsOn={0} aria-label="Date" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveFocus();
		});
		rerender(<DatePicker defaultValue="2024-01-15" weekStartsOn={1} aria-label="Date" />);
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveFocus();
		});
	});

	it("keeps the navigated day focused when the week start changes", async () => {
		const { rerender } = render(
			<DatePicker defaultValue="2024-01-15" weekStartsOn={0} aria-label="Date" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "2024-01-15" })).toHaveFocus();
		});
		fireEvent.keyDown(screen.getByRole("button", { name: "2024-01-15" }), { key: "ArrowRight" });
		screen.getByRole("button", { name: "2024-01-16" }).focus();
		expect(screen.getByRole("button", { name: "2024-01-16" })).toHaveAttribute("tabindex", "0");
		rerender(<DatePicker defaultValue="2024-01-15" weekStartsOn={1} aria-label="Date" />);
		expect(screen.getByRole("button", { name: "2024-01-16" })).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(screen.getByRole("button", { name: "2024-01-16" }), { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "2024-01-17" })).toHaveAttribute("tabindex", "0");
	});

	it("disables previous month at year one", () => {
		render(<DatePicker defaultValue="0001-01-01" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const prev = screen.getByRole("button", { name: "Prev" });
		expect(prev).toBeDisabled();
		fireEvent.click(prev);
		expect(screen.getByText("January 1")).toBeInTheDocument();
	});

	it("stops calendar generation at the maximum valid date", () => {
		render(<DatePicker defaultValue="275760-09-13" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(screen.getByRole("button", { name: "275760-09-13" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "275760-09-14" })).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(screen.getByRole("button", { name: "275760-09-13" })).toBeInTheDocument();
		fireEvent.keyDown(screen.getByRole("button", { name: "275760-09-13" }), { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "275760-09-13" })).toHaveAttribute("tabindex", "0");
	});

	it("round-trips years before 100", () => {
		render(<DatePicker value="0099-01-01" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(screen.getByRole("button", { name: "0099-01-01" })).toBeInTheDocument();
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
