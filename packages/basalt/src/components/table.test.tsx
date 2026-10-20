import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
	TableSortableHeader,
} from "./table";

describe("Table", () => {
	it("renders a native table with caption", () => {
		render(
			<Table>
				<TableCaption>Roster</TableCaption>
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
		expect(screen.getByRole("table", { name: "Roster" }).tagName).toBe("TABLE");
		expect(screen.getByRole("columnheader", { name: "Name" }).tagName).toBe("TH");
		expect(screen.getByRole("cell", { name: "Atlas" }).tagName).toBe("TD");
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveClass("relative");
		expect(screen.getByRole("cell", { name: "Atlas" })).toHaveClass("relative");
		const caption = screen.getByText("Roster");
		expect(caption.tagName).toBe("CAPTION");
		expect(caption).toHaveClass("px-basalt-panel-x", "py-basalt-panel-y", "text-basalt-base");
		expect(caption.className).not.toMatch(/mt-basalt-space-lg/);
		expect(caption.className).not.toMatch(/\btext-start\b|\btext-end\b|\btext-center\b/);
	});

	it("renders a footer row", () => {
		render(
			<Table>
				<TableFooter>
					<TableRow>
						<TableCell>Total</TableCell>
					</TableRow>
				</TableFooter>
			</Table>,
		);
		expect(screen.getByText("Total").closest("tfoot")).toBeTruthy();
	});

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

	it("styles a header bar without a recessed fill", () => {
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
						<TableCell>Report 1</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Report 2</TableCell>
						<TableCell>Paused</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByRole("table")).toHaveAttribute("data-basalt-table");
		expect(screen.getByText("Name")).toHaveClass("font-medium", "tracking-[0.04em]");
		expect(screen.getByRole("table")).not.toHaveAttribute("data-striped");
		expect(screen.getByText("Name").className).toContain("text-basalt-muted-foreground");
		expect(screen.getByText("Name").className).not.toContain("bg-basalt-card");
	});

	it("opts into striping without forwarding a non-native prop", () => {
		const { rerender } = render(<Table striped aria-label="Striped" />);
		expect(screen.getByRole("table")).toHaveAttribute("data-striped", "true");
		expect(screen.getByRole("table")).not.toHaveAttribute("striped");
		rerender(<Table striped={false} aria-label="Plain" />);
		expect(screen.getByRole("table")).not.toHaveAttribute("data-striped");
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
		expect(screen.getByText("Selected").closest("tr")).toHaveAttribute("aria-selected", "true");
	});

	it("keeps default cells on table-x without inferring card rails", () => {
		render(
			<Table>
				<TableBody>
					<TableRow>
						<TableCell>Inset</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByRole("table")).not.toHaveAttribute("data-basalt-table-edge");
		expect(screen.getByRole("cell", { name: "Inset" })).toHaveClass(
			"ps-basalt-table-x",
			"pe-basalt-table-x",
		);
		expect(screen.getByRole("cell", { name: "Inset" }).className).not.toMatch(
			/\bps-basalt-table-edge\b/,
		);
	});

	it("marks authored start and end rails without tagging rowspan continuations", () => {
		render(
			<Table>
				<TableBody>
					<TableRow>
						<TableCell className="ps-basalt-table-edge" rowSpan={2}>
							North
						</TableCell>
						<TableCell className="pe-basalt-table-edge">Alpha</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="pe-basalt-table-edge">Beta</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="ps-basalt-table-edge pe-basalt-table-edge" colSpan={2}>
							Nested
							<Table>
								<TableBody>
									<TableRow>
										<TableCell>Child</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByRole("cell", { name: "North" })).toHaveClass("ps-basalt-table-edge");
		expect(screen.getByRole("cell", { name: "North" }).className).not.toMatch(
			/\bpe-basalt-table-edge\b/,
		);
		expect(screen.getByRole("cell", { name: "Beta" })).toHaveClass("pe-basalt-table-edge");
		expect(screen.getByRole("cell", { name: "Beta" }).className).not.toMatch(
			/\bps-basalt-table-edge\b/,
		);
		expect(screen.getByRole("cell", { name: /^Nested/ })).toHaveClass(
			"ps-basalt-table-edge",
			"pe-basalt-table-edge",
		);
		expect(screen.getByRole("cell", { name: "Child" })).toHaveClass(
			"ps-basalt-table-x",
			"pe-basalt-table-x",
		);
		expect(screen.getByRole("cell", { name: "Child" }).className).not.toMatch(/basalt-table-edge/);
	});

	it("lets omitted cells inherit parent alignment", () => {
		render(
			<Table className="text-end">
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>Inherited</TableCell>
						<TableCell textAlign="start">Explicit start</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		const inherited = screen.getByRole("cell", { name: "Inherited" });
		expect(inherited.className).not.toMatch(/\btext-start\b/);
		expect(inherited.className).not.toMatch(/\btext-end\b/);
		expect(inherited).not.toHaveAttribute("align");
		expect(screen.getByRole("cell", { name: "Explicit start" })).toHaveClass("text-start");
		expect(screen.getByRole("cell", { name: "Explicit start" })).not.toHaveAttribute("align");
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveClass("text-start");
	});

	it("keeps native HTML align and applies logical textAlign separately", () => {
		render(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead align="right">Native head</TableHead>
						<TableHead textAlign="end">Logical head</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell align="right">Native</TableCell>
						<TableCell textAlign="end">Logical</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByRole("columnheader", { name: "Native head" })).toHaveAttribute(
			"align",
			"right",
		);
		expect(screen.getByRole("columnheader", { name: "Native head" }).className).not.toMatch(
			/\btext-start\b/,
		);
		expect(screen.getByRole("columnheader", { name: "Logical head" })).toHaveClass("text-end");
		expect(screen.getByRole("cell", { name: "Native" })).toHaveAttribute("align", "right");
		expect(screen.getByRole("cell", { name: "Native" }).className).not.toMatch(/\btext-end\b/);
		expect(screen.getByRole("cell", { name: "Logical" })).toHaveClass("text-end", "tabular-nums");
		expect(screen.getByRole("cell", { name: "Logical" })).not.toHaveAttribute("align");
	});

	it("aligns numeric headers and cells to the end", () => {
		render(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead textAlign="end">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>Atlas</TableCell>
						<TableCell textAlign="end">$12</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		);
		expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveClass(
			"text-end",
			"tabular-nums",
		);
		expect(screen.getByRole("cell", { name: "$12" })).toHaveClass("text-end", "tabular-nums");
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveClass("text-start");
		expect(screen.getByRole("cell", { name: "Atlas" }).className).not.toMatch(/\btext-start\b/);
	});

	it("renders a flush sortable header and keeps sort callbacks", () => {
		const onClick = vi.fn();
		const ref = { current: null as HTMLButtonElement | null };
		render(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead aria-sort="none">
							<TableSortableHeader ref={ref} onClick={onClick}>
								Plan
							</TableSortableHeader>
						</TableHead>
					</TableRow>
				</TableHeader>
			</Table>,
		);
		const button = screen.getByRole("button", { name: "Plan" });
		expect(button).toHaveClass("p-0", "border-0", "text-start");
		expect(button.className).not.toContain("basalt-action");
		expect(button.querySelector("svg")).toHaveClass("size-basalt-icon-sm");
		expect(button.querySelector("svg")).not.toHaveClass("ms-auto", "ml-auto");
		expect(button).toHaveClass("gap-basalt-space-sm");
		expect(ref.current).toBe(button);
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("places the sort icon inward of an end-aligned label in LTR and RTL", () => {
		const { rerender } = render(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead textAlign="end" aria-sort="ascending">
							<TableSortableHeader textAlign="end" sorted="asc">
								Amount
							</TableSortableHeader>
						</TableHead>
					</TableRow>
				</TableHeader>
			</Table>,
		);
		let button = screen.getByRole("button", { name: "Amount" });
		expect(button).toHaveClass("justify-end", "text-end", "gap-basalt-space-sm");
		expect(button.firstElementChild?.tagName).toBe("svg");
		expect(button.firstElementChild).not.toHaveClass("ms-auto");
		expect(button.textContent).toBe("Amount");
		rerender(
			<Table dir="rtl">
				<TableHeader>
					<TableRow>
						<TableHead textAlign="end" aria-sort="ascending">
							<TableSortableHeader textAlign="end" sorted="asc">
								Amount
							</TableSortableHeader>
						</TableHead>
					</TableRow>
				</TableHeader>
			</Table>,
		);
		button = screen.getByRole("button", { name: "Amount" });
		expect(button).toHaveClass("justify-end", "text-end");
		expect(button.firstElementChild?.tagName).toBe("svg");
		expect(button.querySelector("svg")).not.toHaveClass("ml-auto");
		expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveClass("text-end");
	});
});
