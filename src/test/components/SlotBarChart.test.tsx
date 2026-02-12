import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlotBarChart, type SlotBarItem } from "@/components/dashboard/SlotBarChart";

describe("SlotBarChart", () => {
  it("renders nothing when items array is empty", () => {
    const { container } = render(<SlotBarChart items={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders correct number of bars", () => {
    const items: SlotBarItem[] = [
      { color: "bg-indigo-800" },
      { color: "bg-indigo-500" },
      { color: "bg-green-600" },
    ];
    render(<SlotBarChart items={items} />);
    expect(screen.getAllByTestId("slot-bar").length).toBe(3);
  });

  it("applies Tailwind color classes directly", () => {
    const items: SlotBarItem[] = [
      { color: "bg-red-500" },
      { color: "bg-green-500" },
    ];
    render(<SlotBarChart items={items} />);
    const bars = screen.getAllByTestId("slot-bar");
    expect(bars[0].classList.contains("bg-red-500")).toBe(true);
    expect(bars[1].classList.contains("bg-green-500")).toBe(true);
  });

  it("applies inline backgroundColor for CSS color strings", () => {
    const items: SlotBarItem[] = [
      { color: "hsl(220, 50%, 30%)" },
    ];
    render(<SlotBarChart items={items} />);
    const bar = screen.getByTestId("slot-bar");
    // jsdom may normalize HSL to RGB; just verify backgroundColor is set
    expect(bar.style.backgroundColor).toBeTruthy();
    expect(bar.classList.contains("bg-muted")).toBe(false);
  });

  it("renders empty class for zero-height bars", () => {
    const items: SlotBarItem[] = [
      { color: "bg-red-500", height: 0 },
    ];
    render(<SlotBarChart items={items} />);
    const bar = screen.getByTestId("slot-bar");
    expect(bar.classList.contains("bg-muted")).toBe(true);
    expect(bar.classList.contains("bg-red-500")).toBe(false);
  });

  it("respects custom emptyClass", () => {
    const items: SlotBarItem[] = [
      { color: "bg-red-500", height: 0 },
    ];
    render(<SlotBarChart items={items} emptyClass="bg-transparent" />);
    const bar = screen.getByTestId("slot-bar");
    expect(bar.classList.contains("bg-transparent")).toBe(true);
  });

  it("applies height percentage based on height ratio", () => {
    const items: SlotBarItem[] = [
      { color: "bg-green-500", height: 0.5 },
    ];
    render(<SlotBarChart items={items} />);
    const bar = screen.getByTestId("slot-bar");
    expect(bar.style.height).toBe("50%");
  });

  it("clamps minimum height to 10% for non-zero values", () => {
    const items: SlotBarItem[] = [
      { color: "bg-green-500", height: 0.01 },
    ];
    render(<SlotBarChart items={items} />);
    const bar = screen.getByTestId("slot-bar");
    expect(bar.style.height).toBe("10%");
  });

  it("defaults to full height (100%) when height is omitted", () => {
    const items: SlotBarItem[] = [
      { color: "bg-blue-500" },
    ];
    render(<SlotBarChart items={items} />);
    const bar = screen.getByTestId("slot-bar");
    expect(bar.style.height).toBe("100%");
  });

  it("wraps with TooltipProvider when labels are present", () => {
    const items: SlotBarItem[] = [
      { color: "bg-red-500", label: "72 bpm" },
      { color: "bg-green-500", label: "65 bpm" },
    ];
    render(<SlotBarChart items={items} />);
    const bars = screen.getAllByTestId("slot-bar");
    expect(bars.length).toBe(2);
    // Tooltip triggers add data-state attribute from Radix
    expect(bars[0].getAttribute("data-state")).toBe("closed");
    expect(bars[1].getAttribute("data-state")).toBe("closed");
  });

  it("does not add tooltip attributes when no labels", () => {
    const items: SlotBarItem[] = [
      { color: "bg-blue-500" },
    ];
    render(<SlotBarChart items={items} />);
    const bar = screen.getByTestId("slot-bar");
    expect(bar.getAttribute("data-state")).toBeNull();
  });

  it("applies custom heightClass and gapClass", () => {
    const items: SlotBarItem[] = [
      { color: "bg-blue-500" },
    ];
    const { container } = render(
      <SlotBarChart items={items} heightClass="h-10" gapClass="gap-1" />
    );
    const wrapper = container.querySelector(".flex.w-full") as HTMLElement;
    expect(wrapper.classList.contains("h-10")).toBe(true);
    expect(wrapper.classList.contains("gap-1")).toBe(true);
  });

  it("applies custom className to container", () => {
    const items: SlotBarItem[] = [
      { color: "bg-blue-500" },
    ];
    const { container } = render(
      <SlotBarChart items={items} className="my-custom-class" />
    );
    const wrapper = container.querySelector(".flex.w-full") as HTMLElement;
    expect(wrapper.classList.contains("my-custom-class")).toBe(true);
  });
});
