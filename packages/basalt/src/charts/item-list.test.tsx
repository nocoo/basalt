import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemList } from "./item-list";

describe("ItemList", () => {
	it("renders items with default ariaLabel and handles value presence and omission", () => {
		render(
			<ItemList
				items={[
					{ id: "1", label: "CPU", value: "45%" },
					{ label: "Memory" }, // no id and no value
				]}
			/>,
		);
		const list = screen.getByRole("list", { name: "Item list" });
		expect(list).toBeInTheDocument();
		expect(screen.getByText("CPU")).toBeInTheDocument();
		expect(screen.getByText("45%")).toBeInTheDocument();
		expect(screen.getByText("Memory")).toBeInTheDocument();
		expect(screen.queryByText("undefined")).toBeNull();
	});

	it("renders with custom ariaLabel and className", () => {
		const { container } = render(
			<ItemList
				items={[{ label: "Disk", value: "100GB" }]}
				ariaLabel="Resource stats"
				className="custom-list-class"
			/>,
		);
		expect(screen.getByRole("list", { name: "Resource stats" })).toBeInTheDocument();
		expect(container.querySelector(".custom-list-class")).toBeInTheDocument();
	});
});
