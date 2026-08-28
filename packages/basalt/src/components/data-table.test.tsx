import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable, DataTableBody, DataTableCell, DataTableRow } from "./data-table";

describe("DataTable", () => {
	it("renders cells", () => {
		render(
			<DataTable>
				<DataTableBody>
					<DataTableRow>
						<DataTableCell>Row</DataTableCell>
					</DataTableRow>
				</DataTableBody>
			</DataTable>,
		);
		expect(screen.getByText("Row")).toBeInTheDocument();
	});
});
