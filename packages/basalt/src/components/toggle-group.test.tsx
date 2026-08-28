import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
	it("renders items", () => {
		render(
			<ToggleGroup type="single">
				<ToggleGroupItem value="left">Left</ToggleGroupItem>
			</ToggleGroup>,
		);
		expect(screen.getByText("Left")).toBeInTheDocument();
	});
});
