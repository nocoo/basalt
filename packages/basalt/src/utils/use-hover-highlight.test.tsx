import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useHoverHighlight } from "./use-hover-highlight";

async function frame() {
	await act(async () => {
		await new Promise((resolve) => requestAnimationFrame(resolve));
	});
}
function Probe({ selected = false, nested = false, refTarget = createRef<HTMLDivElement>() }) {
	const ref = useHoverHighlight(refTarget);
	return (
		<>
			<input aria-label="Search" aria-controls="choices" />
			<div ref={ref} id="choices" data-testid="list" className="basalt-hover-list">
				<button type="button" data-basalt-hover-item="" data-hover-selected={selected}>
					First
				</button>
				<div data-testid="nested">
					{nested && (
						<button type="button" data-basalt-hover-item="">
							Nested
						</button>
					)}
				</div>
				<button type="button" data-basalt-hover-item="">
					Second
				</button>
				<button type="button" data-basalt-hover-item="" disabled>
					Disabled
				</button>
			</div>
		</>
	);
}
function geometry() {
	vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (
		this: HTMLElement,
	) {
		return this.hasAttribute("data-basalt-hover-item") ? 6 : 0;
	});
	vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (
		this: HTMLElement,
	) {
		return this.textContent === "Second" ? 40 : this.dataset.testid === "nested" ? 70 : 0;
	});
	vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
	vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(32);
	vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (
		this: HTMLElement,
	) {
		return this.textContent === "Nested" && this.tagName === "BUTTON"
			? this.parentElement
			: this.closest("#choices");
	});
}
afterEach(() => vi.restoreAllMocks());
describe("shared hover highlight", () => {
	it("ignores its own transition and preserves movement through initial resize delivery", async () => {
		geometry();
		let resize: ResizeObserverCallback = () => {};
		const original = globalThis.ResizeObserver;
		vi.stubGlobal(
			"ResizeObserver",
			class {
				constructor(callback: ResizeObserverCallback) {
					resize = callback;
				}
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
		const { unmount } = render(<Probe selected />);
		await frame();
		const root = screen.getByTestId("list");
		expect(root).toHaveAttribute("data-hover-animated", "false");
		fireEvent.pointerOver(screen.getByText("Second"));
		await frame();
		expect(root).toHaveAttribute("data-hover-animated", "true");
		const writes = vi.spyOn(root.style, "setProperty");
		act(() => resize([], {} as ResizeObserver));
		fireEvent.transitionEnd(root);
		await frame();
		expect(writes).not.toHaveBeenCalled();
		expect(root).toHaveAttribute("data-hover-animated", "true");
		fireEvent.pointerLeave(root);
		act(() => screen.getByText("First").setAttribute("data-disabled", "false"));
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("0px");
		unmount();
		vi.stubGlobal("ResizeObserver", original);
	});
	it("keeps nested lists isolated and finds eligible selection after a hidden row", async () => {
		geometry();
		function Nested() {
			const ref = useHoverHighlight();
			return (
				<div ref={ref} className="basalt-hover-list" data-testid="outer">
					<button type="button" hidden data-basalt-hover-item="" data-hover-selected="true">
						Hidden
					</button>
					<Probe selected />
					<button type="button" data-basalt-hover-item="" data-hover-selected="true">
						Outer
					</button>
				</div>
			);
		}
		render(<Nested />);
		await frame();
		const outer = screen.getByTestId("outer");
		expect(outer).toHaveAttribute("data-hover-visible", "true");
		const before = outer.style.cssText;
		fireEvent.pointerOver(screen.getByText("Second"));
		await frame();
		expect(outer.style.cssText).toBe(before);
		expect(screen.getByTestId("list").style.getPropertyValue("--basalt-hover-y")).toBe("40px");
		act(() => (screen.getByText("Outer").hidden = true));
		await frame();
		expect(outer).toHaveAttribute("data-hover-visible", "false");
	});
	it("measures once per row, coalesces events and clears on leave without rerenders", async () => {
		geometry();
		const ref = createRef<HTMLDivElement>();
		render(<Probe refTarget={ref} />);
		await frame();
		const root = screen.getByTestId("list");
		expect(ref.current).toBe(root);
		expect(root).toHaveAttribute("data-hover-visible", "false");
		fireEvent.pointerOver(screen.getByText("First"));
		fireEvent.pointerOver(screen.getByText("Second"));
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("40px");
		expect(root.style.getPropertyValue("--basalt-hover-width")).toBe("200px");
		const writes = vi.spyOn(root.style, "setProperty");
		const reads = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get");
		reads.mockClear();
		for (let i = 0; i < 10; i++) fireEvent.pointerOver(screen.getByText("Second"));
		await frame();
		expect(writes).not.toHaveBeenCalled();
		expect(reads).not.toHaveBeenCalled();
		fireEvent.pointerLeave(root);
		await frame();
		expect(root).toHaveAttribute("data-hover-visible", "false");
	});
	it("follows selected attributes and focus, excludes disabled and hidden rows", async () => {
		geometry();
		render(<Probe selected />);
		await frame();
		const root = screen.getByTestId("list");
		expect(root).toHaveAttribute("data-hover-visible", "true");
		fireEvent.focusIn(screen.getByText("Second"));
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("40px");
		expect(root).toHaveAttribute("data-hover-animated", "true");
		fireEvent.focusOut(screen.getByText("Second"), { relatedTarget: screen.getByRole("textbox") });
		fireEvent.pointerOver(screen.getByText("Disabled"));
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("0px");
		act(() => (screen.getByText("First").hidden = true));
		await frame();
		expect(root).toHaveAttribute("data-hover-visible", "false");
		fireEvent.pointerOver(screen.getByText("Second"));
		await frame();
		expect(root).toHaveAttribute("data-hover-visible", "true");
		act(() => screen.getByText("Second").removeAttribute("data-basalt-hover-item"));
		await frame();
		expect(root).toHaveAttribute("data-hover-visible", "false");
	});
	it("tracks nested layout and scroll offsets and keyboard active descendants", async () => {
		geometry();
		render(<Probe nested />);
		const root = screen.getByTestId("list");
		const nested = screen.getByTestId("nested");
		nested.scrollTop = 10;
		fireEvent.pointerOver(screen.getByText("Nested"));
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("60px");
		nested.scrollTop = 20;
		fireEvent.scroll(nested);
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("50px");
		nested.scrollTop = 30;
		fireEvent.animationEnd(nested);
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("40px");
		nested.scrollTop = 40;
		fireEvent.transitionEnd(nested);
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("30px");
		act(() => screen.getByText("Second").setAttribute("data-hover-active", "true"));
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowDown" });
		await frame();
		expect(root.style.getPropertyValue("--basalt-hover-y")).toBe("40px");
		fireEvent.blur(root, { relatedTarget: document.body });
		await frame();
		expect(root).toHaveAttribute("data-hover-visible", "true");
	});
	it("disconnects observers and pending frames and clears composed refs", async () => {
		geometry();
		const ref = vi.fn();
		const { unmount } = render(<Probe refTarget={ref as never} />);
		await frame();
		const cancel = vi.spyOn(window, "cancelAnimationFrame");
		fireEvent.pointerOver(screen.getByText("Second"));
		unmount();
		expect(cancel).toHaveBeenCalled();
		expect(ref).toHaveBeenLastCalledWith(null);
	});
});
