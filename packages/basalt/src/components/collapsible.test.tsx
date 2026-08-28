import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

describe("Collapsible", () => {
	it("shows the trigger", () => {
		render(
			<Collapsible>
				<CollapsibleTrigger>Open</CollapsibleTrigger>
				<CollapsibleContent>Hidden</CollapsibleContent>
			</Collapsible>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});

	it("reveals content", () => {
		render(
			<Collapsible>
				<CollapsibleTrigger>Open</CollapsibleTrigger>
				<CollapsibleContent>Hidden</CollapsibleContent>
			</Collapsible>,
		);
		fireEvent.click(screen.getByText("Open"));
		expect(screen.getByText("Hidden")).toBeInTheDocument();
	});
});
