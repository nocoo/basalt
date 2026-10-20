import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DiffTable, type DiffTableRow } from "./diff-table";

const rows: DiffTableRow[] = [
	{ id: "r", label: "Rocky Road", change: "remove", values: { name: "Rocky Road" } },
	{ id: "k", label: "Mint", change: "unchanged", values: { name: "Mint" } },
	{ id: "a", label: "Pistachio", change: "add", values: { name: "Pistachio" } },
];
const columns = [{ id: "name", label: "Flavor", width: 160 }];
describe("DiffTable", () => {
	it("selects changes by row or keyboard control and applies only selected rows", async () => {
		const apply = vi.fn();
		render(<DiffTable columns={columns} rows={rows} onApply={apply} />);
		expect(screen.getByRole("button", { name: "Apply 2 changes" })).toBeEnabled();
		fireEvent.click(screen.getByRole("cell", { name: "Rocky Road" }));
		expect(screen.getByRole("checkbox", { name: "Include removal Rocky Road" })).not.toBeChecked();
		fireEvent.click(screen.getByRole("cell", { name: "Mint" }));
		expect(screen.getAllByRole("checkbox")).toHaveLength(2);
		fireEvent.click(screen.getByRole("button", { name: "Apply 1 changes" }));
		await screen.findByText("1 changes applied");
		expect(apply).toHaveBeenCalledWith([rows[2]]);
		expect(screen.getByRole("checkbox", { name: "Include addition Pistachio" })).toBeDisabled();
	});
	it("keeps selection on failed application and blocks duplicates", async () => {
		let reject: (e: unknown) => void = () => {};
		const apply = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise((_, no) => {
						reject = no;
					}),
			)
			.mockResolvedValue(undefined);
		render(<DiffTable columns={columns} rows={rows} onApply={apply} />);
		fireEvent.click(screen.getByRole("button", { name: "Apply 2 changes" }));
		fireEvent.click(screen.getByRole("button", { name: "Apply 2 changes" }));
		expect(apply).toHaveBeenCalledOnce();
		await act(async () => reject(new Error("Offline")));
		expect(screen.getByRole("alert")).toHaveTextContent("Offline");
		fireEvent.click(screen.getByRole("checkbox", { name: "Include removal Rocky Road" }));
		fireEvent.click(screen.getByRole("button", { name: "Apply 1 changes" }));
		await screen.findByText("1 changes applied");
	});
	it("marks the known outer cells of the attached card table", () => {
		render(<DiffTable columns={columns} rows={rows} onApply={vi.fn()} />);
		expect(screen.getByRole("columnheader", { name: "Change" })).toHaveClass(
			"ps-basalt-table-edge",
		);
		expect(screen.getByRole("columnheader", { name: "Include change" })).toHaveClass(
			"pe-basalt-table-edge",
		);
		expect(screen.getByRole("cell", { name: /Keep/ }).className).toMatch(
			/\bps-basalt-table-edge\b/,
		);
		expect(
			screen.getByRole("checkbox", { name: "Include addition Pistachio" }).closest("td"),
		).toHaveClass("pe-basalt-table-edge");
	});

	it("uses semantic change labels and keeps selection controls adjacent", () => {
		render(<DiffTable columns={columns} rows={rows} onApply={vi.fn()} />);
		expect(screen.getByText("Add")).toHaveClass("text-basalt-success");
		expect(screen.getByText("Remove")).toHaveClass("text-basalt-destructive");
		expect(screen.getByText("Keep")).not.toHaveClass(
			"text-basalt-success",
			"text-basalt-destructive",
		);
		for (const checkbox of screen.getAllByRole("checkbox")) {
			expect(checkbox).not.toHaveClass("ms-auto");
		}
	});

	it("reserves the change-marker slot for Keep, Add and Remove", () => {
		render(<DiffTable columns={columns} rows={rows} onApply={vi.fn()} />);
		for (const label of ["Keep", "Add", "Remove"] as const) {
			const marker = screen.getByText(label).closest("td")?.querySelector("[data-diff-marker]");
			expect(marker).toHaveAttribute("data-diff-marker");
			expect(marker).toHaveClass("size-basalt-icon-sm");
			if (label === "Keep") {
				expect(marker?.childElementCount).toBe(0);
			} else {
				expect(marker?.querySelector("svg")).toBeTruthy();
			}
		}
	});

	it("handles no changes, disabled application and absent cells", () => {
		const { rerender } = render(<DiffTable columns={columns} rows={[]} onApply={vi.fn()} />);
		expect(screen.getByRole("status")).toHaveTextContent("No proposed changes");
		expect(screen.getByRole("status").closest("td")).toHaveClass(
			"ps-basalt-table-edge",
			"pe-basalt-table-edge",
		);
		expect(screen.getByRole("button", { name: "Apply 0 changes" })).toBeDisabled();
		rerender(
			<DiffTable
				columns={[{ id: "missing", label: "Missing" }]}
				rows={[rows[0]]}
				disabled
				onApply={vi.fn()}
			/>,
		);
		expect(screen.getByRole("cell", { name: "—" })).toBeInTheDocument();
		expect(screen.getByRole("checkbox")).toBeDisabled();
	});
});
