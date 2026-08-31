import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
	it("renders a horizontal rule by default", () => {
		const { container } = render(<Separator />);
		const el = container.firstElementChild;
		expect(el).toHaveAttribute("data-orientation", "horizontal");
		expect(el?.className).toContain("bg-basalt-border");
		expect(el).toHaveClass("h-px", "w-full");
	});

	it("omits separator role when decorative by default", () => {
		const { container } = render(<Separator />);
		expect(container.firstElementChild).toHaveAttribute("role", "none");
	});

	it("exposes separator role when decorative is false", () => {
		const { container } = render(<Separator decorative={false} />);
		expect(container.firstElementChild).toHaveAttribute("role", "separator");
	});

	it("renders a vertical separator", () => {
		const { container } = render(<Separator orientation="vertical" />);
		const el = container.firstElementChild;
		expect(el).toHaveAttribute("data-orientation", "vertical");
		expect(el).toHaveClass("h-full", "w-px");
	});
});
