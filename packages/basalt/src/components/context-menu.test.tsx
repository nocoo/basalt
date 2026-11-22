import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "./context-menu";

describe("ContextMenu", () => {
	it("renders a trigger", () => {
		render(
			<ContextMenu>
				<ContextMenuTrigger>Right click</ContextMenuTrigger>
			</ContextMenu>,
		);
		expect(screen.getByText("Right click")).toBeInTheDocument();
	});

	it("opens stylized ContextMenuContent with groups, checkables, submenus, shortcuts, and destructive items", () => {
		const onCheckedChange = vi.fn();
		const onValueChange = vi.fn();
		render(
			<ContextMenu>
				<ContextMenuTrigger>Surface</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuLabel inset>Selection</ContextMenuLabel>
					<ContextMenuGroup>
						<ContextMenuItem>
							Inspect <ContextMenuShortcut>⌘I</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
							Wrap lines
						</ContextMenuCheckboxItem>
					</ContextMenuGroup>
					<ContextMenuSeparator />
					<ContextMenuRadioGroup value="compact" onValueChange={onValueChange}>
						<ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
						<ContextMenuRadioItem value="relaxed">Relaxed</ContextMenuRadioItem>
					</ContextMenuRadioGroup>
					<ContextMenuSub open>
						<ContextMenuSubTrigger>Export</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<ContextMenuItem>CSV</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuItem variant="destructive">Remove</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>,
		);

		fireEvent.contextMenu(screen.getByText("Surface"));
		const panel = screen.getAllByRole("menu")[0];
		expect(panel).toHaveAttribute("data-slot", "context-menu-content");
		expect(panel).toHaveClass("basalt-hover-list");
		expect(screen.getByRole("menuitem", { name: "CSV" }).closest('[role="menu"]')).toHaveAttribute(
			"data-slot",
			"context-menu-sub-content",
		);
		expect(screen.getByText("⌘I")).toHaveAttribute("data-slot", "context-menu-shortcut");
		expect(screen.getByRole("menuitem", { name: "CSV" })).toBeInTheDocument();
		expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveAttribute(
			"data-variant",
			"destructive",
		);

		fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Wrap lines" }));
		expect(onCheckedChange).toHaveBeenCalledWith(true);

		fireEvent.contextMenu(screen.getByText("Surface"));
		fireEvent.click(screen.getByRole("menuitemradio", { name: "Relaxed" }));
		expect(onValueChange).toHaveBeenCalledWith("relaxed");
	});
});
