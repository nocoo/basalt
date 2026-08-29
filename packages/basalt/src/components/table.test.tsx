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
});
