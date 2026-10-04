import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Loader } from "./loader";

describe("Loader", () => {
	afterEach(() => vi.useRealTimers());
	it("uses a clockwise eight-cell perimeter with an empty center", () => {
		const { container } = render(<Loader />);
		expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
		const grid = container.querySelector("[data-basalt-loader]");
		expect(grid).toHaveStyle({ width: "16px", height: "16px" });
		expect(Array.from(grid?.children ?? []).map((node) => node.getAttribute("data-step"))).toEqual([
			"0",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
		]);
		expect(
			Array.from(grid?.children ?? []).some(
				(node) => (node as HTMLElement).style.gridArea === "2 / 2",
			),
		).toBe(false);
		expect(container.querySelector("svg")).toBeNull();
	});
	it("shows elapsed time at five seconds, measured from mount", () => {
		vi.useFakeTimers();
		const { container, unmount } = render(<Loader label="Churning" />);
		act(() => vi.advanceTimersByTime(4900));
		expect(container.querySelector("[data-basalt-elapsed]")).toBeNull();
		act(() => vi.advanceTimersByTime(100));
		expect(screen.getByText("5.0s")).toHaveAttribute("aria-hidden", "true");
		act(() => vi.advanceTimersByTime(55100));
		expect(screen.getByText("1m 0.1s")).toBeInTheDocument();
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
	it("supports immediate timing, icon-only mode and independent shimmer", () => {
		vi.useFakeTimers();
		const { container, rerender } = render(
			<Loader size={32} label="Working" elapsedDelayMs={0} shimmer={false} />,
		);
		expect(screen.getByText("0.0s")).toBeInTheDocument();
		expect(container.querySelector(".basalt-shimmer-label")).toBeNull();
		expect(container.querySelector("[data-basalt-loader]")).toHaveStyle({ width: "32px" });
		rerender(<Loader showLabel={false} showElapsed={false} animate={false} aria-label="Busy" />);
		expect(screen.getByRole("status", { name: "Busy" })).toBeInTheDocument();
		expect(container.querySelector("[data-basalt-loader]")).toHaveAttribute(
			"data-animated",
			"false",
		);
		expect(container.querySelector("[data-basalt-elapsed]")).toBeNull();
		expect(vi.getTimerCount()).toBe(0);
	});
	it.each([-1, Number.NaN])("normalizes a delay of %s", (delay) => {
		vi.useFakeTimers();
		const { container } = render(<Loader elapsedDelayMs={delay} />);
		if (delay < 0) expect(screen.getByText("0.0s")).toBeInTheDocument();
		else expect(container.querySelector("[data-basalt-elapsed]")).toBeNull();
	});
});
