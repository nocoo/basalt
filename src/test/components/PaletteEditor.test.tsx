import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaletteEditor } from "@/components/PaletteEditor";
import { SitePaletteProvider } from "@/components/SitePaletteProvider";

describe("palette disclosure composition", () => {
	it("preserves editing and submission with slot-owned insets", () => {
		render(
			<SitePaletteProvider>
				<PaletteEditor />
			</SitePaletteProvider>,
		);
		const trigger = screen.getByRole("button", { name: "Customize all 12 colors" });
		expect(trigger).toHaveClass("px-basalt-card", "py-basalt-card-sm");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(trigger);
		const save = screen.getByRole("button", { name: "Save custom palette" });
		const form = save.closest("form");
		expect(form?.parentElement).toHaveAttribute("data-slot", "card-body");
		expect(form?.parentElement).toHaveClass("p-basalt-card");
		const field = screen.getAllByRole("textbox")[0];
		fireEvent.change(field, { target: { value: "invalid" } });
		expect(save).toBeDisabled();
		fireEvent.change(field, { target: { value: "#73c2fb" } });
		expect(save).toBeEnabled();
		fireEvent.click(save);
		expect(screen.getByRole("status")).toHaveTextContent("Custom palette saved in this browser.");
		fireEvent.click(trigger);
		expect(screen.queryByRole("textbox")).toBeNull();
	});
});
