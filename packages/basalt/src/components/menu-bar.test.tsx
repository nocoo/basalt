import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	MenuBar,
	MenuBarContent,
	MenuBarItem,
	MenuBarMenu,
	MenuBarRoot,
	MenuBarTrigger,
} from "./menu-bar";

describe("MenuBar", () => {
	it("renders a trigger", () => {
		render(
			<MenuBarRoot>
				<MenuBarMenu>
					<MenuBarTrigger>File</MenuBarTrigger>
				</MenuBarMenu>
			</MenuBarRoot>,
		);
		expect(screen.getByText("File")).toBeInTheDocument();
	});

	it("renders the root menubar", () => {
		render(
			<MenuBar>
				<MenuBarMenu>
					<MenuBarTrigger>File</MenuBarTrigger>
					<MenuBarContent forceMount sideOffset={8}>
						<MenuBarItem>New</MenuBarItem>
					</MenuBarContent>
				</MenuBarMenu>
			</MenuBar>,
		);
		expect(screen.getByRole("menubar")).toBeInTheDocument();
		expect(screen.getByText("File")).toBeInTheDocument();
	});
});
