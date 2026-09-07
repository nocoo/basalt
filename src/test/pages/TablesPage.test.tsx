import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TablesPage from "@/pages/TablesPage";

describe("TablesPage", () => {
	it("renders a dense pipeline with tags, owners and meters", () => {
		render(<TablesPage />);
		expect(screen.getByRole("heading", { name: "Tables" })).toBeInTheDocument();
		const pipeline = document.querySelector('[data-table-showcase="pipeline"]');
		expect(pipeline).toBeTruthy();
		const table = within(pipeline as HTMLElement).getByRole("table", { name: "Companies" });
		expect(within(table).getByText("Atlas")).toBeInTheDocument();
		expect(within(table).getByText("Sarah Nguyen")).toBeInTheDocument();
		expect(within(table).getAllByText("Enterprise").length).toBeGreaterThan(0);
		expect(within(table).getByText("70%")).toBeInTheDocument();
		expect(within(pipeline as HTMLElement).getByText("12 companies in view")).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: "Select summit" })).toBeChecked();
	});

	it("recombines the same chrome with deals and forecast bodies", () => {
		render(<TablesPage />);
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Deals" }));
		expect(screen.getByRole("table", { name: "Deals" })).toBeInTheDocument();
		expect(screen.getByText("Atlas platform")).toBeInTheDocument();
		expect(screen.getByText("6 deals in view")).toBeInTheDocument();
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Forecast" }));
		expect(screen.getByRole("table", { name: "Forecast" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: /Companies/ })).toBeInTheDocument();
	});

	it("keeps ledger search and fleet status on separate tables", () => {
		render(<TablesPage />);
		fireEvent.change(screen.getByRole("textbox", { name: "Search invoices" }), {
			target: { value: "Echo" },
		});
		const ledger = document.querySelector('[data-table-showcase="ledger"]');
		expect(within(ledger as HTMLElement).getByText("INV-2044")).toBeInTheDocument();
		expect(within(ledger as HTMLElement).queryByText("INV-2041")).not.toBeInTheDocument();
		expect(screen.getByText("Atlas gateway")).toBeInTheDocument();
	});

	it("does not paint inner wells with bg-card", () => {
		const { container } = render(<TablesPage />);
		expect(container.innerHTML).not.toContain("bg-card");
	});
});
