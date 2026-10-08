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
		expect(trigger.className.split(/\s+/)).toContain("text-basalt-base");
		expect(trigger.className.split(/\s+/)).not.toContain("text-basalt-lg");
		expect(trigger.querySelector("svg")?.getAttribute("class")).toContain(
			"motion-reduce:transition-none",
		);
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
		expect(trigger.querySelector('[data-slot="collapsible-chevron"]')).toHaveClass(
			"group-data-[state=open]/collapsible:rotate-180",
		);
		expect(trigger.className).not.toContain("[&_svg]");
		const panel = screen.getByText("This project is a React component library.");
		expect(panel.className).toContain("border-l-2");
		expect(panel).toHaveClass("px-basalt-card", "py-basalt-card-sm", "my-basalt-layout-sm");
		expect(panel.className.split(/\s+/)).toContain("text-basalt-base");
		expect(panel.className.split(/\s+/)).not.toContain("text-basalt-lg");
		expect(panel.parentElement?.className).toContain(
			"data-[state=open]:animate-basalt-collapsible-down",
		);
		expect(panel.parentElement?.className).toContain("motion-reduce:animate-none");
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
		expect(panel.className).not.toContain("text-basalt-base");
	});
});
