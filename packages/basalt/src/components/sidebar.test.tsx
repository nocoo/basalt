import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	ContentIsland,
	Sidebar,
	SidebarGroup,
	SidebarIconItem,
	SidebarItem,
	SidebarSearch,
	SidebarUser,
} from "./sidebar";

describe("Sidebar", () => {
	it("renders children on the L0 chrome", () => {
		render(<Sidebar>Nav</Sidebar>);
		const nav = screen.getByText("Nav");
		expect(nav.tagName).toBe("ASIDE");
		expect(nav.className).toContain("bg-basalt-background");
		expect(nav.className).not.toContain("border-r");
	});

	it("collapses to the icon rail", () => {
		render(<Sidebar collapsed>Nav</Sidebar>);
		expect(screen.getByText("Nav").className).toContain("w-[68px]");
	});

	it("marks the active item", () => {
		render(<SidebarItem active>Dashboard</SidebarItem>);
		expect(screen.getByRole("button", { name: "Dashboard" }).className).toContain(
			"bg-basalt-accent",
		);
	});

	it("toggles a nav group", () => {
		render(
			<SidebarGroup label="Blocks">
				<SidebarItem>Dashboard</SidebarItem>
			</SidebarGroup>,
		);
		const trigger = screen.getByRole("button", { name: "Blocks" });
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "false");
	});

	it("renders the search trigger", () => {
		render(<SidebarSearch>Search</SidebarSearch>);
		expect(screen.getByRole("button", { name: /Search/ })).toBeInTheDocument();
		expect(screen.getByText("⌘K")).toBeInTheDocument();
	});

	it("toggles SidebarIconItem inactive and active classes and forwards button props", () => {
		const { rerender } = render(
			<SidebarIconItem className="rail-item" title="Open mail">
				Mail
			</SidebarIconItem>,
		);
		const button = screen.getByRole("button", { name: "Mail" });
		expect(button).toHaveAttribute("title", "Open mail");
		expect(button).toHaveClass("rail-item");
		expect(button).toHaveClass("text-basalt-muted-foreground");
		expect(button).not.toHaveClass("text-basalt-foreground");
		rerender(
			<SidebarIconItem active className="rail-item" title="Open mail">
				Mail
			</SidebarIconItem>,
		);
		expect(button).toHaveClass("bg-basalt-accent");
		expect(button).toHaveClass("text-basalt-foreground");
		expect(button).not.toHaveClass("text-basalt-muted-foreground");
		expect(button).toHaveClass("rail-item");
	});

	it("renders SidebarUser slots and drops email when omitted", () => {
		const { rerender, container } = render(
			<SidebarUser
				name="Ada"
				email="ada@hexly.ai"
				avatar={<span>AV</span>}
				action={<button type="button">Menu</button>}
				className="user-shell"
			/>,
		);
		expect(container.firstElementChild).toHaveClass("user-shell");
		expect(screen.getByText("Ada")).toBeInTheDocument();
		expect(screen.getByText("ada@hexly.ai")).toBeInTheDocument();
		expect(screen.getByText("AV")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
		rerender(
			<SidebarUser
				name="Ada"
				avatar={<span>AV</span>}
				action={<button type="button">Menu</button>}
				className="user-shell"
			/>,
		);
		expect(screen.getByText("Ada")).toBeInTheDocument();
		expect(screen.queryByText("ada@hexly.ai")).toBeNull();
		expect(screen.getByText("AV")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
	});
});

describe("ContentIsland", () => {
	it("floats the panel with a corner shadow", () => {
		render(<ContentIsland>Body</ContentIsland>);
		const island = screen.getByText("Body");
		expect(island.className).toContain("shadow-sm");
		expect(island.className).toContain("ring-1");
		expect(island.className).toContain("ring-basalt-border/40");
		expect(island.className).toContain("rounded-[16px]");
		expect(island.className).toContain("md:rounded-basalt-island");
	});
});
