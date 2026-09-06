import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dock, DockBody } from "./dock";

describe("Dock", () => {
	it("collapses width when closed", () => {
		render(
			<Dock open={false} aria-label="Assistant">
				Panel
			</Dock>,
		);
		const dock = screen.getByLabelText("Assistant");
		expect(dock).toHaveStyle({ width: "0px" });
		expect(dock).toHaveAttribute("aria-hidden", "true");
	});

	it("opens to the given width", () => {
		render(
			<Dock open width="24rem" aria-label="Assistant">
				Panel
			</Dock>,
		);
		const dock = screen.getByLabelText("Assistant");
		expect(dock).toHaveStyle({ width: "384px" });
		expect(dock).toHaveAttribute("aria-hidden", "false");
		expect(screen.getByText("Panel")).toBeInTheDocument();
	});

	it("keeps the overlay scrim inert without onDismiss", () => {
		render(
			<div className="relative">
				<Dock mode="overlay" open width="24rem" aria-label="Assistant">
					Panel
				</Dock>
			</div>,
		);
		expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
	});

	it("covers the frame with a non-modal scrim in overlay mode", () => {
		const onDismiss = vi.fn();
		render(
			<div className="relative">
				<main>Page</main>
				<Dock mode="overlay" open width="24rem" aria-label="Assistant" onDismiss={onDismiss}>
					Panel
				</Dock>
			</div>,
		);
		const dock = screen.getByRole("region", { name: "Assistant" });
		expect(dock).not.toHaveAttribute("aria-modal");
		expect(dock).toHaveClass("absolute");
		expect(dock).toHaveStyle({ width: "384px" });
		const scrim = screen.getByRole("button", { name: "Dismiss" });
		expect(scrim.className).toContain("backdrop-blur-md");
		expect(scrim.className).toContain("bg-black/40");
		fireEvent.click(scrim);
		expect(onDismiss).toHaveBeenCalled();
	});

	it("moves focus into the panel when opened and restores it on close", async () => {
		function Harness() {
			const [open, setOpen] = useState(false);
			return (
				<>
					<button type="button" onClick={() => setOpen(true)}>
						Open
					</button>
					<Dock open={open} aria-label="Assistant">
						<button type="button" onClick={() => setOpen(false)}>
							Inside
						</button>
					</Dock>
				</>
			);
		}
		render(<Harness />);
		const opener = screen.getByRole("button", { name: "Open" });
		opener.focus();
		fireEvent.click(opener);
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Inside" })).toHaveFocus();
		});
		fireEvent.click(screen.getByRole("button", { name: "Inside" }));
		await waitFor(() => {
			expect(opener).toHaveFocus();
		});
	});

	it("renders body as the scrolling pane", () => {
		render(
			<Dock open aria-label="Assistant">
				<DockBody>Transcript</DockBody>
			</Dock>,
		);
		expect(screen.getByText("Transcript")).toBeInTheDocument();
	});

	it("dismisses overlay on Escape and ignores prevented or missing handlers", () => {
		const onDismiss = vi.fn();
		const { rerender } = render(
			<div className="relative">
				<Dock mode="overlay" open aria-label="Assistant" onDismiss={onDismiss}>
					<button type="button">Inside</button>
				</Dock>
			</div>,
		);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onDismiss).toHaveBeenCalledTimes(1);
		const blocked = new KeyboardEvent("keydown", {
			key: "Escape",
			bubbles: true,
			cancelable: true,
		});
		blocked.preventDefault();
		window.dispatchEvent(blocked);
		expect(onDismiss).toHaveBeenCalledTimes(1);
		rerender(
			<div className="relative">
				<Dock mode="overlay" open aria-label="Assistant">
					<button type="button">Inside</button>
				</Dock>
			</div>,
		);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onDismiss).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(window, { key: "ArrowDown" });
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it("permits standard focus flow beyond panel without whole-document trap", async () => {
		const onDismiss = vi.fn();
		render(
			<div className="relative">
				<button type="button">Before</button>
				<Dock mode="overlay" open aria-label="Assistant" onDismiss={onDismiss}>
					<button type="button">First</button>
					<button type="button">Last</button>
				</Dock>
				<button type="button">After</button>
			</div>,
		);
		const first = screen.getByRole("button", { name: "First" });
		const last = screen.getByRole("button", { name: "Last" });
		await waitFor(() => {
			expect(first).toHaveFocus();
		});

		// Tab on last element should not be prevented and should not force wrap to first
		last.focus();
		const tabEvent = new KeyboardEvent("keydown", {
			key: "Tab",
			bubbles: true,
			cancelable: true,
		});
		window.dispatchEvent(tabEvent);
		expect(tabEvent.defaultPrevented).toBe(false);
		expect(first).not.toHaveFocus();

		// Shift+Tab on first element should not be prevented and should not force wrap to last
		first.focus();
		const shiftTabEvent = new KeyboardEvent("keydown", {
			key: "Tab",
			shiftKey: true,
			bubbles: true,
			cancelable: true,
		});
		window.dispatchEvent(shiftTabEvent);
		expect(shiftTabEvent.defaultPrevented).toBe(false);
		expect(last).not.toHaveFocus();
	});

	it("autofocuses the panel when open and contains no tabbables", async () => {
		render(
			<div className="relative">
				<Dock mode="overlay" open aria-label="Assistant">
					Panel
				</Dock>
			</div>,
		);
		const panel = screen.getByRole("region", { name: "Assistant" });
		await waitFor(() => {
			expect(panel).toHaveFocus();
		});
	});

	it("skips hidden, inert, and disabled elements when assigning initial focus", async () => {
		render(
			<div className="relative">
				<Dock mode="overlay" open aria-label="Assistant" onDismiss={vi.fn()}>
					<button type="button" style={{ visibility: "hidden" }}>
						Invisible
					</button>
					<button type="button" tabIndex={-1}>
						Programmatic
					</button>
					<div hidden>
						<button type="button">Hidden attr</button>
					</div>
					<div style={{ display: "none" }}>
						<button type="button">Display none</button>
					</div>
					<div inert>
						<button type="button">Inert</button>
					</div>
					<button type="button" disabled>
						Disabled
					</button>
					<button type="button">First Valid</button>
					<button type="button">Second</button>
				</Dock>
			</div>,
		);
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "First Valid" })).toHaveFocus();
		});
	});

	it("does not trap keys while overlay is closed", () => {
		const onDismiss = vi.fn();
		render(
			<div className="relative">
				<button type="button">Outside</button>
				<Dock mode="overlay" open={false} aria-label="Assistant" onDismiss={onDismiss}>
					<button type="button">Inside</button>
				</Dock>
			</div>,
		);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onDismiss).not.toHaveBeenCalled();
		fireEvent.keyDown(window, { key: "Tab" });
		expect(screen.getByRole("button", { name: "Outside" })).not.toHaveFocus();
	});
});
