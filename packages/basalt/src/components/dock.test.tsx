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
});
