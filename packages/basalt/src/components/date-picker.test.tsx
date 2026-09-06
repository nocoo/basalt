import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
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

	it("clamps the open month down to max", async () => {
		render(<DatePicker defaultValue="2024-03-15" max="2024-02-20" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(await screen.findByText("February 2024")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "2024-02-21" })).toBeDisabled();
	});

	it("ignores malformed min and max strings", async () => {
		render(<DatePicker defaultValue="2024-01-15" min="nope" max="also-bad" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(await screen.findByRole("button", { name: "2024-01-15" })).toBeEnabled();
	});

	it("does not commit when read-only", async () => {
		const onChange = vi.fn();
		render(<DatePicker defaultValue="2024-01-15" readOnly onChange={onChange} aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		fireEvent.click(await screen.findByRole("button", { name: "2024-01-16" }));
		expect(onChange).not.toHaveBeenCalled();
	});

	it("keeps arrow keys on an in-range day", async () => {
		render(
			<DatePicker defaultValue="2024-01-10" min="2024-01-10" max="2024-01-20" aria-label="Date" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		const day = await screen.findByRole("button", { name: "2024-01-10" });
		day.focus();
		fireEvent.keyDown(day.parentElement as HTMLElement, { key: "ArrowLeft" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2024-01-10");
	});

	it("routes autoFocus to the trigger", () => {
		render(<DatePicker autoFocus aria-label="Date" />);
		expect(document.activeElement).toHaveAttribute("aria-label", "Date");
	});

	it("forwards focus handlers to the trigger", () => {
		const onFocus = vi.fn();
		const onBlur = vi.fn();
		render(<DatePicker onFocus={onFocus} onBlur={onBlur} aria-label="Date" />);
		const trigger = screen.getByRole("button", { name: "Date" });
		fireEvent.focus(trigger);
		fireEvent.blur(trigger);
		expect(onFocus).toHaveBeenCalled();
		expect(onBlur).toHaveBeenCalled();
	});

	it("allows the exact min and max day", async () => {
		render(
			<DatePicker defaultValue="2024-01-15" min="2024-01-15" max="2024-01-15" aria-label="Date" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(await screen.findByRole("button", { name: "2024-01-15" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "2024-01-14" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "2024-01-16" })).toBeDisabled();
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

	it("uses icon month controls and hoverable days", () => {
		render(<DatePicker defaultValue="2024-01-15" aria-label="Date" />);
		fireEvent.click(screen.getByRole("button", { name: /Date/ }));
		expect(screen.getByRole("button", { name: "Prev" })).not.toHaveTextContent("Prev");
		expect(screen.getByRole("button", { name: "Next" })).not.toHaveTextContent("Next");
		expect(screen.getByRole("button", { name: "2024-01-16" }).className).toContain(
			"hover:bg-basalt-accent",
		);
	});

	it("disables dates rejected by isDisabledDate", async () => {
		const onChange = vi.fn();
		render(
			<DatePicker
				defaultValue="2024-01-15"
				isDisabledDate={(iso) => iso === "2024-01-16"}
				onChange={onChange}
				aria-label="Date"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Date: Jan 15, 2024" }));
		expect(await screen.findByRole("button", { name: "2024-01-16" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "2024-01-16" }));
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "2024-01-17" }));
		expect(onChange).toHaveBeenCalledWith("2024-01-17");
	});

	it("applies a single-date preset", async () => {
		const onChange = vi.fn();
		render(
			<DatePicker
				presets={[{ label: "New year", value: "2026-01-01" }]}
				onChange={onChange}
				aria-label="Date"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Date" }));
		fireEvent.click(await screen.findByRole("button", { name: "New year" }));
		expect(onChange).toHaveBeenCalledWith("2026-01-01");
	});

	it("selects a range across two days", async () => {
		const onRangeChange = vi.fn();
		render(
			<DatePicker
				mode="range"
				defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
				onRangeChange={onRangeChange}
				aria-label="Stay"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Stay/ }));
		fireEvent.click(await screen.findByRole("button", { name: "2024-01-15" }));
		expect(onRangeChange).toHaveBeenCalledWith({ from: "2024-01-15" });
		fireEvent.click(screen.getByRole("button", { name: "2024-01-17" }));
		expect(onRangeChange).toHaveBeenCalledWith({ from: "2024-01-15", to: "2024-01-17" });
	});

	it("orders dates correctly when clicking a later date before an earlier date and closes picker", async () => {
		const onRangeChange = vi.fn();
		const { container } = render(
			<form>
				<DatePicker
					mode="range"
					name="stay"
					defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
					onRangeChange={onRangeChange}
					aria-label="Stay"
				/>
			</form>,
		);
		const form = container.querySelector("form") as HTMLFormElement;
		const input = container.querySelector('input[name="stay"]') as HTMLInputElement;

		fireEvent.click(screen.getByRole("button", { name: /Stay/ }));
		// First click sets from (starting fresh range because current was complete)
		fireEvent.click(await screen.findByRole("button", { name: "2024-01-20" }));
		expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2024-01-20" });

		// Second click earlier date (2024-01-14 < 2024-01-20) -> should order as { from: "2024-01-14", to: "2024-01-20" }
		fireEvent.click(screen.getByRole("button", { name: "2024-01-14" }));
		expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2024-01-14", to: "2024-01-20" });

		// Check form input and FormData
		expect(input.value).toBe("2024-01-14/2024-01-20");
		const data = new FormData(form);
		expect(data.get("stay")).toBe("2024-01-14/2024-01-20");

		// Dialog should be closed
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("focuses the range end when opened", async () => {
		render(
			<DatePicker
				mode="range"
				defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
				aria-label="Stay"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Stay/ }));
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2024-01-12");
		});
	});

	it("opens range mode on the default range month", async () => {
		render(
			<DatePicker
				mode="range"
				defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
				aria-label="Stay"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Stay/ }));
		expect(await screen.findByText("January 2024")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "2024-01-10" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("skips a disabled date when moving with arrow keys", async () => {
		render(
			<DatePicker
				defaultValue="2024-01-15"
				isDisabledDate={(iso) => iso === "2024-01-16"}
				aria-label="Date"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Date: Jan 15, 2024" }));
		const start = await screen.findByRole("button", { name: "2024-01-15" });
		start.focus();
		fireEvent.keyDown(start, { key: "ArrowRight" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2024-01-17");
	});

	it("rejects a range preset outside min and max", async () => {
		const onRangeChange = vi.fn();
		render(
			<DatePicker
				mode="range"
				min="2024-01-10"
				max="2024-01-20"
				presets={[{ label: "Weekend", value: { from: "2024-01-01", to: "2024-01-02" } }]}
				onRangeChange={onRangeChange}
				aria-label="Stay"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Stay" }));
		fireEvent.click(await screen.findByRole("button", { name: "Weekend" }));
		expect(onRangeChange).not.toHaveBeenCalled();
	});

	it("keeps an incomplete required range invalid", () => {
		const { container } = render(
			<form>
				<DatePicker mode="range" required name="stay" aria-label="Stay" />
			</form>,
		);
		const control = container.querySelector('input[name="stay"]') as HTMLInputElement;
		expect(control.value).toBe("");
		expect(control.checkValidity()).toBe(false);
	});

	it("applies a single-date preset in range mode", async () => {
		const onRangeChange = vi.fn();
		render(
			<DatePicker
				mode="range"
				presets={[{ label: "New year", value: "2026-01-01" }]}
				onRangeChange={onRangeChange}
				aria-label="Stay"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Stay" }));
		fireEvent.click(await screen.findByRole("button", { name: "New year" }));
		expect(onRangeChange).toHaveBeenCalledWith({ from: "2026-01-01", to: "2026-01-01" });
	});

	it("formats a completed range with formatDate", () => {
		render(
			<DatePicker
				mode="range"
				defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
				formatDate={(date) => `${date.getMonth() + 1}/${date.getDate()}`}
				aria-label="Stay"
			/>,
		);
		expect(screen.getByRole("button", { name: /Stay/ })).toHaveTextContent("1/10 – 1/12");
	});

	it("applies a range preset", async () => {
		const onRangeChange = vi.fn();
		render(
			<DatePicker
				mode="range"
				presets={[{ label: "Weekend", value: { from: "2024-01-13", to: "2024-01-14" } }]}
				onRangeChange={onRangeChange}
				aria-label="Stay"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Stay" }));
		fireEvent.click(await screen.findByRole("button", { name: "Weekend" }));
		expect(onRangeChange).toHaveBeenCalledWith({ from: "2024-01-13", to: "2024-01-14" });
	});

	it("keeps controlled rangeValue and form state unchanged when applying string preset without state update", async () => {
		const onRangeChange = vi.fn();
		const { container } = render(
			<form>
				<DatePicker
					mode="range"
					name="booking"
					rangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
					presets={[{ label: "Single Day", value: "2024-01-15" }]}
					onRangeChange={onRangeChange}
					aria-label="Booking"
				/>
			</form>,
		);
		const form = container.querySelector("form") as HTMLFormElement;
		const input = container.querySelector('input[name="booking"]') as HTMLInputElement;
		expect(input.value).toBe("2024-01-10/2024-01-12");

		fireEvent.click(screen.getByRole("button", { name: /Booking/ }));
		fireEvent.click(await screen.findByRole("button", { name: "Single Day" }));

		expect(onRangeChange).toHaveBeenCalledTimes(1);
		expect(onRangeChange).toHaveBeenCalledWith({ from: "2024-01-15", to: "2024-01-15" });
		expect(input.value).toBe("2024-01-10/2024-01-12");
		const data = new FormData(form);
		expect(data.get("booking")).toBe("2024-01-10/2024-01-12");
	});

	it("keeps controlled rangeValue and form state unchanged when applying object preset without state update", async () => {
		const onRangeChange = vi.fn();
		const { container } = render(
			<form>
				<DatePicker
					mode="range"
					name="booking"
					rangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
					presets={[{ label: "Next Week", value: { from: "2024-01-20", to: "2024-01-25" } }]}
					onRangeChange={onRangeChange}
					aria-label="Booking"
				/>
			</form>,
		);
		const form = container.querySelector("form") as HTMLFormElement;
		const input = container.querySelector('input[name="booking"]') as HTMLInputElement;
		expect(input.value).toBe("2024-01-10/2024-01-12");

		fireEvent.click(screen.getByRole("button", { name: /Booking/ }));
		fireEvent.click(await screen.findByRole("button", { name: "Next Week" }));

		expect(onRangeChange).toHaveBeenCalledTimes(1);
		expect(onRangeChange).toHaveBeenCalledWith({ from: "2024-01-20", to: "2024-01-25" });
		expect(input.value).toBe("2024-01-10/2024-01-12");
		const data = new FormData(form);
		expect(data.get("booking")).toBe("2024-01-10/2024-01-12");
	});

	it("rejects an unselectable string preset in range mode without triggering callback or value change", async () => {
		const onRangeChange = vi.fn();
		const { container } = render(
			<form>
				<DatePicker
					mode="range"
					name="booking"
					defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
					isDisabledDate={(iso) => iso === "2024-01-15"}
					presets={[{ label: "Holiday", value: "2024-01-15" }]}
					onRangeChange={onRangeChange}
					aria-label="Booking"
				/>
			</form>,
		);
		const input = container.querySelector('input[name="booking"]') as HTMLInputElement;
		fireEvent.click(screen.getByRole("button", { name: /Booking/ }));
		fireEvent.click(await screen.findByRole("button", { name: "Holiday" }));

		expect(onRangeChange).not.toHaveBeenCalled();
		expect(input.value).toBe("2024-01-10/2024-01-12");
	});

	it("rejects an object preset whose from is valid but to exceeds max", async () => {
		const onRangeChange = vi.fn();
		const { container } = render(
			<form>
				<DatePicker
					mode="range"
					name="booking"
					defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
					max="2024-01-20"
					presets={[{ label: "Cross Border", value: { from: "2024-01-15", to: "2024-01-25" } }]}
					onRangeChange={onRangeChange}
					aria-label="Booking"
				/>
			</form>,
		);
		const input = container.querySelector('input[name="booking"]') as HTMLInputElement;
		fireEvent.click(screen.getByRole("button", { name: /Booking/ }));
		fireEvent.click(await screen.findByRole("button", { name: "Cross Border" }));

		expect(onRangeChange).not.toHaveBeenCalled();
		expect(input.value).toBe("2024-01-10/2024-01-12");
	});

	it("forwards and cleans up external refs (object, callback, React 19 cleanup)", () => {
		// 1. Plain callback ref without cleanup
		const callbackEvents: string[] = [];
		const plainCallback = (el: HTMLInputElement | null) => {
			callbackEvents.push(`call:${el ? el.tagName : "null"}`);
		};
		const { rerender: rerenderPlain, unmount: unmountPlain } = render(
			<DatePicker ref={plainCallback} aria-label="Plain Callback Date" />,
		);
		expect(callbackEvents).toEqual(["call:INPUT"]);
		// Swap callback ref
		const secondEvents: string[] = [];
		const secondCallback = (el: HTMLInputElement | null) => {
			secondEvents.push(`call2:${el ? el.tagName : "null"}`);
		};
		rerenderPlain(<DatePicker ref={secondCallback} aria-label="Plain Callback Date" />);
		expect(callbackEvents).toEqual(["call:INPUT", "call:null"]);
		expect(secondEvents).toEqual(["call2:INPUT"]);
		unmountPlain();
		expect(secondEvents).toEqual(["call2:INPUT", "call2:null"]);

		// 2. React 19 callback with cleanup function
		let cleanupCalled = false;
		let attachedElement: HTMLInputElement | null = null;
		const callbackRef = (el: HTMLInputElement | null) => {
			attachedElement = el;
			return () => {
				cleanupCalled = true;
			};
		};
		const { unmount } = render(<DatePicker ref={callbackRef} aria-label="Cleanup Date" />);
		expect(attachedElement).not.toBeNull();
		expect((attachedElement as unknown as HTMLElement).tagName).toBe("INPUT");
		unmount();
		expect(cleanupCalled).toBe(true);

		// 3. Object ref clearing on unmount and swapping
		const objRef1 = React.createRef<HTMLInputElement>();
		const objRef2 = React.createRef<HTMLInputElement>();
		const { rerender: rerenderObj, unmount: unmountObj } = render(
			<DatePicker ref={objRef1} aria-label="Object Date" />,
		);
		expect(objRef1.current?.tagName).toBe("INPUT");
		const originalInput = objRef1.current;
		rerenderObj(<DatePicker ref={objRef2} aria-label="Object Date" />);
		expect(objRef1.current).toBeNull();
		expect(objRef2.current).toBe(originalInput);
		unmountObj();
		expect(objRef2.current).toBeNull();
	});

	it("focuses visible trigger and marks aria-invalid when empty required form submits invalid", () => {
		const onInvalid = vi.fn();
		const { rerender } = render(
			<form onSubmit={(e) => e.preventDefault()}>
				<DatePicker name="when" required aria-label="Required Date" onInvalid={onInvalid} />
				<button type="submit">Submit</button>
			</form>,
		);

		const trigger = screen.getByRole("button", { name: /Required Date/ });
		const hiddenInput = document.querySelector('input[name="when"]') as HTMLInputElement;
		expect(hiddenInput).toHaveAttribute("required");

		// Fire invalid event on input
		fireEvent.invalid(hiddenInput);
		expect(onInvalid).toHaveBeenCalled();
		expect(trigger).toHaveAttribute("aria-invalid", "true");
		expect(document.activeElement).toBe(trigger);

		// Error message is rendered and accessible via aria-describedby without caller-supplied id
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent(/Constraints not satisfied|Please fill out this field/);
		expect(trigger.getAttribute("aria-describedby")).toContain(alert.id);

		// Controlled value updated to valid ISO date clears the invalid state and error message
		rerender(
			<form onSubmit={(e) => e.preventDefault()}>
				<DatePicker
					value="2026-09-01"
					name="when"
					required
					aria-label="Required Date"
					onInvalid={onInvalid}
				/>
				<button type="submit">Submit</button>
			</form>,
		);
		expect(trigger).not.toHaveAttribute("aria-invalid");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("respects onInvalid preventDefault and does not steal focus", () => {
		const otherButton = document.createElement("button");
		document.body.appendChild(otherButton);
		otherButton.focus();

		render(
			<form onSubmit={(e) => e.preventDefault()}>
				<DatePicker
					name="when"
					required
					aria-label="Required Date"
					onInvalid={(e) => {
						expect(e.target).toBeInstanceOf(HTMLInputElement);
						e.preventDefault();
					}}
				/>
			</form>,
		);

		const hiddenInput = document.querySelector('input[name="when"]') as HTMLInputElement;
		fireEvent.invalid(hiddenInput);
		expect(document.activeElement).toBe(otherButton);
		otherButton.remove();
	});

	it("supports booleanish aria-invalid variants and reflects destructive styling and description", () => {
		const { rerender } = render(
			<DatePicker aria-label="Valid Date" aria-invalid={false} aria-describedby="desc" />,
		);
		let trigger = screen.getByRole("button", { name: "Valid Date" });
		expect(trigger).not.toHaveClass("border-basalt-destructive");
		expect(trigger).toHaveAttribute("aria-describedby", "desc");
		expect(trigger).toHaveAttribute("aria-invalid", "false");

		rerender(<DatePicker aria-label="Valid Date String" aria-invalid="false" />);
		trigger = screen.getByRole("button", { name: "Valid Date String" });
		expect(trigger).not.toHaveClass("border-basalt-destructive");
		expect(trigger).toHaveAttribute("aria-invalid", "false");

		rerender(<DatePicker aria-label="Invalid Date Bool" aria-invalid={true} />);
		trigger = screen.getByRole("button", { name: "Invalid Date Bool" });
		expect(trigger).toHaveClass("border-basalt-destructive");
		expect(trigger).toHaveAttribute("aria-invalid", "true");

		rerender(<DatePicker aria-label="Invalid Date Str" aria-invalid="true" />);
		trigger = screen.getByRole("button", { name: "Invalid Date Str" });
		expect(trigger).toHaveClass("border-basalt-destructive");
		expect(trigger).toHaveAttribute("aria-invalid", "true");

		rerender(<DatePicker aria-label="Grammar Date" aria-invalid="grammar" />);
		trigger = screen.getByRole("button", { name: "Grammar Date" });
		expect(trigger).toHaveClass("border-basalt-destructive");
		expect(trigger).toHaveAttribute("aria-invalid", "grammar");

		rerender(<DatePicker aria-label="Spelling Date" aria-invalid="spelling" />);
		trigger = screen.getByRole("button", { name: "Spelling Date" });
		expect(trigger).toHaveClass("border-basalt-destructive");
		expect(trigger).toHaveAttribute("aria-invalid", "spelling");
	});

	it("preserves controlled value and form data on normal and cancelled reset without extra onChange notifications", async () => {
		const onSingleChange = vi.fn();
		const onRangeChange = vi.fn();

		function ControlledResetFixture({
			cancel,
			initialSingle = "2026-09-01",
			initialRange = { from: "2026-09-01", to: "2026-09-03" },
		}: {
			cancel?: boolean;
			initialSingle?: string;
			initialRange?: { from: string; to?: string };
		}) {
			const [single, setSingle] = React.useState(initialSingle);
			const [range, setRange] = React.useState(initialRange);
			return (
				<form
					id="controlled-form"
					onReset={(e) => {
						if (cancel) {
							e.preventDefault();
						}
					}}
				>
					<DatePicker
						value={single}
						onChange={(next) => {
							onSingleChange(next);
							setSingle(next);
						}}
						name="single_date"
						aria-label="Controlled Single"
					/>
					<DatePicker
						mode="range"
						rangeValue={range}
						onRangeChange={(next) => {
							onRangeChange(next);
							setRange(next);
						}}
						name="range_date"
						aria-label="Controlled Range"
					/>
					<button type="reset">Reset Form</button>
				</form>
			);
		}

		// Update controlled values through actual user selection
		const { rerender } = render(<ControlledResetFixture />);
		const singleTrigger = screen.getByRole("button", { name: /Controlled Single/ });
		const rangeTrigger = screen.getByRole("button", { name: /Controlled Range/ });
		const singleInput = document.querySelector('input[name="single_date"]') as HTMLInputElement;
		const rangeInput = document.querySelector('input[name="range_date"]') as HTMLInputElement;

		// Select day 2026-09-10 in single picker
		fireEvent.click(singleTrigger);
		fireEvent.click(screen.getByRole("button", { name: "2026-09-10" }));
		expect(onSingleChange).toHaveBeenCalledWith("2026-09-10");
		expect(singleInput.value).toBe("2026-09-10");

		// Select range 2026-09-10 to 2026-09-15 in range picker
		fireEvent.click(rangeTrigger);
		fireEvent.click(screen.getByRole("button", { name: "2026-09-10" }));
		fireEvent.click(screen.getByRole("button", { name: "2026-09-15" }));
		expect(onRangeChange).toHaveBeenCalledWith({ from: "2026-09-10", to: "2026-09-15" });
		expect(rangeInput.value).toBe("2026-09-10/2026-09-15");

		const singleCallsBefore = onSingleChange.mock.calls.length;
		const rangeCallsBefore = onRangeChange.mock.calls.length;

		// Normal reset: form reset fires, parent state and input values remain, no extra onChange
		fireEvent.click(screen.getByRole("button", { name: "Reset Form" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(singleInput.value).toBe("2026-09-10");
		expect(rangeInput.value).toBe("2026-09-10/2026-09-15");
		const normalFormData = new FormData(
			document.getElementById("controlled-form") as HTMLFormElement,
		);
		expect(normalFormData.get("single_date")).toBe("2026-09-10");
		expect(normalFormData.get("range_date")).toBe("2026-09-10/2026-09-15");
		expect(onSingleChange.mock.calls.length).toBe(singleCallsBefore);
		expect(onRangeChange.mock.calls.length).toBe(rangeCallsBefore);

		// Cancelled reset: form reset cancelled via preventDefault, values remain, no extra onChange
		rerender(
			<ControlledResetFixture
				cancel
				initialSingle="2026-09-10"
				initialRange={{ from: "2026-09-10", to: "2026-09-15" }}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Reset Form" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(singleInput.value).toBe("2026-09-10");
		expect(rangeInput.value).toBe("2026-09-10/2026-09-15");
		const cancelledFormData = new FormData(
			document.getElementById("controlled-form") as HTMLFormElement,
		);
		expect(cancelledFormData.get("single_date")).toBe("2026-09-10");
		expect(cancelledFormData.get("range_date")).toBe("2026-09-10/2026-09-15");
		expect(onSingleChange.mock.calls.length).toBe(singleCallsBefore);
		expect(onRangeChange.mock.calls.length).toBe(rangeCallsBefore);
	});

	it("switches form owner via form attribute and resets only when matching form resets", async () => {
		function FormOwnerFixture({ formId }: { formId: string }) {
			return (
				<div>
					<form id="form-a">
						<button type="reset" id="reset-a">
							Reset A
						</button>
					</form>
					<form id="form-b">
						<button type="reset" id="reset-b">
							Reset B
						</button>
					</form>
					<DatePicker
						form={formId}
						defaultValue="2026-09-01"
						name="date"
						aria-label="Form Owner Date"
					/>
				</div>
			);
		}

		const { rerender } = render(<FormOwnerFixture formId="form-a" />);
		const trigger = screen.getByRole("button", { name: /Form Owner Date/ });
		const hiddenInput = document.querySelector('input[name="date"]') as HTMLInputElement;

		// Select a different date
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("button", { name: "2026-09-05" }));
		expect(hiddenInput.value).toBe("2026-09-05");

		// Reset form B while bound to form A: does not reset
		fireEvent.click(screen.getByRole("button", { name: "Reset B" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(hiddenInput.value).toBe("2026-09-05");

		// Reset form A: restores default
		fireEvent.click(screen.getByRole("button", { name: "Reset A" }));
		await waitFor(() => {
			expect(hiddenInput.value).toBe("2026-09-01");
		});

		// Switch form owner to form B
		rerender(<FormOwnerFixture formId="form-b" />);
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("button", { name: "2026-09-08" }));
		expect(hiddenInput.value).toBe("2026-09-08");

		// Reset form A while bound to form B: does not reset
		fireEvent.click(screen.getByRole("button", { name: "Reset A" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(hiddenInput.value).toBe("2026-09-08");

		// Reset form B: restores default
		fireEvent.click(screen.getByRole("button", { name: "Reset B" }));
		await waitFor(() => {
			expect(hiddenInput.value).toBe("2026-09-01");
		});
	});

	it("cancels pending reset timer when form owner changes immediately after reset event", async () => {
		function FormOwnerSwitchFixture({ formId }: { formId: string }) {
			return (
				<div>
					<form id="form-a">
						<button type="reset" id="reset-a">
							Reset A
						</button>
					</form>
					<form id="form-b">
						<button type="reset" id="reset-b">
							Reset B
						</button>
					</form>
					<DatePicker
						form={formId}
						defaultValue="2026-09-01"
						name="date"
						aria-label="Pending Switch Date"
					/>
				</div>
			);
		}

		const { rerender } = render(<FormOwnerSwitchFixture formId="form-a" />);
		const trigger = screen.getByRole("button", { name: /Pending Switch Date/ });
		const hiddenInput = document.querySelector('input[name="date"]') as HTMLInputElement;

		// Select 2026-09-05
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("button", { name: "2026-09-05" }));
		expect(hiddenInput.value).toBe("2026-09-05");

		// Fire reset on Form A, but immediately switch form owner to form-b in the same tick
		fireEvent.click(screen.getByRole("button", { name: "Reset A" }));
		rerender(<FormOwnerSwitchFixture formId="form-b" />);

		// Wait for the setTimeout(0) timer from Reset A to have fired
		await new Promise((r) => setTimeout(r, 20));

		// Because form owner changed before timer execution, disposed cancelled timer on old owner A
		expect(hiddenInput.value).toBe("2026-09-05");

		// Now resetting form-b resets the datepicker
		fireEvent.click(screen.getByRole("button", { name: "Reset B" }));
		await waitFor(() => {
			expect(hiddenInput.value).toBe("2026-09-01");
		});
	});

	it("restores range value or keeps changed range on cancelled reset with parent state update", async () => {
		function RangeResetFixture({ cancel }: { cancel?: boolean }) {
			const [parentCount, setParentCount] = React.useState(0);
			return (
				<form
					onReset={(e) => {
						setParentCount((c) => c + 1);
						if (cancel) {
							e.preventDefault();
						}
					}}
				>
					<DatePicker
						mode="range"
						name="stay"
						aria-label="Stay Date"
						defaultRangeValue={{ from: "2026-09-01", to: "2026-09-03" }}
					/>
					<button type="reset">Reset</button>
					<span data-testid="parent-count">{parentCount}</span>
				</form>
			);
		}

		// Normal reset
		const { unmount } = render(<RangeResetFixture />);
		const trigger = screen.getByRole("button", { name: /Stay Date/ });
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("button", { name: "2026-09-02" }));
		fireEvent.click(screen.getByRole("button", { name: "2026-09-04" }));
		expect(document.querySelector('input[name="stay"]')).toHaveValue("2026-09-02/2026-09-04");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(screen.getByTestId("parent-count")).toHaveTextContent("1");
			expect(document.querySelector('input[name="stay"]')).toHaveValue("2026-09-01/2026-09-03");
		});
		unmount();

		// Cancelled reset
		render(<RangeResetFixture cancel />);
		const cancelTrigger = screen.getByRole("button", { name: /Stay Date/ });
		fireEvent.click(cancelTrigger);
		fireEvent.click(screen.getByRole("button", { name: "2026-09-02" }));
		fireEvent.click(screen.getByRole("button", { name: "2026-09-04" }));
		expect(document.querySelector('input[name="stay"]')).toHaveValue("2026-09-02/2026-09-04");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(screen.getByTestId("parent-count")).toHaveTextContent("1");
		expect(document.querySelector('input[name="stay"]')).toHaveValue("2026-09-02/2026-09-04");
	});

	it("renders semantic table grid with row, columnheader, and gridcell roles", () => {
		render(<DatePicker defaultValue="2026-09-09" weekStartsOn={1} aria-label="Appointment" />);
		const trigger = screen.getByRole("button", { name: /Appointment/ });
		fireEvent.click(trigger);

		const grid = screen.getByRole("grid");
		expect(grid).toBeInTheDocument();
		const rows = screen.getAllByRole("row");
		expect(rows.length).toBeGreaterThanOrEqual(6);
		const headers = screen.getAllByRole("columnheader");
		expect(headers).toHaveLength(7);
		const cells = screen.getAllByRole("gridcell");
		expect(cells.length).toBeGreaterThanOrEqual(28);

		const rovingTabButtons = grid.querySelectorAll('button[tabindex="0"]');
		expect(rovingTabButtons).toHaveLength(1);
		expect(rovingTabButtons[0]).toHaveAttribute("data-date", "2026-09-09");
	});

	it("supports Home and End keyboard navigation following weekStartsOn", () => {
		render(<DatePicker defaultValue="2026-09-09" weekStartsOn={1} aria-label="Appointment" />);
		const trigger = screen.getByRole("button", { name: /Appointment/ });
		fireEvent.click(trigger);

		const active = screen.getByRole("button", { name: "2026-09-09" });
		fireEvent.keyDown(active, { key: "Home" });
		expect(screen.getByRole("button", { name: "2026-09-07" })).toHaveAttribute("tabindex", "0");

		fireEvent.keyDown(screen.getByRole("button", { name: "2026-09-07" }), { key: "End" });
		expect(screen.getByRole("button", { name: "2026-09-13" })).toHaveAttribute("tabindex", "0");
	});

	it("supports PageUp and PageDown month clamping and Shift year jump", () => {
		render(<DatePicker defaultValue="2024-01-31" aria-label="Clamped" />);
		const trigger = screen.getByRole("button", { name: /Clamped/ });
		fireEvent.click(trigger);

		// 2024-01-31 + PageDown -> 2024-02-29
		const btnJan = screen.getByRole("button", { name: "2024-01-31" });
		fireEvent.keyDown(btnJan, { key: "PageDown" });
		expect(screen.getByRole("button", { name: "2024-02-29" })).toHaveAttribute("tabindex", "0");

		// 2026-09-09 + Shift+PageDown -> 2027-09-09
		const { unmount } = render(<DatePicker defaultValue="2026-09-09" aria-label="YearJump" />);
		const trigger2 = screen.getByRole("button", { name: /YearJump/ });
		fireEvent.click(trigger2);
		const btnSep = screen.getByRole("button", { name: "2026-09-09" });
		fireEvent.keyDown(btnSep, { key: "PageDown", shiftKey: true });
		expect(screen.getByRole("button", { name: "2027-09-09" })).toHaveAttribute("tabindex", "0");
		unmount();
	});

	it("respects custom labels for calendar, prev/next buttons, and placeholder", () => {
		render(
			<DatePicker
				labels={{
					calendar: "Custom calendar title",
					previousMonth: "Mois précédent",
					nextMonth: "Mois suivant",
					placeholder: "Sélectionnez une date",
				}}
			/>,
		);
		const trigger = screen.getByRole("button");
		expect(trigger).toHaveTextContent("Sélectionnez une date");
		fireEvent.click(trigger);

		expect(screen.getByRole("dialog", { name: "Custom calendar title" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Mois précédent" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Mois suivant" })).toBeInTheDocument();
	});

	it("handles partial and complete range selection states correctly", () => {
		// 1. Partial range: only from is set
		const { rerender } = render(
			<DatePicker
				mode="range"
				rangeValue={{ from: "2026-09-10", to: undefined }}
				aria-label="PartialStay"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /PartialStay/ }));

		const cell10 = screen.getByRole("button", { name: "2026-09-10" }).closest("td");
		const button10 = screen.getByRole("button", { name: "2026-09-10" });
		expect(cell10).toHaveAttribute("aria-selected", "true");
		expect(button10).toHaveAttribute("aria-pressed", "true");
		expect(button10.className).toContain("bg-basalt-primary");

		const cell11 = screen.getByRole("button", { name: "2026-09-11" }).closest("td");
		const button11 = screen.getByRole("button", { name: "2026-09-11" });
		expect(cell11).not.toHaveAttribute("aria-selected");
		expect(button11).toHaveAttribute("aria-pressed", "false");
		expect(button11.className.split(/\s+/)).not.toContain("bg-basalt-primary");
		expect(button11.className.split(/\s+/)).not.toContain("bg-basalt-accent");

		// 2. Complete range: start, middle, end
		rerender(
			<DatePicker
				mode="range"
				rangeValue={{ from: "2026-09-10", to: "2026-09-12" }}
				aria-label="PartialStay"
			/>,
		);

		const cell10Complete = screen.getByRole("button", { name: "2026-09-10" }).closest("td");
		const btn10 = screen.getByRole("button", { name: "2026-09-10" });
		expect(cell10Complete).toHaveAttribute("aria-selected", "true");
		expect(btn10).toHaveAttribute("aria-pressed", "true");
		expect(btn10.className.split(/\s+/)).toContain("bg-basalt-primary");

		const cell11Complete = screen.getByRole("button", { name: "2026-09-11" }).closest("td");
		const btn11 = screen.getByRole("button", { name: "2026-09-11" });
		expect(cell11Complete).toHaveAttribute("aria-selected", "true");
		expect(btn11).toHaveAttribute("aria-pressed", "false");
		expect(btn11.className.split(/\s+/)).toContain("bg-basalt-accent");
		expect(btn11.className.split(/\s+/)).not.toContain("bg-basalt-primary");

		const cell12Complete = screen.getByRole("button", { name: "2026-09-12" }).closest("td");
		const btn12 = screen.getByRole("button", { name: "2026-09-12" });
		expect(cell12Complete).toHaveAttribute("aria-selected", "true");
		expect(btn12).toHaveAttribute("aria-pressed", "true");
		expect(btn12.className.split(/\s+/)).toContain("bg-basalt-primary");
	});

	it("supports controlled month navigation, rejection, rerender, and deferred acceptance", async () => {
		const onMonthChange = vi.fn();
		const { rerender } = render(
			<DatePicker
				value="2026-09-15"
				month="2026-09"
				onMonthChange={onMonthChange}
				aria-label="ControlledMonth"
			/>,
		);
		const trigger = screen.getByRole("button", { name: /ControlledMonth/ });
		fireEvent.click(trigger);
		expect(screen.getByText("September 2026")).toBeInTheDocument();

		// 1. Click Next Month -> triggers onMonthChange("2026-10"), but parent rejects (rerenders same month)
		const nextBtn = screen.getByRole("button", { name: "Next" });
		fireEvent.click(nextBtn);
		expect(onMonthChange).toHaveBeenCalledWith("2026-10");
		// Still September because parent didn't update prop
		expect(screen.getByText("September 2026")).toBeInTheDocument();

		// 2. Keyboard nav across month boundary with parent rejection
		const sep15 = screen.getByRole("button", { name: "2026-09-15" });
		onMonthChange.mockClear();
		fireEvent.keyDown(sep15, { key: "PageDown" });
		expect(onMonthChange).toHaveBeenCalledWith("2026-10");
		// Parent rerenders with same month
		rerender(
			<DatePicker
				value="2026-09-15"
				month="2026-09"
				onMonthChange={onMonthChange}
				aria-label="ControlledMonth"
			/>,
		);
		// Still in September, focus not lost or jumped to day 1
		expect(screen.getByText("September 2026")).toBeInTheDocument();

		// 3. Deferred acceptance: parent now accepts "2026-10", pending focus targets 2026-10-15
		rerender(
			<DatePicker
				value="2026-09-15"
				month="2026-10"
				onMonthChange={onMonthChange}
				aria-label="ControlledMonth"
			/>,
		);
		expect(screen.getByText("October 2026")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-10-15");
		});

		// 4. External month change does not invoke onMonthChange and does not change selected value
		onMonthChange.mockClear();
		rerender(
			<DatePicker
				value="2026-09-15"
				month="2026-12"
				onMonthChange={onMonthChange}
				aria-label="ControlledMonth"
			/>,
		);
		expect(screen.getByText("December 2026")).toBeInTheDocument();
		expect(onMonthChange).not.toHaveBeenCalled();
		expect(trigger).toHaveTextContent("Sep 15, 2026");
	});

	it("respects defaultMonth for initial view and allows uncontrolled navigation", () => {
		const onMonthChange = vi.fn();
		const { rerender } = render(
			<DatePicker defaultMonth="2026-11" onMonthChange={onMonthChange} aria-label="DefaultMonth" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /DefaultMonth/ }));
		expect(screen.getByText("November 2026")).toBeInTheDocument();

		// ArrowRight from day 1 to day 2
		const nov1 = screen.getByRole("button", { name: "2026-11-01" });
		fireEvent.keyDown(nov1, { key: "ArrowRight" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-11-02");

		// Parent rerenders changing defaultMonth prop (which should only act as initial default)
		rerender(
			<DatePicker defaultMonth="2027-05" onMonthChange={onMonthChange} aria-label="DefaultMonth" />,
		);

		// ArrowRight from day 2 should advance to day 3 in November 2026, NOT jump back to day 1
		const nov2 = screen.getByRole("button", { name: "2026-11-02" });
		fireEvent.keyDown(nov2, { key: "ArrowRight" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-11-03");

		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(screen.getByText("December 2026")).toBeInTheDocument();
		expect(onMonthChange).toHaveBeenCalledWith("2026-12");
	});

	it("preserves keyboard roving focus sequence after accepting PageDown with empty value", async () => {
		let currentMonth = "2026-11";
		const onMonthChange = vi.fn((next: string) => {
			currentMonth = next;
		});
		const { rerender } = render(
			<DatePicker
				month={currentMonth}
				onMonthChange={onMonthChange}
				aria-label="EmptyControlled"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /EmptyControlled/ }));
		expect(screen.getByText("November 2026")).toBeInTheDocument();

		// Wait for initial autofocus onto the active grid cell
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("data-date");
		});
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-11-01");

		// Roving step to 2026-11-02
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowRight" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-11-02");

		// PageDown to December 2026
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown" });
		expect(onMonthChange).toHaveBeenCalledWith("2026-12");

		rerender(
			<DatePicker
				month={currentMonth}
				onMonthChange={onMonthChange}
				aria-label="EmptyControlled"
			/>,
		);
		expect(screen.getByText("December 2026")).toBeInTheDocument();

		// Deferred focus lands on same day in target month: 2026-12-02
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-12-02");
		});

		// Subsequent ArrowRight advances to 2026-12-03
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowRight" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-12-03");
	});

	it("falls back gracefully on invalid month strings and handles extended years across boundaries", () => {
		const onMonthChange = vi.fn();
		const { rerender } = render(
			<DatePicker
				defaultValue="2026-09-15"
				month="invalid-month"
				onMonthChange={onMonthChange}
				aria-label="ExtendedYear"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /ExtendedYear/ }));
		// Falls back to defaultValue month (September 2026)
		expect(screen.getByText("September 2026")).toBeInTheDocument();

		// Extended year: 9999-12 to 10000-01
		rerender(
			<DatePicker
				defaultValue="9999-12-31"
				month="9999-12"
				onMonthChange={onMonthChange}
				aria-label="ExtendedYear"
			/>,
		);
		expect(screen.getByText("December 9999")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(onMonthChange).toHaveBeenCalledWith("10000-01");
	});

	it("supports custom validationMessage and keyboardInstructions in labels", () => {
		render(
			<form>
				<DatePicker
					required
					labels={{
						validationMessage: "必须填写预约日期",
						keyboardInstructions: "使用方向键切换日期，回车确认选择",
					}}
					aria-label="CustomLabels"
				/>
				<button type="submit">Submit</button>
			</form>,
		);

		// Keyboard instructions sr-only container & aria-describedby
		fireEvent.click(screen.getByRole("button", { name: /CustomLabels/ }));
		const dialog = screen.getByRole("dialog");
		const instructions = screen.getByText("使用方向键切换日期，回车确认选择");
		expect(instructions).toHaveClass("sr-only");
		expect(dialog).toHaveAttribute("aria-describedby", instructions.id);

		// Custom validation message on invalid form submission
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		expect(screen.getByRole("alert")).toHaveTextContent("必须填写预约日期");
	});

	it("supports Home/End with weekStartsOn=1 (Monday) and moves to first/last selectable day when edges are disabled", async () => {
		const onChange = vi.fn();
		render(
			<form id="test-form">
				<DatePicker
					name="schedule"
					defaultValue="2026-09-09"
					weekStartsOn={1}
					min="2026-09-08"
					max="2026-09-10"
					onChange={onChange}
					aria-label="BoundaryWeek"
				/>
			</form>,
		);
		fireEvent.click(screen.getByRole("button", { name: /BoundaryWeek/ }));

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-09");
		});

		// Press Home: start of week (Monday Sep 7) is < min (Sep 8), so steps forward to Sep 8
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Home" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-08");
		expect(onChange).not.toHaveBeenCalled();

		// Press End: end of week (Sunday Sep 13) is > max (Sep 10), so steps backward to Sep 10
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "End" });
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-10");
		expect(onChange).not.toHaveBeenCalled();

		// Form value remains defaultValue until selected
		const input = document.querySelector('input[name="schedule"]') as HTMLInputElement;
		expect(input.value).toBe("2026-09-09");
	});

	it("navigates Home/End across months with Sunday weekStartsOn=0 and supports month rejection/acceptance", async () => {
		const onMonthChange = vi.fn();
		let controlledMonth = "2026-09";
		const { rerender } = render(
			<DatePicker
				defaultValue="2026-09-01"
				month={controlledMonth}
				weekStartsOn={0}
				onMonthChange={onMonthChange}
				aria-label="CrossMonthHomeEnd"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /CrossMonthHomeEnd/ }));

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-01");
		});

		// 2026-09-01 is Tuesday. With weekStartsOn=0, start of week is Sunday 2026-08-30.
		// Press Home -> requests previous month (2026-08)
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Home" });
		expect(onMonthChange).toHaveBeenCalledWith("2026-08");

		// Parent rejects: month prop stays 2026-09. Target remains pending.
		rerender(
			<DatePicker
				defaultValue="2026-09-01"
				month="2026-09"
				weekStartsOn={0}
				onMonthChange={onMonthChange}
				aria-label="CrossMonthHomeEnd"
			/>,
		);
		expect(screen.getByText("September 2026")).toBeInTheDocument();

		// Parent later accepts: month prop updates to 2026-08
		controlledMonth = "2026-08";
		rerender(
			<DatePicker
				defaultValue="2026-09-01"
				month={controlledMonth}
				weekStartsOn={0}
				onMonthChange={onMonthChange}
				aria-label="CrossMonthHomeEnd"
			/>,
		);
		expect(screen.getByText("August 2026")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-08-30");
		});

		// In August, focus 2026-08-30 (Sunday). End of week with weekStartsOn=0 is Saturday 2026-09-05.
		// Press End -> requests 2026-09
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "End" });
		expect(onMonthChange).toHaveBeenCalledWith("2026-09");
		rerender(
			<DatePicker
				defaultValue="2026-09-01"
				month="2026-09"
				weekStartsOn={0}
				onMonthChange={onMonthChange}
				aria-label="CrossMonthHomeEnd"
			/>,
		);
		expect(screen.getByText("September 2026")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-05");
		});
	});

	it("handles PageUp leap year clamping and Shift+PageUp negative year jumps without committing until Enter", async () => {
		const onChange = vi.fn();
		const { container } = render(
			<DatePicker defaultValue="2024-03-31" onChange={onChange} aria-label="LeapPageUp" />,
		);
		fireEvent.click(screen.getByRole("button", { name: /LeapPageUp/ }));

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2024-03-31");
		});

		// PageUp from 2024-03-31 (leap year) -> clamps to 2024-02-29
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageUp" });
		expect(screen.getByText("February 2024")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2024-02-29");
		});
		expect(onChange).not.toHaveBeenCalled();

		// Shift+PageUp from 2024-02-29 -> jumps 1 year back to non-leap 2023-02-28
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageUp", shiftKey: true });
		expect(screen.getByText("February 2023")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2023-02-28");
		});
		expect(onChange).not.toHaveBeenCalled();

		// Enter commits selection
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Enter" });
		expect(onChange).toHaveBeenCalledWith("2023-02-28");
		expect(container.querySelector('input[type="date"]')).toHaveValue("2023-02-28");
	});

	it("handles PageDown stepping when target day is unselectable and falls back backward when constrained by max", async () => {
		const onChange = vi.fn();
		const { unmount: unmountUnselectable } = render(
			<DatePicker
				defaultValue="2026-08-15"
				max="2026-09-20"
				isDisabledDate={(d) => d === "2026-09-15" || d === "2026-09-16"}
				onChange={onChange}
				aria-label="PageDownUnselectable"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /PageDownUnselectable/ }));

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-08-15");
		});

		// PageDown target 2026-09-15 is disabled, steps forward past disabled 2026-09-16 to 2026-09-17
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown" });
		expect(screen.getByText("September 2026")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-17");
		});
		unmountUnselectable();

		// Another setup: target day + all future days in month disabled/above max -> searches forward, fails, then searches backward
		const { unmount: unmountMax } = render(
			<DatePicker
				defaultValue="2026-08-25"
				max="2026-09-20"
				onChange={onChange}
				aria-label="PageDownMaxBackward"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /PageDownMaxBackward/ }));
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-08-25");
		});

		// Target 2026-09-25 exceeds max 2026-09-20. Forward search hits limit; backward search finds 2026-09-20.
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown" });
		expect(screen.getByText("September 2026")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-20");
		});
		unmountMax();

		// If target has no selectable dates forward or backward (all dates disabled in target), stays on current
		const { unmount: unmountAllDisabled } = render(
			<DatePicker
				defaultValue="2026-08-10"
				isDisabledDate={(d) => d.startsWith("2027-")}
				onChange={onChange}
				aria-label="PageDownAllDisabled"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /PageDownAllDisabled/ }));
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-08-10");
		});

		// Shift+PageDown -> target 2027-08-10. All 2027 dates disabled, so does not change month or lose focus
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown", shiftKey: true });
		expect(screen.getByText("August 2026")).toBeInTheDocument();
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-08-10");
		expect(onChange).not.toHaveBeenCalled();
		unmountAllDisabled();
	});

	it("rejects PageUp/Shift+PageUp when reaching year 1 boundary without error, allowing Escape without onChange", async () => {
		const onChange = vi.fn();
		render(
			<DatePicker defaultValue="0001-01-15" onChange={onChange} aria-label="YearOneBoundary" />,
		);
		const trigger = screen.getByRole("button", { name: /YearOneBoundary/ });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "0001-01-15");
		});

		// PageUp at year 1 Jan cannot go negative -> ignored
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageUp" });
		expect(screen.getByText(/January (000)?1/)).toBeInTheDocument();
		expect(document.activeElement).toHaveAttribute("aria-label", "0001-01-15");

		// Shift+PageUp at year 1 Jan -> ignored
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageUp", shiftKey: true });
		expect(screen.getByText(/January (000)?1/)).toBeInTheDocument();
		expect(document.activeElement).toHaveAttribute("aria-label", "0001-01-15");

		// Escape closes popover with no onChange and returns focus to trigger
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
			expect(trigger).toHaveFocus();
		});
		expect(onChange).not.toHaveBeenCalled();
	});

	it("preserves target focus when controlled month is rejected and weekStartsOn changes, then lands on target day upon acceptance", async () => {
		const onMonthChange = vi.fn();
		const onChange = vi.fn();
		const { rerender } = render(
			<DatePicker
				defaultValue="2026-09-10"
				month="2026-09"
				weekStartsOn={1}
				onMonthChange={onMonthChange}
				onChange={onChange}
				aria-label="PendingWeekStartsOn"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /PendingWeekStartsOn/ }));

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-10");
		});

		// Request Next month via PageDown navigating out of month
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown" });
		expect(onMonthChange).toHaveBeenCalledWith("2026-10");

		// Parent rejects month: month remains 2026-09, but weekStartsOn prop changes
		rerender(
			<DatePicker
				defaultValue="2026-09-10"
				month="2026-09"
				weekStartsOn={0}
				onMonthChange={onMonthChange}
				onChange={onChange}
				aria-label="PendingWeekStartsOn"
			/>,
		);
		expect(screen.getByText("September 2026")).toBeInTheDocument();
		// Focus remains on 2026-09-10 in current month and onChange was not called
		expect(document.activeElement).toHaveAttribute("aria-label", "2026-09-10");
		expect(onChange).not.toHaveBeenCalled();

		// Parent accepts delayed month: lands on target day 2026-10-10, NOT 2026-10-01
		rerender(
			<DatePicker
				defaultValue="2026-09-10"
				month="2026-10"
				weekStartsOn={0}
				onMonthChange={onMonthChange}
				onChange={onChange}
				aria-label="PendingWeekStartsOn"
			/>,
		);
		expect(screen.getByText("October 2026")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "2026-10-10");
		});
		expect(onChange).not.toHaveBeenCalled();
	});

	it("rejects PageDown, Shift+PageDown, and ArrowRight past the maximum date boundary 275760-09-13", async () => {
		const onChange = vi.fn();
		render(
			<DatePicker defaultValue="275760-09-13" onChange={onChange} aria-label="MaxDateBoundary" />,
		);
		const trigger = screen.getByRole("button", { name: /MaxDateBoundary/ });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "275760-09-13");
		});

		// PageDown past max -> ignored, focus remains on 275760-09-13
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown" });
		expect(document.activeElement).toHaveAttribute("aria-label", "275760-09-13");

		// Shift+PageDown past max -> ignored, focus remains on 275760-09-13
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown", shiftKey: true });
		expect(document.activeElement).toHaveAttribute("aria-label", "275760-09-13");

		// ArrowRight past max -> ignored, focus remains on 275760-09-13
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowRight" });
		expect(document.activeElement).toHaveAttribute("aria-label", "275760-09-13");
		expect(onChange).not.toHaveBeenCalled();

		// Escape closes popover and returns focus to trigger
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
			expect(trigger).toHaveFocus();
		});
		expect(onChange).not.toHaveBeenCalled();
	});

	it("steps PageDown into the final valid month 275760-09 without rejecting the entire month", async () => {
		const onChange = vi.fn();
		render(
			<DatePicker defaultValue="275760-08-13" onChange={onChange} aria-label="LastValidMonth" />,
		);
		const trigger = screen.getByRole("button", { name: /LastValidMonth/ });
		fireEvent.click(trigger);

		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "275760-08-13");
		});

		// PageDown from 275760-08-13 steps into the final valid month 275760-09-13
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "PageDown" });
		expect(screen.getByText("September 275760")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.activeElement).toHaveAttribute("aria-label", "275760-09-13");
		});
		expect(onChange).not.toHaveBeenCalled();
	});

	it("restores trigger focus when all dates are unavailable and preserves the default form value", async () => {
		const onChange = vi.fn();
		const onSubmit = vi.fn((e) => e.preventDefault());
		render(
			<form onSubmit={onSubmit}>
				<DatePicker
					name="blocked"
					defaultValue="2026-09-15"
					isDisabledDate={() => true}
					onChange={onChange}
					aria-label="AllDisabledMonth"
				/>
				<button type="submit">Submit</button>
			</form>,
		);
		const trigger = screen.getByRole("button", { name: /AllDisabledMonth/ });
		fireEvent.click(trigger);

		// When all dates are disabled, all day buttons are disabled and no enabled day button has tabIndex 0
		const dayButtons = screen
			.getAllByRole("button")
			.filter(
				(b) =>
					b.hasAttribute("aria-label") &&
					/^\d{4}-\d{2}-\d{2}$/.test(b.getAttribute("aria-label") || ""),
			);
		expect(dayButtons.length).toBeGreaterThan(0);
		for (const btn of dayButtons) {
			expect(btn).toBeDisabled();
		}
		const enabledFocusableDay = dayButtons.find(
			(btn) => (btn as HTMLButtonElement).disabled === false && btn.tabIndex === 0,
		);
		expect(enabledFocusableDay).toBeUndefined();

		// Escape closes popover and focus returns to trigger
		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
			expect(trigger).toHaveFocus();
		});

		// Disabled dates cannot be selected: onChange is never invoked
		expect(onChange).not.toHaveBeenCalled();

		// Form submission preserves caller-provided defaultValue without clearing it
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		expect(onSubmit).toHaveBeenCalled();
		const input = document.querySelector('input[name="blocked"]') as HTMLInputElement;
		expect(input.value).toBe("2026-09-15");
	});
});
