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

	it("sets an explicit column count", () => {
		const { container } = render(
			<Grid columns={3}>
				<GridItem>1</GridItem>
			</Grid>,
		);
		expect(container.firstElementChild).toHaveStyle({
			gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
		});
	});
	it.each([
		["sm", "gap-basalt-layout-sm"],
		["md", "gap-basalt-layout"],
		["lg", "gap-basalt-layout-lg"],
		["xl", "gap-basalt-layout-xl"],
	] as const)("uses the %s layout spacing tier", (gap, className) => {
		const { container } = render(
			<Grid gap={gap}>
				<span>Content</span>
			</Grid>,
		);
		expect(container.firstElementChild).toHaveClass(className);
		expect(container.firstElementChild).not.toHaveAttribute("gap");
	});

	it("keeps column tracks when a caller style is passed", () => {
		const { container } = render(
			<Grid columns={3} style={{ gap: "8px" }}>
				<GridItem>1</GridItem>
			</Grid>,
		);
		expect(container.firstElementChild).toHaveStyle({
			gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
			gap: "8px",
		});
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
