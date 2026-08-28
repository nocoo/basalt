import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommandInput, CommandList, CommandPalette } from "./command-palette";

describe("CommandPalette", () => {
	it("renders a search field", () => {
		render(
			<CommandPalette>
				<CommandInput placeholder="Search" />
				<CommandList />
			</CommandPalette>,
		);
		expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
	});
});
