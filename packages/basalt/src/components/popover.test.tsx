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
		expect(
			screen.getByText("Popover Title").closest("[data-side]")?.querySelector("svg"),
		).toBeTruthy();
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
});
