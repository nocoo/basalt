import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Grid, GridItem } from "./grid";

describe("Grid", () => {
	it("renders items on a LayerCard surface", () => {
		render(
			<Grid>
				<GridItem>1</GridItem>
			</Grid>,
		);
		const item = screen.getByText("1");
		expect(item).toBeInTheDocument();
		expect(item).toHaveAttribute("data-slot", "grid-item");
		expect(item).toHaveAttribute("data-basalt-surface", "");
		expect(item.parentElement).toHaveAttribute("data-slot", "grid");
	});

	it("sets an explicit column count by default", () => {
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
		expect(screen.getByText("1").className).toContain("rounded-basalt-card");
	});

	it("maps container-responsive column objects and scalar responsive shorthands", () => {
		const { rerender, container } = render(
			<Grid columns={{ sm: 2, lg: 4 }}>
				<GridItem>A</GridItem>
			</Grid>,
		);
		const grid = container.firstElementChild as HTMLElement;
		expect(grid).toHaveClass("basalt-grid", "grid");
		expect(grid).toHaveAttribute("data-cols-base", "1");
		expect(grid).toHaveAttribute("data-cols-sm", "2");
		expect(grid).toHaveAttribute("data-cols-lg", "4");
		expect(grid).not.toHaveAttribute("data-cols-md");
		expect(grid.style.gridTemplateColumns).toBe("");

		rerender(
			<Grid columns={3} responsive>
				<GridItem>B</GridItem>
			</Grid>,
		);
		expect(container.firstElementChild).toHaveAttribute("data-cols-base", "1");
		expect(container.firstElementChild).toHaveAttribute("data-cols-sm", "2");
		expect(container.firstElementChild).toHaveAttribute("data-cols-md", "3");

		rerender(
			<Grid columns={5} responsive>
				<GridItem>C</GridItem>
			</Grid>,
		);
		expect(container.firstElementChild).toHaveStyle({
			gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
		});
	});

	it("supports scalar, full, responsive colSpan, rowSpan, and forwarded refs", () => {
		const gridRef = createRef<HTMLDivElement>();
		const itemRef = createRef<HTMLDivElement>();
		const { rerender } = render(
			<Grid ref={gridRef} columns={4}>
				<GridItem ref={itemRef} colSpan={2} rowSpan={2}>
					Span
				</GridItem>
			</Grid>,
		);
		expect(gridRef.current).toBeInstanceOf(HTMLDivElement);
		expect(itemRef.current).toBeInstanceOf(HTMLDivElement);
		expect(screen.getByText("Span")).toHaveStyle({
			gridColumn: "span 2 / span 2",
			gridRow: "span 2 / span 2",
		});

		rerender(
			<Grid columns={{ base: 1, md: 3 }}>
				<GridItem colSpan="full">Full</GridItem>
				<GridItem colSpan={{ base: 1, md: 2, xl: 3 }}>Resp</GridItem>
			</Grid>,
		);
		expect(screen.getByText("Full")).toHaveStyle({ gridColumn: "1 / -1" });
		const resp = screen.getByText("Resp");
		expect(resp).toHaveClass("basalt-grid-item");
		expect(resp).toHaveAttribute("data-span-base", "1");
		expect(resp).toHaveAttribute("data-span-md", "2");
		expect(resp).toHaveAttribute("data-span-xl", "3");
	});
});
