import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MenuBarMenu, MenuBarRoot, MenuBarTrigger } from "./menu-bar";

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
});
