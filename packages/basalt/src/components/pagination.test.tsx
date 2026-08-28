import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination", () => {
	it("shows the current page", () => {
		render(<Pagination page={2} pageCount={5} />);
		expect(screen.getByText("2 / 5")).toBeInTheDocument();
	});

	it("moves to the previous and next pages", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Previous" }));
		expect(onPageChange).toHaveBeenCalledWith(1);
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("hides the page caption in simple mode", () => {
		render(<Pagination page={2} pageCount={5} simple />);
		expect(screen.queryByText("2 / 5")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
	});

	it("clamps at the edges", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={1} pageCount={1} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Previous" }));
		expect(onPageChange).toHaveBeenCalledWith(1);
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(onPageChange).toHaveBeenCalledWith(1);
	});
});
