import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
});
