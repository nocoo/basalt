import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import i18n from "@/i18n";
import DataPage from "@/pages/DataPage";

afterEach(async () => {
	await act(async () => i18n.changeLanguage("en"));
});

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
		expect(screen.getByRole("navigation", { name: "Pagination" }).parentElement).toHaveClass(
			"w-full",
		);
		expect(screen.queryByText(/Showing .* of .*$/)).toHaveTextContent("Showing 1–2 of 4");
	});

	it.each([
		["en", "Showing 1–2 of 4", "Showing 1–1 of 1"],
		["zh", "第 1–2 条，共 4 条结果", "第 1–1 条，共 1 条结果"],
	] as const)(
		"announces localized %s result range updates",
		async (language, initial, filtered) => {
			await act(async () => i18n.changeLanguage(language));
			render(<DataPage />);
			const status = screen.getByRole("status");
			expect(status).toHaveTextContent(initial);
			expect(status).toHaveAttribute("aria-live", "polite");
			fireEvent.change(screen.getByRole("textbox"), { target: { value: "North" } });
			expect(status).toHaveTextContent(filtered);
		},
	);

	it("does not paint inner wells with bg-card", () => {
		const { container } = render(<DataPage />);
		expect(container.innerHTML).not.toContain("bg-card");
	});
});
