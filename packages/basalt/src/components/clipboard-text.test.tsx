import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClipboardText } from "./clipboard-text";

describe("ClipboardText", () => {
	it("renders the value and a copy control", () => {
		vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
		render(<ClipboardText text="bun add @nocoo/basalt" />);
		expect(screen.getByText("bun add @nocoo/basalt")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
		expect(
			screen.getByText("bun add @nocoo/basalt").closest("[data-slot=clipboard-text]")?.className,
		).toContain("border-basalt-border");
		expect(
			screen.getByText("bun add @nocoo/basalt").closest("[data-slot=clipboard-text]")?.className,
		).not.toContain("overflow-hidden");
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
