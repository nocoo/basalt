import { readFileSync } from "node:fs";
import path from "node:path";
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
	it("marks subscription outer rails, select slot and caption insets", () => {
		render(<SubscriptionTable />);
		const table = screen.getByRole("table", { name: "Health plan ledger" });
		const selectHead = within(table).getByRole("columnheader", { name: "Select" });
		expect(selectHead).toHaveClass("ps-basalt-table-edge", "w-basalt-10", "min-w-basalt-10");
		expect(selectHead.className).not.toMatch(/\bpe-basalt-table-edge\b/);
		expect(within(table).getByRole("columnheader", { name: "Actions" })).toHaveClass(
			"pe-basalt-table-edge",
		);
		expect(
			within(table).getByRole("checkbox", { name: "Select Atlas Primary Care" }).closest("td"),
		).toHaveClass("ps-basalt-table-edge");
		expect(
			within(table).getByRole("button", { name: "Manage Atlas Primary Care" }).closest("td"),
		).toHaveClass("pe-basalt-table-edge");
		const caption = table.querySelector("caption");
		expect(caption).toHaveClass("px-basalt-panel-x", "py-basalt-panel-y");
		expect(caption?.className).not.toMatch(/mt-basalt-space-lg/);
		for (const [mode, finder] of [
			["Loading", () => within(table).getByRole("status", { name: "Loading care plans" })],
			["Empty", () => within(table).getByText("No care plans match this view.")],
			["Error", () => within(table).getByRole("alert")],
		] as const) {
			fireEvent.click(screen.getByRole("button", { name: mode }));
			expect(finder().closest("td")).toHaveClass("ps-basalt-table-edge", "pe-basalt-table-edge");
		}
	});
	it("marks framed catalog API table rails", () => {
		const page = readFileSync(
			path.join(process.cwd(), "src/pages/ui/UiPlaceholderPage.tsx"),
			"utf8",
		);
		expect(page).toContain('<TableHead className="ps-basalt-table-edge">Option</TableHead>');
		expect(page).toContain('<TableHead className="ps-basalt-table-edge">Prop</TableHead>');
		expect(page.match(/className="pe-basalt-table-edge">Description<\/TableHead>/g)?.length).toBe(
			2,
		);
		expect(page.match(/font-medium text-foreground ps-basalt-table-edge/g)?.length).toBe(2);
		expect(page.match(/text-muted-foreground pe-basalt-table-edge/g)?.length).toBe(2);
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
