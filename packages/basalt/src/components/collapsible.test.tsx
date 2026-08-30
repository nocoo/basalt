import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

describe("Collapsible", () => {
	it("renders a text trigger with a caret", () => {
		render(
			<Collapsible>
				<CollapsibleTrigger>How does this project work?</CollapsibleTrigger>
				<CollapsibleContent>Hidden</CollapsibleContent>
			</Collapsible>,
		);
		const trigger = screen.getByRole("button", { name: "How does this project work?" });
		expect(trigger.className).toContain("font-medium");
		expect(trigger.querySelector("svg")).toBeTruthy();
		expect(trigger).toHaveAttribute("data-state", "closed");
	});

	it("reveals bordered content and rotates the caret", () => {
		render(
			<Collapsible>
				<CollapsibleTrigger>How does this project work?</CollapsibleTrigger>
				<CollapsibleContent>This project is a React component library.</CollapsibleContent>
			</Collapsible>,
		);
		fireEvent.click(screen.getByRole("button", { name: "How does this project work?" }));
		const trigger = screen.getByRole("button", { name: "How does this project work?" });
		expect(trigger).toHaveAttribute("data-state", "open");
		expect(trigger.className).toContain("data-[state=open]:[&_svg]:rotate-180");
		const panel = screen.getByText("This project is a React component library.");
		expect(panel.className).toContain("border-l-2");
		expect(panel.parentElement?.className).toContain(
			"data-[state=open]:animate-basalt-collapsible-down",
		);
	});

	it("can render unstyled content", () => {
		render(
			<Collapsible defaultOpen>
				<CollapsibleTrigger>Open</CollapsibleTrigger>
				<CollapsibleContent unstyled>Plain</CollapsibleContent>
			</Collapsible>,
		);
		const panel = screen.getByText("Plain");
		expect(panel.className).not.toContain("border-l-2");
	});
});
