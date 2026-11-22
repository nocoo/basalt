import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
	it("renders a trigger", () => {
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
			</DropdownMenu>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});

	it("skips a disabled item", () => {
		const onSelect = vi.fn();
		render(
			<DropdownMenu defaultOpen>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem disabled onSelect={onSelect}>
						Delete
					</DropdownMenuItem>
					<DropdownMenuItem>Copy</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		fireEvent.click(screen.getByText("Delete"));
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("renders labels, separators, shortcuts, destructive items, checkables, and submenus", () => {
		const onCheckedChange = vi.fn();
		const onValueChange = vi.fn();
		render(
			<DropdownMenu open>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel inset>Actions</DropdownMenuLabel>
					<DropdownMenuGroup>
						<DropdownMenuItem inset>
							Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuCheckboxItem checked onCheckedChange={onCheckedChange}>
							Pin to sidebar
						</DropdownMenuCheckboxItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup value="grid" onValueChange={onValueChange}>
						<DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger inset>Share</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem>Copy link</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);

		expect(screen.getByText("Actions")).toHaveClass(
			"ps-[calc(var(--basalt-space-menu-x)+var(--basalt-size-icon-sm)+var(--basalt-space-row-gap))]",
		);
		expect(screen.getByText("⌘D")).toHaveAttribute("data-slot", "dropdown-menu-shortcut");
		const pin = screen.getByRole("menuitemcheckbox", { name: "Pin to sidebar" });
		expect(pin).toHaveAttribute("aria-checked", "true");
		fireEvent.click(pin);
		expect(onCheckedChange).toHaveBeenCalledWith(false);

		fireEvent.click(screen.getByRole("menuitemradio", { name: "List" }));
		expect(onValueChange).toHaveBeenCalledWith("list");

		expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeInTheDocument();
		const del = screen.getByRole("menuitem", { name: "Delete" });
		expect(del).toHaveAttribute("data-variant", "destructive");
		expect(del.className).toContain("text-basalt-danger");
	});
});
