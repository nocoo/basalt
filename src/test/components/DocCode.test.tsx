import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocExample } from "@/pages/ui/DocCode";

describe("documentation container ownership", () => {
	it("uses one inset owner for preview, disclosure header and expanded code", () => {
		const { container } = render(
			<DocExample code="const n = 1;" wide>
				<span>Preview</span>
			</DocExample>,
		);
		const preview = screen.getByText("Preview").parentElement;
		expect(preview).toHaveClass("p-basalt-card");
		expect(preview?.parentElement).not.toHaveClass("p-basalt-card");
		const trigger = screen.getByRole("button", { name: "View example code" });
		expect(trigger).toHaveClass("px-basalt-card", "py-basalt-card-sm");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByRole("region", { name: "Code example" })).toBeNull();
		fireEvent.click(trigger);
		expect(screen.getByRole("region", { name: "Code example" })).toBeVisible();
		const code = container.querySelector("[data-basalt-code]");
		expect(code).toHaveAttribute("data-code-attached", "true");
		expect(code?.parentElement).not.toHaveClass("p-basalt-card");
		expect(code?.parentElement).toHaveClass("data-[state=open]:animate-basalt-collapsible-down");
		fireEvent.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull();
	});
	it("keeps ordinary examples attached and immediately visible", () => {
		const { container } = render(<DocExample code="const n = 1;">Preview</DocExample>);
		expect(screen.queryByRole("button", { name: "View example code" })).toBeNull();
		expect(screen.getByRole("region", { name: "Code example" })).toBeVisible();
		expect(container.querySelector("[data-code-attached]")?.parentElement).toHaveAttribute(
			"data-card-structured",
		);
	});
});
