import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

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
				return box.top ?? 0;
			}
			return box.height ?? 32;
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

async function flushMicrotask() {
	await act(async () => {
		await Promise.resolve();
	});
}

async function flushFrame() {
	await act(async () => {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	});
}

async function flushObservers() {
	await flushMicrotask();
	await flushFrame();
}

describe("Tabs", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("keeps a controlled value and skips a disabled tab", () => {
		const onValueChange = vi.fn();
		render(
			<Tabs value="a" onValueChange={onValueChange}>
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b" disabled>
						About
					</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(screen.getByRole("tab", { name: "Home" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("tab", { name: "About" })).toBeDisabled();
		fireEvent.mouseDown(screen.getByRole("tab", { name: "About" }));
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("renders tab triggers", () => {
		render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(screen.getByRole("tab", { name: "Home" })).toBeInTheDocument();
	});

	it("renders tab panels", () => {
		render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
				<TabsContent value="a">Home panel</TabsContent>
				<TabsContent value="b">About panel</TabsContent>
			</Tabs>,
		);
		expect(screen.getByText("Home panel")).toBeInTheDocument();
		expect(screen.getByText("Home panel").className).toContain("animate-basalt-tab-in");
		expect(screen.getByText("Home panel").className).toContain("motion-reduce:animate-none");
	});

	it("renders a sliding active indicator", () => {
		const { container } = render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
	});

	it("can hide the sliding indicator", () => {
		const { container } = render(
			<Tabs defaultValue="a">
				<TabsList showIndicator={false}>
					<TabsTrigger value="a">Home</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
	});

	it("hides the indicator when no tab is active", () => {
		const { container } = render(
			<Tabs value="">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		const indicator = container.querySelector('[aria-hidden="true"]') as HTMLElement;
		expect(indicator.style.width).toBe("0px");
	});

	it("forwards the list ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<Tabs defaultValue="a">
				<TabsList ref={ref}>
					<TabsTrigger value="a">Home</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(ref.current).toBe(screen.getByRole("tablist"));
	});

	it("keeps a stable callback ref across first measure and selection updates", async () => {
		const calls: Array<HTMLElement | null> = [];
		const ref = (node: HTMLDivElement | null) => {
			calls.push(node);
		};
		const restore = mockItemBoxes({
			Home: { left: 8, width: 40, top: 4, height: 32 },
			About: { left: 56, width: 48, top: 6, height: 30 },
		});
		const { unmount } = render(
			<Tabs defaultValue="a">
				<TabsList ref={ref}>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		fireEvent.mouseDown(screen.getByRole("tab", { name: "About" }));
		await flushObservers();
		expect(calls.filter((node) => node === null)).toEqual([]);
		expect(calls.filter(Boolean)).toHaveLength(1);
		expect(calls[0]).toBe(screen.getByRole("tablist"));
		unmount();
		expect(calls[calls.length - 1]).toBeNull();
		expect(calls.filter(Boolean)).toHaveLength(1);
		restore();
	});

	it("slides the underline to About after a real tab activation", async () => {
		const restore = mockItemBoxes({
			Home: { left: 8, width: 40, top: 4, height: 32 },
			About: { left: 67, width: 64, top: 2, height: 28 },
		});
		const { container } = render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.left).toBe("8px");
		expect(indicator.style.width).toBe("40px");
		expect(indicator.style.top).toBe("36px");
		expect(indicator.className).not.toContain("duration-200");
		fireEvent.mouseDown(screen.getByRole("tab", { name: "About" }));
		await flushObservers();
		expect(screen.getByRole("tab", { name: "About" })).toHaveAttribute("data-state", "active");
		expect(indicator.style.left).toBe("67px");
		expect(indicator.style.width).toBe("64px");
		expect(indicator.style.top).toBe("30px");
		expect(indicator.className).toContain("duration-200");
		expect(indicator.className).toContain("ease-out");
		restore();
	});
});
