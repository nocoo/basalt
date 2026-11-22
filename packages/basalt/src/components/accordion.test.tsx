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

	it("renders divider borders, rotating chevron, focus ring, and height animations", () => {
		const { container } = render(
			<Accordion type="single" collapsible defaultValue="a">
				<AccordionItem value="a">
					<AccordionTrigger>First</AccordionTrigger>
					<AccordionContent>First body</AccordionContent>
				</AccordionItem>
				<AccordionItem value="b">
					<AccordionTrigger asChild>
						<button type="button">Custom Trigger</button>
					</AccordionTrigger>
					<AccordionContent asChild forceMount>
						<section data-testid="custom-panel">Custom body</section>
					</AccordionContent>
				</AccordionItem>
			</Accordion>,
		);
		const firstItem = screen.getByRole("button", { name: "First" }).parentElement?.parentElement;
		expect(firstItem).toHaveClass("border-b", "border-basalt-border", "last:border-b-0");
		const trigger = screen.getByRole("button", { name: "First" });
		expect(trigger).toHaveClass("basalt-focus");
		expect(trigger.querySelector('[data-slot="accordion-chevron"]')).toHaveClass(
			"group-data-[state=open]/accordion:rotate-180",
		);
		const content = screen.getByText("First body").parentElement;
		expect(content?.className).toContain("animate-basalt-accordion-down");
		expect(content?.className).toContain("animate-basalt-accordion-up");
		expect(screen.getByRole("button", { name: "Custom Trigger" })).toBeInTheDocument();
		expect(screen.getByTestId("custom-panel")).toHaveTextContent("Custom body");
		expect(container.querySelectorAll('[data-slot="accordion-chevron"]')).toHaveLength(1);
	});
});
