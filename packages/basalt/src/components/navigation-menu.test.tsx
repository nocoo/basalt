import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "./navigation-menu";

describe("NavigationMenu", () => {
	it("renders a link", () => {
		render(
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>,
		);
		expect(screen.getByText("Docs")).toBeInTheDocument();
	});
});
