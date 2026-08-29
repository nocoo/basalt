import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

describe("Select", () => {
	it("renders a trigger", () => {
		render(
			<Select>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
			</Select>,
		);
		expect(screen.getByRole("combobox", { name: "Version" })).toBeInTheDocument();
	});

	it("opens the list below the trigger", () => {
		render(
			<Select defaultOpen>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All deployed versions</SelectItem>
					<SelectItem value="active">Active versions</SelectItem>
				</SelectContent>
			</Select>,
		);
		const list = screen.getByRole("listbox");
		expect(list).toHaveAttribute("data-side", "bottom");
		expect(list.className).toContain("py-1.5");
		expect(screen.getByRole("option", { name: "All deployed versions" }).className).toContain(
			"mx-1.5",
		);
	});

	it("keeps a closed trigger from covering the page", () => {
		render(
			<Select>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All deployed versions</SelectItem>
				</SelectContent>
			</Select>,
		);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("combobox", { name: "Version" }));
		expect(screen.getByRole("listbox")).toHaveAttribute("data-side", "bottom");
	});
});
