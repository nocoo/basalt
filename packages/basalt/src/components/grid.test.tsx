import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid, GridItem } from "./grid";

describe("Grid", () => {
	it("renders items", () => {
		render(
			<Grid>
				<GridItem>1</GridItem>
			</Grid>,
		);
		expect(screen.getByText("1")).toBeInTheDocument();
	});
});
