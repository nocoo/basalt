import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TablePager } from "./table-pager";

describe("TablePager", () => {
	it("shows a middle-page default range and reports the next page", () => {
		const onPageChange = vi.fn();
		render(<TablePager page={2} pageSize={10} totalCount={50} onPageChange={onPageChange} />);

		expect(screen.getByText("Showing 11–20 of 50")).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("2");
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("clamps a partial last page end to totalCount", () => {
		render(<TablePager page={3} pageSize={10} totalCount={25} onPageChange={() => {}} />);
		expect(screen.getByText("Showing 21–25 of 25")).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("3");
	});

	it("shows No results for an empty set", () => {
		const onPageChange = vi.fn();
		render(<TablePager page={1} pageSize={10} totalCount={0} onPageChange={onPageChange} />);
		expect(screen.getByText("No results")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("clamps an out-of-range page for display without correcting the caller", () => {
		const onPageChange = vi.fn();
		render(<TablePager page={99} pageSize={10} totalCount={25} onPageChange={onPageChange} />);
		expect(screen.getByText("Showing 21–25 of 25")).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("3");
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("renders a custom ReactNode range formatter", () => {
		render(
			<TablePager
				page={1}
				pageSize={10}
				totalCount={40}
				onPageChange={() => {}}
				formatRange={({ start, end, totalCount }) => (
					<strong>
						{start}/{end}/{totalCount}
					</strong>
				)}
			/>,
		);
		expect(screen.getByText("1/10/40").tagName).toBe("STRONG");
		expect(screen.queryByText("No results")).not.toBeInTheDocument();
		expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
	});

	it("stacks range and controls on small screens", () => {
		const { container } = render(
			<TablePager page={1} pageSize={10} totalCount={20} onPageChange={() => {}} />,
		);
		expect(container.firstElementChild?.className.split(/\s+/)).toEqual(
			expect.arrayContaining([
				"flex",
				"flex-col",
				"gap-3",
				"md:flex-row",
				"md:items-center",
				"md:justify-between",
			]),
		);
	});

	it("keeps the range visible and disables every control when disabled", () => {
		const onPageChange = vi.fn();
		render(
			<TablePager page={2} pageSize={10} totalCount={50} disabled onPageChange={onPageChange} />,
		);
		expect(screen.getByText("Showing 11–20 of 50")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(onPageChange).not.toHaveBeenCalled();
	});
});
