import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { ClipboardText } from "./clipboard-text";

describe("ClipboardText", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it("renders the value, forwards ref, and styles the copy control", () => {
		const ref = createRef<HTMLDivElement>();
		vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
		render(<ClipboardText ref={ref} text="bun add @nocoo/basalt" />);
		expect(screen.getByText("bun add @nocoo/basalt")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
		const root = screen.getByText("bun add @nocoo/basalt").closest("[data-slot=clipboard-text]");
		expect(ref.current).toBe(root);
		expect(root?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(root?.className.split(/\s+/)).toContain("min-h-basalt-control");
		expect(root?.className).toContain("border-basalt-border");
		expect(root?.className).not.toContain("overflow-hidden");
		expect(root?.className).not.toContain("bg-basalt-background");
		expect(root?.className).not.toContain("rounded-basalt-lg");
		expect(screen.getByText("bun add @nocoo/basalt").className).toContain("rounded-l-basalt-md");
		expect(screen.getByText("bun add @nocoo/basalt")).toHaveClass("font-basalt-mono");
		expect(screen.getByText("bun add @nocoo/basalt").className).not.toContain("py-basalt-space-lg");
		expect(screen.getByRole("button", { name: "Copy" }).className).toContain("rounded-r-basalt-md");
	});

	it("copies text and resets copied indicator after timeout", async () => {
		vi.useFakeTimers();
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText } });
		render(<ClipboardText text="secret" />);
		const button = screen.getByRole("button", { name: "Copy" });
		await act(async () => {
			fireEvent.click(button);
		});
		expect(writeText).toHaveBeenCalledWith("secret");
		expect(button.querySelector(".lucide-check")).toBeTruthy();

		act(() => {
			vi.advanceTimersByTime(2000);
		});
		expect(button.querySelector(".lucide-copy")).toBeTruthy();
	});

	it("copies alternate text", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText } });
		render(<ClipboardText text="sk-••••" copyText="sk-live" />);
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		});
		expect(writeText).toHaveBeenCalledWith("sk-live");
	});
});
