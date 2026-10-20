import { fireEvent, render, screen, within } from "@testing-library/react";
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
		expect(within(table).getByRole("cell", { name: "North Clinic" })).toBeInTheDocument();

		const invoiceHeader = within(table).getByRole("columnheader", { name: "Invoice" });
		const sortButton = within(invoiceHeader).getByRole("button", { name: "Invoice" });
		expect(invoiceHeader).toHaveAttribute("aria-sort", "ascending");
		expect(sortButton.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
		fireEvent.click(sortButton);
		expect(invoiceHeader).toHaveAttribute("aria-sort", "descending");
		expect(within(table).getByRole("cell", { name: "INV-2044" })).toBeInTheDocument();
		expect(within(table).queryByRole("cell", { name: "INV-2041" })).not.toBeInTheDocument();
	});

	it("filters the library table through a named status selector", () => {
		render(<DataPage />);

		const filter = screen.getByRole("combobox", { name: "Filter" });
		fireEvent.keyDown(filter, { key: "ArrowDown" });
		fireEvent.click(screen.getByRole("option", { name: "Overdue" }));
		const table = screen.getByRole("table", { name: "Data Table" });
		expect(within(table).getByRole("cell", { name: "Harbor Recovery" })).toBeInTheDocument();
		expect(within(table).queryByRole("cell", { name: "North Clinic" })).not.toBeInTheDocument();
	});

	it("keeps table filters on the same island as the invoice table", () => {
		render(<DataPage />);
		const table = screen.getByRole("table", { name: "Data Table" });
		const island = table.closest("[data-basalt-surface]");
		expect(island).not.toBeNull();
		expect(screen.getByRole("combobox", { name: "Filter" }).closest("[data-basalt-surface]")).toBe(
			island,
		);
		expect(screen.getByRole("textbox", { name: "Search" }).closest("[data-basalt-surface]")).toBe(
			island,
		);
	});

	it("does not paint inner wells with bg-card", () => {
		const { container } = render(<DataPage />);
		expect(container.innerHTML).not.toContain("bg-card");
	});
});
