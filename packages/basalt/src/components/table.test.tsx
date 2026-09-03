import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

describe("Table", () => {
	it("renders a native table with caption", () => {
		render(
			<Table>
				<TableCaption>Roster</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>Atlas</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByRole("table", { name: "Roster" }).tagName).toBe("TABLE");
		expect(screen.getByRole("columnheader", { name: "Name" }).tagName).toBe("TH");
		expect(screen.getByRole("cell", { name: "Atlas" }).tagName).toBe("TD");
	});

	it("renders a footer row", () => {
		render(
			<Table>
				<TableFooter>
					<TableRow>
						<TableCell>Total</TableCell>
					</TableRow>
				</TableFooter>
			</Table>,
		);
		expect(screen.getByText("Total").closest("tfoot")).toBeTruthy();
	});

	it("renders headers", () => {
		render(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>Atlas</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByText("Atlas")).toBeInTheDocument();
	});

	it("styles a header bar without a recessed fill", () => {
		render(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>Report 1</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Report 2</TableCell>
						<TableCell>Paused</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByRole("table")).toHaveAttribute("data-basalt-table");
		expect(screen.getByText("Name").className).toContain("font-medium");
		expect(screen.getByText("Name").className).toContain("text-basalt-muted-foreground");
		expect(screen.getByText("Name").className).not.toContain("bg-basalt-card");
	});

	it("highlights a selected row", () => {
		render(
			<Table>
				<TableBody>
					<TableRow variant="selected">
						<TableCell>Selected</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByText("Selected").closest("tr")).toHaveAttribute("aria-selected", "true");
	});
});
