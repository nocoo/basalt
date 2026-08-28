import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
	it("renders a horizontal rule by default", () => {
		const { container } = render(<Separator />);
		const el = container.firstElementChild;
		expect(el).toHaveAttribute("data-orientation", "horizontal");
		expect(el?.className).toContain("bg-basalt-border");
	});

	it("renders a vertical separator", () => {
		const { container } = render(<Separator orientation="vertical" />);
		expect(container.firstElementChild).toHaveAttribute("data-orientation", "vertical");
	});
});
