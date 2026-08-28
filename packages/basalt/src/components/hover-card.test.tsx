import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoverCard, HoverCardTrigger } from "./hover-card";

describe("HoverCard", () => {
	it("renders a trigger", () => {
		render(
			<HoverCard>
				<HoverCardTrigger>Hover</HoverCardTrigger>
			</HoverCard>,
		);
		expect(screen.getByText("Hover")).toBeInTheDocument();
	});
});
