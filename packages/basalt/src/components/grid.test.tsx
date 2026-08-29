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

	it("lays out a two-by-two card grid", () => {
		render(
			<Grid>
				<GridItem>1</GridItem>
				<GridItem>2</GridItem>
				<GridItem>3</GridItem>
				<GridItem>4</GridItem>
			</Grid>,
		);
		expect(screen.getByText("4")).toBeInTheDocument();
		expect(screen.getByText("1").className).toContain("rounded-basalt-lg");
	});
});
