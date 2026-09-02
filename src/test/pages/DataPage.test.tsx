import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DataPage from "@/pages/DataPage";

describe("DataPage", () => {
	it("renders invoice rows through the library table", () => {
		render(<DataPage />);

		const table = screen.getByRole("table", { name: "Data Table" });
		expect(
			within(table)
				.getAllByRole("columnheader")
				.map((cell) => cell.textContent),
		).toEqual(["Invoice", "Customer", "Status", "Amount", "Date"]);
		expect(within(table).getByRole("cell", { name: "INV-2041" })).toBeInTheDocument();
		expect(within(table).getByRole("cell", { name: "Nova Labs" })).toBeInTheDocument();
	});
});
