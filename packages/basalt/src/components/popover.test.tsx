import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "./popover";

describe("Popover", () => {
	it("renders a trigger", () => {
		render(
			<Popover>
				<PopoverTrigger>Open Popover</PopoverTrigger>
			</Popover>,
		);
		expect(screen.getByText("Open Popover")).toBeInTheDocument();
	});

	it("renders a title, description, and arrow", () => {
		render(
			<Popover defaultOpen>
				<PopoverTrigger>Open Popover</PopoverTrigger>
				<PopoverContent>
					<PopoverTitle>Popover Title</PopoverTitle>
					<PopoverDescription>This is a popover.</PopoverDescription>
				</PopoverContent>
			</Popover>,
		);
		expect(screen.getByText("Popover Title")).toBeInTheDocument();
		expect(screen.getByText("This is a popover.")).toBeInTheDocument();
		const panel = screen.getByText("Popover Title").closest("[data-side]");
		expect(panel?.querySelector("svg")).toBeTruthy();
		expect(panel?.className).toContain("motion-reduce:animate-none");
		expect(panel?.className).toContain("z-50");
	});

	it.each(["top", "bottom", "left", "right"] as const)("places content on the %s", (side) => {
		render(
			<Popover defaultOpen>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent side={side} avoidCollisions={false}>
					<PopoverTitle>{side}</PopoverTitle>
				</PopoverContent>
			</Popover>,
		);
		expect(screen.getByText(side).closest("[data-side]")).toHaveAttribute("data-side", side);
	});

	it("supports asChild composition with and without arrow while forwarding ref", () => {
		let refTarget: HTMLElement | null = null;
		const { rerender } = render(
			<Popover defaultOpen>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent
					asChild
					ref={(node) => {
						refTarget = node;
					}}
					data-testid="popover-panel"
				>
					<section data-testid="custom-section">
						<span>Custom Content</span>
					</section>
				</PopoverContent>
			</Popover>,
		);

		const section = screen.getByTestId("custom-section");
		expect(section.tagName).toBe("SECTION");
		expect(refTarget).toBe(section);
		expect(section.querySelector("svg")).toBeTruthy();

		rerender(
			<Popover defaultOpen>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent
					asChild
					arrow={false}
					ref={(node) => {
						refTarget = node;
					}}
					data-testid="popover-panel"
				>
					<section data-testid="custom-section">
						<span>Custom Content Without Arrow</span>
					</section>
				</PopoverContent>
			</Popover>,
		);

		const sectionNoArrow = screen.getByTestId("custom-section");
		expect(sectionNoArrow.tagName).toBe("SECTION");
		expect(refTarget).toBe(sectionNoArrow);
		expect(sectionNoArrow.querySelector("svg")).toBeNull();
	});
});
