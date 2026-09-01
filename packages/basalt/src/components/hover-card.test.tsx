import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

describe("HoverCard", () => {
	it("renders a trigger", () => {
		render(
			<HoverCard>
				<HoverCardTrigger>Hover</HoverCardTrigger>
			</HoverCard>,
		);
		expect(screen.getByText("Hover")).toBeInTheDocument();
	});

	it("stacks the panel on the overlay layer without motion when reduced", () => {
		render(
			<HoverCard open>
				<HoverCardTrigger>Hover</HoverCardTrigger>
				<HoverCardContent>More</HoverCardContent>
			</HoverCard>,
		);
		expect(screen.getByText("More").className).toContain("z-50");
		expect(screen.getByText("More").className).toContain("motion-reduce:animate-none");
	});
});
