import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Pagination } from "./pagination";

describe("Pagination", () => {
	it("moves an uncontrolled pager from defaultPage and forwards ref", () => {
		const ref = createRef<HTMLElement>();
		render(<Pagination ref={ref} defaultPage={2} pageCount={5} />);
		const nav = screen.getByRole("navigation", { name: "Pagination" });
		expect(ref.current).toBe(nav);
		expect(nav).toHaveAttribute("data-slot", "pagination");
		expect(nav).toHaveTextContent("2");
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(nav).toHaveTextContent("3");
	});

	it("shows the current page with shared control surface classes", () => {
		render(<Pagination page={2} pageCount={5} />);
		expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("2");
		const group = screen.getByRole("navigation", { name: "Pagination" }).firstElementChild;
		expect(group?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(group?.className.split(/\s+/)).toContain("min-h-basalt-control");
		expect(group?.className).not.toContain("bg-basalt-background");
		expect(group?.className).not.toContain("rounded-basalt-lg");
		expect(group?.className).not.toContain("ring-1");
		const previous = screen.getByRole("button", { name: "Previous page" });
		expect(previous.className.split(/\s+/)).toEqual(
			expect.arrayContaining([
				"bg-transparent",
				"hover:bg-basalt-hover",
				"focus-visible:bg-basalt-hover",
				"active:bg-basalt-hover",
			]),
		);
	});

	it("does not clip the keyboard focus ring", () => {
		render(<Pagination page={2} pageCount={5} />);
		const group = screen.getByRole("navigation", { name: "Pagination" }).firstElementChild;
		expect(group?.className).not.toContain("overflow-hidden");
	});

	it("moves to the previous and next pages", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
		expect(onPageChange).toHaveBeenCalledWith(1);
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("jumps to the first and last pages", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={3} pageCount={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByRole("button", { name: "First page" }));
		expect(onPageChange).toHaveBeenCalledWith(1);
		fireEvent.click(screen.getByRole("button", { name: "Last page" }));
		expect(onPageChange).toHaveBeenCalledWith(5);
	});

	it("hides first, last, and page number in simple mode", () => {
		render(<Pagination page={2} pageCount={5} simple />);
		expect(screen.getByRole("navigation", { name: "Pagination" })).not.toHaveTextContent("2");
		expect(screen.queryByRole("button", { name: "First page" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Last page" })).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument();
	});

	it("disables controls at the edges", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={1} pageCount={1} onPageChange={onPageChange} />);
		expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("disables every control when disabled without changing default visuals", () => {
		const onPageChange = vi.fn();
		render(<Pagination page={3} pageCount={5} disabled onPageChange={onPageChange} />);
		expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("3");
		expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "First page" }));
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("renders clickable numbered pages with active neutral selection and ellipsis truncation", () => {
		const onPageChange = vi.fn();
		const { rerender } = render(
			<Pagination page={6} pageCount={12} showPageNumbers onPageChange={onPageChange} />,
		);

		const current = screen.getByRole("button", { name: "Page 6" });
		expect(current).toHaveAttribute("aria-current", "page");
		expect(current).toHaveClass("basalt-choice");

		fireEvent.click(current);
		expect(onPageChange).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "Page 5" }));
		expect(onPageChange).toHaveBeenCalledWith(5);

		expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Page 12" })).toBeInTheDocument();

		rerender(<Pagination page={2} pageCount={12} showPageNumbers siblingCount={1} />);
		expect(
			Array.from(screen.getByRole("navigation").querySelectorAll("button"))
				.map((el) => el.getAttribute("aria-label"))
				.filter((label) => label?.startsWith("Page ")),
		).toEqual(["Page 1", "Page 2", "Page 3", "Page 4", "Page 5", "Page 12"]);

		rerender(<Pagination page={11} pageCount={12} showPageNumbers siblingCount={1} />);
		expect(
			Array.from(screen.getByRole("navigation").querySelectorAll("button"))
				.map((el) => el.getAttribute("aria-label"))
				.filter((label) => label?.startsWith("Page ")),
		).toEqual(["Page 1", "Page 8", "Page 9", "Page 10", "Page 11", "Page 12"]);

		rerender(<Pagination page={6} pageCount={12} showPageNumbers siblingCount={1} />);
		expect(
			Array.from(screen.getByRole("navigation").querySelectorAll("button"))
				.map((el) => el.getAttribute("aria-label"))
				.filter((label) => label?.startsWith("Page ")),
		).toEqual(["Page 1", "Page 5", "Page 6", "Page 7", "Page 12"]);

		rerender(<Pagination page={2} pageCount={5} showPageNumbers siblingCount={1} />);
		expect(
			Array.from(screen.getByRole("navigation").querySelectorAll("button"))
				.map((el) => el.getAttribute("aria-label"))
				.filter((label) => label?.startsWith("Page ")),
		).toEqual(["Page 1", "Page 2", "Page 3", "Page 4", "Page 5"]);
	});
});
