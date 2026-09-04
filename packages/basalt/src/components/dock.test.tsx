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

	it("covers the frame with a dialog scrim in overlay mode", () => {
		const onDismiss = vi.fn();
		render(
			<div className="relative">
				<main>Page</main>
				<Dock mode="overlay" open width="24rem" aria-label="Assistant" onDismiss={onDismiss}>
					Panel
				</Dock>
			</div>,
		);
		const dock = screen.getByRole("dialog", { name: "Assistant" });
		expect(dock).toHaveAttribute("aria-modal", "true");
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

	it("traps Tab inside an open overlay and wraps the ends", async () => {
		const onDismiss = vi.fn();
		render(
			<div className="relative">
				<Dock mode="overlay" open aria-label="Assistant" onDismiss={onDismiss}>
					<button type="button">First</button>
					<button type="button">Last</button>
				</Dock>
			</div>,
		);
		const dismiss = screen.getByRole("button", { name: "Dismiss" });
		const first = screen.getByRole("button", { name: "First" });
		const last = screen.getByRole("button", { name: "Last" });
		await waitFor(() => {
			expect(first).toHaveFocus();
		});
		last.focus();
		fireEvent.keyDown(window, { key: "Tab" });
		expect(dismiss).toHaveFocus();
		dismiss.focus();
		fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
		expect(last).toHaveFocus();
		first.focus();
		fireEvent.keyDown(window, { key: "Tab" });
		expect(last).not.toHaveFocus();
	});

	it("focuses the panel when overlay has no tabbables", () => {
		render(
			<div className="relative">
				<Dock mode="overlay" open aria-label="Assistant">
					Panel
				</Dock>
			</div>,
		);
		const panel = screen.getByRole("dialog", { name: "Assistant" });
		fireEvent.keyDown(window, { key: "Tab" });
		expect(panel).toHaveFocus();
	});

	it("skips hidden, inert, and nested modal focus targets", () => {
		render(
			<div className="relative">
				<Dock mode="overlay" open aria-label="Assistant" onDismiss={vi.fn()}>
					<button type="button">Keep</button>
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
					<div style={{ visibility: "hidden" }}>
						<button type="button" style={{ visibility: "visible" }}>
							Override
						</button>
					</div>
					<input type="hidden" defaultValue="secret" />
				</Dock>
				<div role="dialog">
					<button type="button">Nested</button>
				</div>
				<div data-radix-popper-content-wrapper="">
					<button type="button">Portal</button>
				</div>
			</div>,
		);
		const keep = screen.getByRole("button", { name: "Keep" });
		const dismiss = screen.getByRole("button", { name: "Dismiss" });
		const override = screen.getByRole("button", { name: "Override" });
		screen.getByRole("button", { name: "Nested" }).focus();
		fireEvent.keyDown(window, { key: "Tab" });
		expect(keep).not.toHaveFocus();
		screen.getByRole("button", { name: "Portal" }).focus();
		fireEvent.keyDown(window, { key: "Tab" });
		expect(keep).not.toHaveFocus();
		override.focus();
		fireEvent.keyDown(window, { key: "Tab" });
		expect(dismiss).toHaveFocus();
		dismiss.focus();
		fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
		expect(override).toHaveFocus();
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
