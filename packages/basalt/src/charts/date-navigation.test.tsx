import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateNavigation } from "./date-navigation";

afterEach(() => {
	vi.useRealTimers();
});

function isoLabel(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function freezeLocal(year: number, month: number, day: number) {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(year, month - 1, day, 15, 0, 0));
}

function freezeUtc(iso: string) {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(iso));
}

function displayLabel(date: Date, locale: string, timeZone: string) {
	return date.toLocaleDateString(locale, {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone,
	});
}

describe("DateNavigation picker", () => {
	it("updates uncontrolled UI and onChange when moving previous and next days", () => {
		const onChange = vi.fn();
		render(<DateNavigation defaultValue="2026-03-15" onChange={onChange} formatDate={isoLabel} />);
		const trigger = screen.getByRole("button", { name: /Date navigation/ });
		expect(trigger).toHaveTextContent("2026-03-15");
		fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
		expect(onChange).toHaveBeenCalledWith("2026-03-14");
		expect(trigger).toHaveTextContent("2026-03-14");
		fireEvent.click(screen.getByRole("button", { name: "Next day" }));
		expect(onChange).toHaveBeenCalledWith("2026-03-15");
		expect(trigger).toHaveTextContent("2026-03-15");
	});

	it("notifies controlled clicks without changing the displayed value until rerender", () => {
		const onChange = vi.fn();
		const { rerender } = render(
			<DateNavigation value="2026-03-15" onChange={onChange} formatDate={isoLabel} />,
		);
		const trigger = screen.getByRole("button", { name: /Date navigation/ });
		expect(trigger).toHaveTextContent("2026-03-15");
		fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
		expect(onChange).toHaveBeenCalledWith("2026-03-14");
		expect(trigger).toHaveTextContent("2026-03-15");
		fireEvent.click(screen.getByRole("button", { name: "Next day" }));
		expect(onChange).toHaveBeenCalledWith("2026-03-16");
		expect(trigger).toHaveTextContent("2026-03-15");
		rerender(<DateNavigation value="2026-03-16" onChange={onChange} formatDate={isoLabel} />);
		expect(trigger).toHaveTextContent("2026-03-16");
	});

	it("shifts a legal ISO date and falls back from empty or non-ISO values at a frozen clock", () => {
		const onChange = vi.fn();
		let view = render(
			<DateNavigation defaultValue="2026-03-15" onChange={onChange} formatDate={isoLabel} />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Next day" }));
		expect(onChange).toHaveBeenCalledWith("2026-03-16");
		view.unmount();
		onChange.mockClear();
		freezeLocal(2026, 6, 1);
		view = render(<DateNavigation defaultValue="" onChange={onChange} formatDate={isoLabel} />);
		fireEvent.click(screen.getByRole("button", { name: "Next day" }));
		expect(onChange).toHaveBeenCalledWith("2026-06-02");
		view.unmount();
		onChange.mockClear();
		render(<DateNavigation defaultValue="not-a-date" onChange={onChange} formatDate={isoLabel} />);
		fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
		expect(onChange).toHaveBeenCalledWith("2026-05-31");
	});

	it("does not notify onChange when disabled controls are clicked", () => {
		const onChange = vi.fn();
		render(
			<DateNavigation
				defaultValue="2026-03-15"
				disabled
				onChange={onChange}
				formatDate={isoLabel}
			/>,
		);
		const previous = screen.getByRole("button", { name: "Previous day" });
		const trigger = screen.getByRole("button", { name: /Date navigation/ });
		const next = screen.getByRole("button", { name: "Next day" });
		expect(previous).toBeDisabled();
		expect(trigger).toBeDisabled();
		expect(next).toBeDisabled();
		expect(trigger).toHaveTextContent("2026-03-15");
		fireEvent.click(previous);
		fireEvent.click(trigger);
		fireEvent.click(next);
		expect(onChange).not.toHaveBeenCalled();
		expect(trigger).toHaveTextContent("2026-03-15");
	});

	it("prefers ariaLabel, then native aria-label, then Date navigation", () => {
		const { rerender } = render(
			<DateNavigation ariaLabel="When" aria-label="Native" formatDate={isoLabel} />,
		);
		expect(screen.getByRole("button", { name: "When" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Native" })).toBeNull();
		rerender(<DateNavigation aria-label="Native" formatDate={isoLabel} />);
		expect(screen.getByRole("button", { name: "Native" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "When" })).toBeNull();
		rerender(<DateNavigation formatDate={isoLabel} />);
		expect(screen.getByRole("button", { name: "Date navigation" })).toBeInTheDocument();
	});
});

describe("DateNavigation display", () => {
	it("fires today, previous, next, and calendar toggle from a non-today date", () => {
		freezeUtc("2026-03-15T12:00:00.000Z");
		const onPrevDay = vi.fn();
		const onNextDay = vi.fn();
		const onToday = vi.fn();
		const onToggleCalendar = vi.fn();
		const selectedDate = new Date("2026-03-14T12:00:00.000Z");
		render(
			<DateNavigation
				selectedDate={selectedDate}
				onPrevDay={onPrevDay}
				onNextDay={onNextDay}
				onToday={onToday}
				onToggleCalendar={onToggleCalendar}
				locale="en-US"
				timeZone="UTC"
			/>,
		);
		const formatted = displayLabel(selectedDate, "en-US", "UTC");
		expect(screen.getByText(formatted)).toBeInTheDocument();
		const today = screen.getByRole("button", { name: "Today" });
		expect(today).toBeEnabled();
		fireEvent.click(today);
		expect(onToday).toHaveBeenCalledTimes(1);
		fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
		expect(onPrevDay).toHaveBeenCalledTimes(1);
		fireEvent.click(screen.getByRole("button", { name: "Next day" }));
		expect(onNextDay).toHaveBeenCalledTimes(1);
		fireEvent.click(screen.getByRole("button", { name: formatted }));
		expect(onToggleCalendar).toHaveBeenCalledTimes(1);
	});

	it("disables Today on the frozen civil today and enables it otherwise", () => {
		freezeUtc("2026-03-15T12:00:00.000Z");
		const { rerender } = render(
			<DateNavigation
				selectedDate={new Date("2026-03-15T12:00:00.000Z")}
				onPrevDay={vi.fn()}
				onNextDay={vi.fn()}
				onToday={vi.fn()}
				locale="en-US"
				timeZone="UTC"
			/>,
		);
		expect(screen.getByRole("button", { name: "Today" })).toBeDisabled();
		rerender(
			<DateNavigation
				selectedDate={new Date("2026-03-14T12:00:00.000Z")}
				onPrevDay={vi.fn()}
				onNextDay={vi.fn()}
				onToday={vi.fn()}
				locale="en-US"
				timeZone="UTC"
			/>,
		);
		expect(screen.getByRole("button", { name: "Today" })).toBeEnabled();
	});

	it("renders the date as static text when toggle is omitted", () => {
		freezeUtc("2026-03-15T12:00:00.000Z");
		const selectedDate = new Date("2026-03-14T12:00:00.000Z");
		const formatted = displayLabel(selectedDate, "en-US", "UTC");
		render(
			<DateNavigation
				selectedDate={selectedDate}
				onPrevDay={vi.fn()}
				onNextDay={vi.fn()}
				onToday={vi.fn()}
				locale="en-US"
				timeZone="UTC"
			/>,
		);
		expect(screen.getByText(formatted)).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: formatted })).toBeNull();
	});

	it("applies custom formatter, labels, locale, timeZone, and className", () => {
		freezeUtc("2026-03-15T12:00:00.000Z");
		const selectedDate = new Date("2026-03-14T12:00:00.000Z");
		const { container } = render(
			<DateNavigation
				selectedDate={selectedDate}
				onPrevDay={vi.fn()}
				onNextDay={vi.fn()}
				onToday={vi.fn()}
				onToggleCalendar={vi.fn()}
				todayLabel="Hoy"
				previousDayLabel="Anterior"
				nextDayLabel="Siguiente"
				formatDate={() => "CUSTOM-DATE"}
				locale="de-DE"
				timeZone="UTC"
				className="nav-shell"
			/>,
		);
		expect(screen.getByRole("button", { name: "Hoy" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "Anterior" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Siguiente" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "CUSTOM-DATE" })).toBeInTheDocument();
		expect(container.firstElementChild).toHaveClass("nav-shell");
		expect(screen.queryByText(displayLabel(selectedDate, "de-DE", "UTC"))).toBeNull();
	});

	it("formats with locale and timeZone when no custom formatter is provided", () => {
		const selectedDate = new Date("2026-03-15T00:30:00.000Z");
		freezeUtc("2026-03-15T00:30:00.000Z");
		const utcEn = displayLabel(selectedDate, "en-US", "UTC");
		const laEn = displayLabel(selectedDate, "en-US", "America/Los_Angeles");
		const utcDe = displayLabel(selectedDate, "de-DE", "UTC");
		expect(utcEn).not.toBe(laEn);
		expect(utcEn).not.toBe(utcDe);
		const { rerender } = render(
			<DateNavigation
				selectedDate={selectedDate}
				onPrevDay={vi.fn()}
				onNextDay={vi.fn()}
				onToday={vi.fn()}
				locale="en-US"
				timeZone="UTC"
			/>,
		);
		expect(screen.getByText(utcEn)).toBeInTheDocument();
		expect(screen.queryByText(laEn)).toBeNull();
		rerender(
			<DateNavigation
				selectedDate={selectedDate}
				onPrevDay={vi.fn()}
				onNextDay={vi.fn()}
				onToday={vi.fn()}
				locale="en-US"
				timeZone="America/Los_Angeles"
			/>,
		);
		expect(screen.getByText(laEn)).toBeInTheDocument();
		expect(screen.queryByText(utcEn)).toBeNull();
		rerender(
			<DateNavigation
				selectedDate={selectedDate}
				onPrevDay={vi.fn()}
				onNextDay={vi.fn()}
				onToday={vi.fn()}
				locale="de-DE"
				timeZone="UTC"
			/>,
		);
		expect(screen.getByText(utcDe)).toBeInTheDocument();
		expect(screen.queryByText(utcEn)).toBeNull();
	});
});
