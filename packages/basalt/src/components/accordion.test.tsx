import { render, screen } from "@testing-library/react";
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
});
