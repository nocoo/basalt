import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toolbar } from "./toolbar";

describe("Toolbar", () => {
	it("renders a grouped toolbar", () => {
		render(<Toolbar>Tools</Toolbar>);
		expect(screen.getByRole("toolbar")).toHaveTextContent("Tools");
		expect(screen.getByRole("toolbar").className).toContain("ring-1");
	});

	it("joins an input and icon buttons with shared borders", () => {
		render(
			<Toolbar className="w-full max-w-md">
				<Toolbar.Input aria-label="Query" placeholder="Search..." className="flex-1" />
				<Toolbar.Button aria-label="Search" icon={<span>+</span>} />
				<Toolbar.Button aria-label="Add">+</Toolbar.Button>
			</Toolbar>,
		);
		const toolbar = screen.getByRole("toolbar");
		expect(toolbar.className).toContain("[&>*:not(:first-child)]:border-l");
		expect(toolbar.className).not.toContain("overflow-hidden");
		expect(screen.getByPlaceholderText("Search...")).toHaveClass("border-0");
		expect(screen.getByPlaceholderText("Search...").className).toContain(
			"first:rounded-l-basalt-md",
		);
		expect(screen.getByRole("button", { name: "Search" }).className).toContain("w-9");
		expect(screen.getByRole("button", { name: "Add" }).className).not.toContain("w-9");
	});

	it("keeps toolbar buttons quiet and clickable", () => {
		const onClick = vi.fn();
		render(
			<Toolbar>
				<Toolbar.Button onClick={onClick}>Save</Toolbar.Button>
			</Toolbar>,
		);
		const button = screen.getByRole("button", { name: "Save" });
		expect(button.className).toContain("hover:bg-basalt-accent");
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});
});
