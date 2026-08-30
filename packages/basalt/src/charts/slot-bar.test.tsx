import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SlotBarChart, type SlotBarItem } from "./slot-bar";

describe("SlotBarChart", () => {
	it("renders nothing when items array is empty", () => {
		const { container } = render(<SlotBarChart items={[]} />);
		expect(container.innerHTML).toBe("");
	});

	it("renders the caller number of slot bars", () => {
		const items: SlotBarItem[] = [
			{ color: "bg-indigo-800" },
			{ color: "bg-indigo-500" },
			{ color: "bg-green-600" },
		];
		render(<SlotBarChart items={items} ariaLabel="Sleep" />);
		expect(screen.getAllByTestId("slot-bar")).toHaveLength(3);
		expect(screen.getByRole("img", { name: "Sleep" })).toBeInTheDocument();
	});

	it("applies Tailwind color classes directly", () => {
		const items: SlotBarItem[] = [{ color: "bg-red-500" }, { color: "bg-green-500" }];
		render(<SlotBarChart items={items} />);
		const bars = screen.getAllByTestId("slot-bar");
		expect(bars[0].classList.contains("bg-red-500")).toBe(true);
		expect(bars[1].classList.contains("bg-green-500")).toBe(true);
	});

	it("applies inline backgroundColor for CSS color strings", () => {
		const items: SlotBarItem[] = [{ color: "hsl(220, 50%, 30%)" }];
		render(<SlotBarChart items={items} />);
		const bar = screen.getByTestId("slot-bar");
		expect(bar.style.backgroundColor).toBeTruthy();
		expect(bar.classList.contains("bg-basalt-muted")).toBe(false);
	});

	it("renders empty class for zero-height bars", () => {
		const items: SlotBarItem[] = [{ color: "bg-red-500", height: 0 }];
		render(<SlotBarChart items={items} />);
		const bar = screen.getByTestId("slot-bar");
		expect(bar.classList.contains("bg-basalt-muted")).toBe(true);
		expect(bar.classList.contains("bg-red-500")).toBe(false);
	});

	it("respects custom emptyClass", () => {
		const items: SlotBarItem[] = [{ color: "bg-red-500", height: 0 }];
		render(<SlotBarChart items={items} emptyClass="bg-transparent" />);
		const bar = screen.getByTestId("slot-bar");
		expect(bar.classList.contains("bg-transparent")).toBe(true);
	});

	it("applies height percentage based on height ratio", () => {
		const items: SlotBarItem[] = [{ color: "bg-green-500", height: 0.5 }];
		render(<SlotBarChart items={items} />);
		expect(screen.getByTestId("slot-bar").style.height).toBe("50%");
	});

	it("clamps minimum height to 10% for non-zero values", () => {
		const items: SlotBarItem[] = [{ color: "bg-green-500", height: 0.01 }];
		render(<SlotBarChart items={items} />);
		expect(screen.getByTestId("slot-bar").style.height).toBe("10%");
	});

	it("defaults to full height when height is omitted", () => {
		const items: SlotBarItem[] = [{ color: "bg-blue-500" }];
		render(<SlotBarChart items={items} />);
		expect(screen.getByTestId("slot-bar").style.height).toBe("100%");
	});

	it("wraps with tooltip triggers when labels are present", () => {
		const items: SlotBarItem[] = [
			{ color: "bg-red-500", label: "72 bpm" },
			{ color: "bg-green-500", label: "65 bpm" },
		];
		render(<SlotBarChart items={items} />);
		const bars = screen.getAllByTestId("slot-bar");
		expect(bars).toHaveLength(2);
		expect(bars[0].getAttribute("data-state")).toBe("closed");
		expect(bars[1].getAttribute("data-state")).toBe("closed");
	});

	it("does not add tooltip attributes when no labels", () => {
		const items: SlotBarItem[] = [{ color: "bg-blue-500" }];
		render(<SlotBarChart items={items} />);
		expect(screen.getByTestId("slot-bar").getAttribute("data-state")).toBeNull();
	});

	it("keeps unlabeled mixed items flexing", () => {
		const items: SlotBarItem[] = [
			{ color: "bg-red-500", label: "72 bpm" },
			{ color: "bg-green-500" },
		];
		render(<SlotBarChart items={items} />);
		const unlabeled = screen.getAllByTestId("slot-bar")[1];
		expect(unlabeled.parentElement?.className).toContain("flex-1");
	});

	it("applies custom heightClass and gapClass", () => {
		const items: SlotBarItem[] = [{ color: "bg-blue-500" }];
		const { container } = render(
			<SlotBarChart items={items} heightClass="h-10" gapClass="gap-1" />,
		);
		const wrapper = container.querySelector(".flex.w-full") as HTMLElement;
		expect(wrapper.classList.contains("h-10")).toBe(true);
		expect(wrapper.classList.contains("gap-1")).toBe(true);
	});
});
