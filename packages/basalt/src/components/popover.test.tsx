import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover, PopoverTrigger } from "./popover";

describe("Popover", () => {
	it("renders a trigger", () => {
		render(
			<Popover>
				<PopoverTrigger>Open</PopoverTrigger>
			</Popover>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});
});
