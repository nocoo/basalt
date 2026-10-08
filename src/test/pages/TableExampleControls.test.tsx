import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OperationsTable from "@/pages/ui/examples/data-table/operations";
import SubscriptionTable from "@/pages/ui/examples/table/subscriptions";

describe("table example library controls", () => {
	it("filters subscriptions, preserves selection and sorts with library actions", () => {
		render(<SubscriptionTable />);
		fireEvent.keyDown(screen.getByRole("combobox", { name: "Care team" }), {
			key: "ArrowDown",
		});
		fireEvent.click(screen.getByRole("option", { name: "Wellness" }));
		const table = screen.getByRole("table", { name: "Health plan ledger" });
		expect(within(table).getByText("Meridian Wellness")).toBeInTheDocument();
		expect(within(table).queryByText("Atlas Cloud")).toBeNull();
		const checkbox = within(table).getByRole("checkbox", { name: "Select Meridian Wellness" });
		fireEvent.click(checkbox);
		expect(checkbox).toHaveAttribute("aria-checked", "true");
		expect(screen.getByText("1 care plans selected")).toBeInTheDocument();
		fireEvent.click(within(table).getByRole("button", { name: "Monthly cost" }));
		expect(within(table).getByRole("columnheader", { name: "Monthly cost" })).toHaveAttribute(
			"aria-sort",
			"ascending",
		);
	});
	it("filters the async device inventory using the shared select", async () => {
		render(<OperationsTable />);
		await screen.findByText("Atlas gateway");
		fireEvent.keyDown(screen.getByRole("combobox", { name: "Device state" }), { key: "ArrowDown" });
		fireEvent.click(screen.getByRole("option", { name: "Offline" }));
		await screen.findByText("Orbit bridge");
		expect(screen.queryByText("Atlas gateway")).toBeNull();
	});
});
