import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClipboardText } from "./clipboard-text";

describe("ClipboardText", () => {
	it("renders the value and a copy control", () => {
		vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
		render(<ClipboardText text="bun add @nocoo/basalt" />);
		expect(screen.getByText("bun add @nocoo/basalt")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
	});
});
