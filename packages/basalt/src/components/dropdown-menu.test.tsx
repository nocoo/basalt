import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DropdownMenu, DropdownMenuTrigger } from "./dropdown-menu";

describe("DropdownMenu", () => {
	it("renders a trigger", () => {
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
			</DropdownMenu>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});
});
