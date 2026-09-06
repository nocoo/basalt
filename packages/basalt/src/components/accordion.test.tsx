import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

describe("Accordion", () => {
	it("renders a trigger", () => {
		render(
			<Accordion type="single" collapsible>
				<AccordionItem value="a">
					<AccordionTrigger>Item</AccordionTrigger>
					<AccordionContent>Body</AccordionContent>
				</AccordionItem>
			</Accordion>,
		);
		expect(screen.getByText("Item")).toBeInTheDocument();
	});

	it("reveals content when opened", () => {
		render(
			<Accordion type="single" collapsible>
				<AccordionItem value="a">
					<AccordionTrigger>Item</AccordionTrigger>
					<AccordionContent>Body</AccordionContent>
				</AccordionItem>
			</Accordion>,
		);
		fireEvent.click(screen.getByText("Item"));
		expect(screen.getByText("Body")).toBeInTheDocument();
	});

	it("applies basalt-ui scope class to root, header, and trigger", () => {
		const { container } = render(
			<Accordion type="single" collapsible>
				<AccordionItem value="a">
					<AccordionTrigger>Item</AccordionTrigger>
					<AccordionContent>Body</AccordionContent>
				</AccordionItem>
			</Accordion>,
		);
		expect(container.querySelector('[data-orientation="vertical"]')).toHaveClass("basalt-ui");
		expect(container.querySelector("h3")).toHaveClass("basalt-ui");
		expect(screen.getByRole("button", { name: "Item" })).toHaveClass("basalt-ui");
	});
});
