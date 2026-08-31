import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Pagination } from "./pagination";

describe("Pagination", () => {
	it("shows the current page", () => {
		render(<Pagination page={2} pageCount={5} />);
		expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("2");
		const group = screen.getByRole("navigation", { name: "Pagination" }).firstElementChild;
		expect(group?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(group?.className.split(/\s+/)).toContain("h-9");
		expect(group?.className).not.toContain("bg-basalt-background");
		expect(group?.className).not.toContain("rounded-basalt-lg");
		expect(group?.className).not.toContain("ring-1");
		const previous = screen.getByRole("button", { name: "Previous page" });
		expect(previous.className.split(/\s+/)).toEqual(
			expect.arrayContaining([
				"bg-transparent",
				"hover:bg-basalt-accent",
				"focus-visible:bg-basalt-accent",
				"active:bg-basalt-accent",
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
});
