import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TagColorPicker } from "./tag-color-picker";

describe("TagColorPicker", () => {
	it("names every color and exposes selection independently of color perception", () => {
		const change = vi.fn();
		render(<TagColorPicker label="Color" onValueChange={change} />);
		expect(screen.getAllByRole("radio")).toHaveLength(10);
		expect(screen.getByRole("radio", { name: "Slate" })).toHaveAttribute("aria-checked", "true");
		fireEvent.click(screen.getByRole("radio", { name: "Blue" }));
		expect(change).toHaveBeenCalledExactlyOnceWith("blue");
		expect(screen.getByRole("radio", { name: "Blue" })).toHaveAttribute("aria-checked", "true");
		fireEvent.click(screen.getByRole("radio", { name: "Blue" }));
		expect(change).toHaveBeenCalledTimes(1);
	});
	it("supports a controlled localized subset and disabling selection", () => {
		const change = vi.fn();
		const props = {
			label: "Status",
			colors: ["success", "danger"] as const,
			labels: { success: "Healthy", danger: "Incident" },
			value: "success" as const,
			onValueChange: change,
		};
		const { rerender } = render(<TagColorPicker {...props} />);
		fireEvent.click(screen.getByRole("radio", { name: "Incident" }));
		expect(change).toHaveBeenCalledWith("danger");
		expect(screen.getByRole("radio", { name: "Healthy" })).toHaveAttribute("aria-checked", "true");
		rerender(<TagColorPicker {...props} disabled />);
		expect(screen.getByRole("radio", { name: "Incident" })).toBeDisabled();
		fireEvent.click(screen.getByRole("radio", { name: "Incident" }));
		expect(change).toHaveBeenCalledTimes(1);
	});
	it("can be uncontrolled without an observer", () => {
		render(<TagColorPicker label="Color" defaultValue="rose" />);
		fireEvent.click(screen.getByRole("radio", { name: "Teal" }));
		expect(screen.getByRole("radio", { name: "Teal" })).toHaveAttribute("aria-checked", "true");
	});
});
