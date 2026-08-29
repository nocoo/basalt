import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

describe("Table", () => {
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

	it("styles a header bar with even-row stripes", () => {
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
						<TableCell>Worker 1</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Worker 2</TableCell>
						<TableCell>Paused</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByText("Name").className).toContain("font-semibold");
		expect(screen.getByText("Name").className).toContain("bg-basalt-card");
		expect(screen.getByText("Worker 2").closest("tr")?.className).toContain(
			"even:[&_td]:bg-basalt-secondary",
		);
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
		expect(screen.getByText("Selected").closest("tr")?.className).toContain(
			"[&_td]:bg-basalt-accent",
		);
	});
});
