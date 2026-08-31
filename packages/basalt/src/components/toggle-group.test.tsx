import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

function mockItemBoxes(
	boxes: Record<string, { left: number; width: number; top?: number; height?: number }>,
) {
	const read = (key: "left" | "width" | "top" | "height") =>
		function (this: HTMLElement) {
			const box = boxes[this.textContent?.trim() ?? ""];
			if (!box) {
				return 0;
			}
			if (key === "left") {
				return box.left;
			}
			if (key === "width") {
				return box.width;
			}
			if (key === "top") {
				return box.top ?? 2;
			}
			return box.height ?? 28;
		};
	const spies = [
		vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(read("left")),
		vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(read("width")),
		vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(read("top")),
		vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(read("height")),
	];
	return () => {
		for (const spy of spies) {
			spy.mockRestore();
		}
	};
}

async function flushFrame() {
	await act(async () => {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	});
}

describe("ToggleGroup", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders items in a pill track", () => {
		render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		const group = screen.getByRole("radiogroup");
		expect(group.className).toContain("rounded-full");
		expect(group.className).toContain("bg-basalt-muted");
		expect(screen.getByText("Live").className).toContain(
			"data-[state=on]:text-basalt-primary-foreground",
		);
		expect(screen.getByText("Live").className).not.toContain("data-[state=on]:bg-basalt-primary");
	});

	it("puts a sliding indicator behind the selected single item", () => {
		const restore = mockItemBoxes({ Live: { left: 4, width: 42, height: 28 } });
		const { container } = render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator).toBeTruthy();
		expect(container.firstChild?.firstChild).toBe(indicator);
		expect(indicator.className).toContain("bg-basalt-primary");
		expect(indicator.className).toContain("shadow-sm");
		expect(indicator.style.left).toBe("4px");
		expect(indicator.style.width).toBe("42px");
		expect(indicator.style.height).toBe("28px");
		expect(indicator.className).not.toContain("duration-200");
		restore();
	});

	it("moves and sizes the indicator after a user switch", async () => {
		const restore = mockItemBoxes({
			Live: { left: 4, width: 42, height: 28 },
			Mock: { left: 50, width: 48, height: 28 },
		});
		const { container } = render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		fireEvent.click(screen.getByText("Mock"));
		await flushFrame();
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.left).toBe("50px");
		expect(indicator.style.width).toBe("48px");
		expect(indicator.className).toContain("duration-200");
		expect(indicator.className).toContain("ease-out");
		restore();
	});

	it("resyncs after a ResizeObserver callback", async () => {
		let notify: ResizeObserverCallback = () => {};
		vi.stubGlobal(
			"ResizeObserver",
			class {
				constructor(cb: ResizeObserverCallback) {
					notify = cb;
				}
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
		const restore = mockItemBoxes({ Live: { left: 4, width: 42, height: 28 } });
		const { container } = render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
			</ToggleGroup>,
		);
		restore();
		const restoreGrown = mockItemBoxes({ Live: { left: 4, width: 80, height: 28 } });
		act(() => {
			notify([] as ResizeObserverEntry[], {} as ResizeObserver);
		});
		await flushFrame();
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.width).toBe("80px");
		restoreGrown();
	});

	it("resyncs when item text mutates", async () => {
		const restore = mockItemBoxes({ Live: { left: 4, width: 42, height: 28 } });
		const { container } = render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
			</ToggleGroup>,
		);
		restore();
		const restoreGrown = mockItemBoxes({ "Live now": { left: 4, width: 96, height: 28 } });
		act(() => {
			screen.getByText("Live").textContent = "Live now";
		});
		await flushFrame();
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.width).toBe("96px");
		restoreGrown();
	});

	it("does not show a fake selection when nothing is on", () => {
		const { container } = render(
			<ToggleGroup type="single">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.width).toBe("0px");
		expect(indicator.style.height).toBe("0px");
	});

	it("does not render a shared indicator in multiple mode", () => {
		const { container } = render(
			<ToggleGroup type="multiple" defaultValue={["live", "mock"]}>
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		expect(container.querySelector('[data-slot="selection-indicator"]')).toBeNull();
		expect(screen.getByText("Live")).toHaveAttribute("data-state", "on");
		expect(screen.getByText("Mock")).toHaveAttribute("data-state", "on");
		expect(screen.getByText("Live").className).toContain("data-[state=on]:bg-basalt-primary");
		expect(screen.getByText("Live").className).toContain("data-[state=on]:shadow-sm");
	});

	it("forwards the root ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<ToggleGroup ref={ref} type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
			</ToggleGroup>,
		);
		expect(ref.current).toBe(screen.getByRole("radiogroup"));
	});
});
