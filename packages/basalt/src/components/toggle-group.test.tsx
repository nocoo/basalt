import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
	it("renders items in a pill track", () => {
		render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		const group = screen.getByRole("radiogroup");
		expect(group.className).toContain("rounded-full");
		expect(group.className).toContain("bg-basalt-muted");
		expect(screen.getByText("Live").className).toContain("data-[state=on]:shadow-sm");
	});
});
