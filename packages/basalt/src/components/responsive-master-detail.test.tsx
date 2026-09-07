import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResponsiveMasterDetail } from "./responsive-master-detail";

afterEach(() => vi.restoreAllMocks());
function mediaQuery(initial: boolean) {
	const listeners = new Set<() => void>();
	const media = {
		matches: initial,
		addEventListener: vi.fn((_name: string, listener: () => void) => listeners.add(listener)),
		removeEventListener: vi.fn((_name: string, listener: () => void) => listeners.delete(listener)),
	};
	vi.spyOn(window, "matchMedia").mockReturnValue(media as unknown as MediaQueryList);
	return {
		media,
		change: (matches: boolean) =>
			act(() => {
				media.matches = matches;
				for (const listener of listeners) listener();
			}),
	};
}
function Example() {
	const [open, setOpen] = useState(false),
		[id, setId] = useState("a");
	return (
		<ResponsiveMasterDetail
			label="Browser"
			selectedId={id}
			detailOpen={open}
			onDetailOpenChange={setOpen}
			list={
				<>
					<button
						type="button"
						onClick={() => {
							setId("a");
							setOpen(true);
						}}
					>
						Item A
					</button>
					<button
						type="button"
						onClick={() => {
							setId("b");
							setOpen(true);
						}}
					>
						Item B
					</button>
				</>
			}
		>
			<input aria-label="Draft" defaultValue="Retained" />
		</ResponsiveMasterDetail>
	);
}
describe("ResponsiveMasterDetail", () => {
	it("shows two regions on desktop and makes only the active mobile pane interactive", () => {
		const { change, media } = mediaQuery(false);
		const { unmount } = render(<Example />);
		expect(screen.getByRole("region", { name: "Items" })).toBeVisible();
		expect(screen.getByRole("region", { name: "Details" })).toBeVisible();
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		const opener = screen.getByRole("button", { name: "Item A" });
		act(() => opener.focus());
		fireEvent.click(opener);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "My draft" } });
		change(true);
		expect(screen.getByRole("region", { name: "Details" })).toHaveFocus();
		expect(document.querySelector('[aria-label="Items"]')).toHaveAttribute("inert");
		expect(screen.queryByRole("button", { name: "Item A" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Back to items" }));
		expect(opener).toHaveFocus();
		expect(document.querySelector('[aria-label="Details"]')).toHaveAttribute("inert");
		fireEvent.pointerDown(opener);
		fireEvent.click(opener);
		expect(screen.getByRole("textbox")).toHaveValue("My draft");
		change(false);
		expect(screen.getByRole("region", { name: "Items" })).toBeVisible();
		expect(screen.queryByRole("button", { name: "Back to items" })).not.toBeInTheDocument();
		unmount();
		expect(media.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
	});
	it("keeps controlled visibility until accepted and focuses new selections", () => {
		mediaQuery(true);
		const close = vi.fn();
		const props = {
			label: "Browser",
			list: <button type="button">Item</button>,
			detailOpen: true,
			onDetailOpenChange: close,
			children: <input aria-label="Draft" />,
		};
		const { rerender } = render(<ResponsiveMasterDetail {...props} selectedId="a" />);
		fireEvent.click(screen.getByRole("button", { name: "Back to items" }));
		expect(close).toHaveBeenCalledWith(false);
		expect(screen.getByRole("region", { name: "Details" })).toBeVisible();
		act(() => screen.getByRole("textbox").focus());
		rerender(<ResponsiveMasterDetail {...props} selectedId="b" />);
		expect(screen.getByRole("region", { name: "Details" })).toHaveFocus();
		rerender(<ResponsiveMasterDetail {...props} selectedId="b" detailOpen={false} />);
		expect(screen.getByRole("region", { name: "Items" })).toHaveFocus();
	});
	it("falls back to the list region if the original opener was removed", () => {
		mediaQuery(true);
		const props = { label: "Browser", onDetailOpenChange: vi.fn(), children: <p>Content</p> };
		const { rerender } = render(
			<ResponsiveMasterDetail
				{...props}
				detailOpen={false}
				list={<button type="button">Old item</button>}
			/>,
		);
		act(() => screen.getByRole("button", { name: "Old item" }).focus());
		rerender(<ResponsiveMasterDetail {...props} detailOpen list={<p>Item removed</p>} />);
		rerender(<ResponsiveMasterDetail {...props} detailOpen={false} list={<p>Item removed</p>} />);
		expect(screen.getByRole("region", { name: "Items" })).toHaveFocus();
	});
});
