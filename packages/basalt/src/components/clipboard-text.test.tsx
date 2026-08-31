import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { ClipboardText } from "./clipboard-text";

describe("ClipboardText", () => {
	it("renders the value and a copy control", () => {
		vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
		render(<ClipboardText text="bun add @nocoo/basalt" />);
		expect(screen.getByText("bun add @nocoo/basalt")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
		const root = screen.getByText("bun add @nocoo/basalt").closest("[data-slot=clipboard-text]");
		expect(root?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(root?.className.split(/\s+/)).toContain("h-9");
		expect(root?.className).toContain("border-basalt-border");
		expect(root?.className).not.toContain("overflow-hidden");
		expect(root?.className).not.toContain("bg-basalt-background");
		expect(root?.className).not.toContain("rounded-basalt-lg");
		expect(screen.getByText("bun add @nocoo/basalt").className).toContain("rounded-l-basalt-md");
		expect(screen.getByText("bun add @nocoo/basalt").className).not.toContain("py-2");
		expect(screen.getByRole("button", { name: "Copy" }).className).toContain("rounded-r-basalt-md");
	});

	it("copies text when clicked", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText } });
		render(<ClipboardText text="secret" />);
		fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		await waitFor(() => expect(writeText).toHaveBeenCalledWith("secret"));
	});

	it("copies alternate text", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText } });
		render(<ClipboardText text="sk-••••" copyText="sk-live" />);
		fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		await waitFor(() => expect(writeText).toHaveBeenCalledWith("sk-live"));
	});
});
