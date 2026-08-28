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
});
