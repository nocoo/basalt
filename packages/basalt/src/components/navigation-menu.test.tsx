import { render, screen } from "@testing-library/react";
import { createRef } from "react";
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
	it("shares navigation geometry, selection and the hover layer with sidebar lists", () => {
		const ref = createRef<HTMLUListElement>();
		render(
			<NavigationMenu orientation="vertical">
				<NavigationMenuList ref={ref} className="custom-list">
					<NavigationMenuItem>
						<NavigationMenuLink href="#docs" active>
							Docs
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>,
		);
		expect(ref.current).toHaveClass("basalt-hover-list", "p-basalt-nav-inset", "custom-list");
		expect(ref.current).toHaveAttribute("data-orientation", "vertical");
		expect(screen.getByRole("link")).toHaveAttribute("data-hover-selected", "true");
		expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("link")).toHaveClass("basalt-nav-item", "px-basalt-row-x");
	});
});
