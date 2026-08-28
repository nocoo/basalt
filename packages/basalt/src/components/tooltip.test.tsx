import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

describe("Tooltip", () => {
	it("renders a trigger", () => {
		render(
			<TooltipProvider>
				<Tooltip open>
					<TooltipTrigger asChild>
						<button type="button">Hint</button>
					</TooltipTrigger>
					<TooltipContent>More</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		);
		expect(screen.getByRole("button", { name: "Hint" })).toBeInTheDocument();
		expect(screen.getByText("More")).toBeInTheDocument();
	});
});
