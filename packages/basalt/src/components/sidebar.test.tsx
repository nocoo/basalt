import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	ContentIsland,
	Sidebar,
	SidebarGroup,
	SidebarIconItem,
	SidebarItem,
	SidebarProvider,
	SidebarSearch,
	SidebarUser,
	useSidebar,
} from "./sidebar";

describe("Sidebar", () => {
	it("renders children on the L0 chrome", () => {
		render(<Sidebar>Nav</Sidebar>);
		const nav = screen.getByText("Nav");
		expect(nav.tagName).toBe("ASIDE");
		expect(nav.className).toContain("bg-basalt-background");
		expect(nav.className).not.toContain("border-r");
	});

	it("uses provider collapsed and side", () => {
		render(
			<SidebarProvider defaultCollapsed side="right">
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const nav = screen.getByText("Nav");
		expect(nav.className).toContain("w-[68px]");
		expect(nav).toHaveAttribute("data-side", "right");
	});

	it("expands a collapsed rail on peek hover", () => {
		render(
			<SidebarProvider defaultCollapsed peek>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const nav = screen.getByText("Nav");
		expect(nav.className).toContain("w-[68px]");
		fireEvent.mouseEnter(nav);
		expect(nav).not.toHaveAttribute("data-collapsed");
		fireEvent.mouseLeave(nav);
		expect(nav).toHaveAttribute("data-collapsed");
	});

	it("shows loading placeholders", () => {
		render(
			<SidebarProvider loading>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.queryByText("Nav")).not.toBeInTheDocument();
	});

	it("keeps a controlled collapsed value", () => {
		const onCollapsedChange = vi.fn();
		function Toggle() {
			const { collapsed, setCollapsed } = useSidebar();
			return (
				<button type="button" onClick={() => setCollapsed(!collapsed)}>
					Toggle
				</button>
			);
		}
		render(
			<SidebarProvider collapsed onCollapsedChange={onCollapsedChange}>
				<Toggle />
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByText("Nav").className).toContain("w-[68px]");
		fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
		expect(onCollapsedChange).toHaveBeenCalledWith(false);
		expect(screen.getByText("Nav").className).toContain("w-[68px]");
	});

	it("throws useSidebar outside a provider", () => {
		expect(() => render(<Sidebar>Nav</Sidebar>)).not.toThrow();
		expect(() => {
			function Probe() {
				useSidebar();
				return null;
			}
			render(<Probe />);
		}).toThrow(/SidebarProvider/);
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
