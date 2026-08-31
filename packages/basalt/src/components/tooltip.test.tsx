import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Tooltip,
	TooltipContent,
	type TooltipProps,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip";

function acceptTooltipProps(_props: TooltipProps) {}

describe("Tooltip", () => {
	it("keeps the radix root runtime identity", () => {
		expect(Tooltip).toBe(TooltipPrimitive.Root);
	});

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

	it("accepts root controlled props and documented delayDuration", () => {
		acceptTooltipProps({});
		acceptTooltipProps({ delayDuration: 700 });
		acceptTooltipProps({
			open: true,
			defaultOpen: false,
			onOpenChange: () => undefined,
			disableHoverableContent: true,
			delayDuration: 0,
		});
	});
});
