import { fireEvent, render, screen } from "@testing-library/react";
import { type RefObject, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	ContentIsland,
	Sidebar,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarIconItem,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
	SidebarSearch,
	SidebarUser,
	useSidebar,
} from "./sidebar";

describe("Sidebar", () => {
	it("owns one inset boundary across top-level rows, groups and collapsed chrome", () => {
		render(
			<Sidebar collapsed>
				<SidebarHeader>Header</SidebarHeader>
				<SidebarNav aria-label="Workspace">
					<SidebarItem>Home</SidebarItem>
					<SidebarGroup label="Recent">
						<SidebarItem>Report</SidebarItem>
					</SidebarGroup>
				</SidebarNav>
				<SidebarFooter>Footer</SidebarFooter>
			</Sidebar>,
		);
		expect(screen.getByRole("navigation")).toHaveClass("basalt-hover-list", "p-basalt-nav-inset");
		for (const name of ["Home", "Report"]) {
			expect(screen.getByRole("button", { name })).toHaveClass(
				"px-basalt-row-x",
				"py-basalt-row-y",
			);
			expect(screen.getByRole("button", { name })).toHaveAttribute("data-basalt-hover-item");
		}
		const group = screen.getByRole("button", { name: "Recent" });
		expect(group).not.toHaveAttribute("data-basalt-hover-item");
		expect(group).toHaveClass("uppercase", "font-semibold", "text-basalt-xs", "py-basalt-space-lg");
		expect(group.closest('[data-slot="sidebar-group"]')).toHaveClass("pt-basalt-layout-sm");
		expect(screen.getByRole("button", { name: "Home" })).toHaveClass("focus-visible:ring-inset");
		expect(screen.getByText("Header")).toHaveClass("px-basalt-nav-inset");
		expect(screen.getByText("Footer")).toHaveClass("px-basalt-nav-inset");
	});
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
		expect(nav.className).toContain("w-basalt-rail");
		expect(nav).toHaveAttribute("data-side", "right");
	});

	it("expands a collapsed rail on peek hover", () => {
		render(
			<SidebarProvider defaultCollapsed peek>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const nav = screen.getByText("Nav");
		expect(nav.className).toContain("w-basalt-rail");
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
		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByRole("status").closest("aside")).toHaveAttribute("aria-busy");
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
		expect(screen.getByText("Nav").className).toContain("w-basalt-rail");
		fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
		expect(onCollapsedChange).toHaveBeenCalledWith(false);
		expect(screen.getByText("Nav").className).toContain("w-basalt-rail");
	});

	it("renders overlay chrome at the overlay layer", () => {
		render(
			<SidebarProvider overlay defaultWidth={300}>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const nav = screen.getByRole("dialog", { name: "Sidebar" });
		expect(nav).toHaveAttribute("data-overlay");
		expect(nav.className).toContain("fixed");
		expect(nav.className).toContain("z-50");
		expect(nav).toHaveStyle({ width: "300px" });
	});

	it("hides overlay chrome when collapsed", () => {
		render(
			<SidebarProvider overlay defaultCollapsed>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.queryByText("Nav")).not.toBeInTheDocument();
	});

	it("forwards overlay hover and restores focus on close", () => {
		const onMouseEnter = vi.fn();
		function Toggle() {
			const { setCollapsed } = useSidebar();
			return (
				<button type="button" onClick={() => setCollapsed(false)}>
					Open
				</button>
			);
		}
		render(
			<SidebarProvider overlay defaultCollapsed>
				<Toggle />
				<Sidebar onMouseEnter={onMouseEnter}>Nav</Sidebar>
			</SidebarProvider>,
		);
		const open = screen.getByRole("button", { name: "Open" });
		open.focus();
		fireEvent.click(open);
		const panel = screen.getByRole("dialog", { name: "Sidebar" });
		fireEvent.mouseEnter(panel);
		expect(onMouseEnter).toHaveBeenCalled();
		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("captures focus when overlay is enabled while expanded", () => {
		let lastFocus: RefObject<HTMLElement | null> | undefined;
		function Probe() {
			const [overlay, setOverlay] = useState(false);
			function Read() {
				lastFocus = useSidebar().lastFocusRef;
				return null;
			}
			return (
				<SidebarProvider overlay={overlay}>
					<Read />
					<button type="button" onClick={() => setOverlay(true)}>
						Focus
					</button>
					<Sidebar>Nav</Sidebar>
				</SidebarProvider>
			);
		}
		render(<Probe />);
		const trigger = screen.getByRole("button", { name: "Focus" });
		trigger.focus();
		fireEvent.click(trigger);
		expect(screen.getByRole("dialog", { name: "Sidebar" })).toBeInTheDocument();
		expect(lastFocus?.current).toBe(trigger);
	});

	it("places overlay chrome on the right edge", () => {
		render(
			<SidebarProvider overlay side="right">
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByRole("dialog", { name: "Sidebar" }).className).toContain("right-0");
	});

	it("places an in-flow rail last when side is right", () => {
		render(
			<SidebarProvider side="right">
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByText("Nav").className).toContain("order-last");
	});

	it("clamps default width to the resize range", () => {
		const { unmount } = render(
			<SidebarProvider defaultWidth={80}>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByText("Nav")).toHaveStyle({ width: "180px" });
		expect(screen.getByRole("separator", { name: "Resize sidebar" })).toHaveAttribute(
			"aria-valuenow",
			"180",
		);
		unmount();
		render(
			<SidebarProvider defaultWidth={520}>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByText("Nav")).toHaveStyle({ width: "400px" });
	});

	it("resizes the expanded rail from the handle", () => {
		HTMLElement.prototype.setPointerCapture = vi.fn();
		render(
			<SidebarProvider defaultWidth={260}>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const handle = screen.getByRole("separator", { name: "Resize sidebar" });
		fireEvent.pointerDown(handle, { clientX: 260, pointerId: 1 });
		fireEvent.pointerMove(handle, { clientX: 320 });
		expect(screen.getByText("Nav")).toHaveStyle({ width: "320px" });
		fireEvent.pointerUp(handle);
	});

	it("shrinks a right-side rail with arrows and clamps width", () => {
		HTMLElement.prototype.setPointerCapture = vi.fn();
		render(
			<SidebarProvider side="right" defaultWidth={260}>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const handle = screen.getByRole("separator", { name: "Resize sidebar" });
		expect(handle.className).toContain("left-0");
		fireEvent.keyDown(handle, { key: "ArrowRight" });
		expect(screen.getByText("Nav")).toHaveStyle({ width: "252px" });
		fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1 });
		fireEvent.pointerMove(handle, { clientX: 500 });
		expect(Number.parseFloat(screen.getByText("Nav").style.width)).toBeLessThanOrEqual(400);
	});

	it("resizes the rail with arrow keys", () => {
		render(
			<SidebarProvider defaultWidth={260}>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const handle = screen.getByRole("separator", { name: "Resize sidebar" });
		fireEvent.keyDown(handle, { key: "ArrowRight" });
		expect(screen.getByText("Nav")).toHaveStyle({ width: "268px" });
		fireEvent.keyDown(handle, { key: "ArrowLeft" });
		expect(screen.getByText("Nav")).toHaveStyle({ width: "260px" });
		fireEvent.keyDown(handle, { key: "Home" });
		expect(screen.getByText("Nav")).toHaveStyle({ width: "260px" });
	});

	it("clears resize listeners on cancel", () => {
		HTMLElement.prototype.setPointerCapture = vi.fn();
		render(
			<SidebarProvider defaultWidth={260}>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		const handle = screen.getByRole("separator", { name: "Resize sidebar" });
		fireEvent.pointerDown(handle, { clientX: 260, pointerId: 1 });
		fireEvent.pointerCancel(handle);
		fireEvent.pointerMove(handle, { clientX: 320 });
		expect(screen.getByText("Nav")).toHaveStyle({ width: "260px" });
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
		expect(screen.getByText("Nav").className).toContain("w-basalt-rail");
	});

	it("marks the active item", () => {
		render(<SidebarItem active>Dashboard</SidebarItem>);
		expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute(
			"data-hover-selected",
			"true",
		);
		expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute(
			"aria-current",
			"page",
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
		expect(button).toHaveAttribute("data-hover-selected", "false");
		expect(button).toHaveAttribute("data-basalt-hover-item");
		rerender(
			<SidebarIconItem active className="rail-item" title="Open mail">
				Mail
			</SidebarIconItem>,
		);
		expect(button).toHaveAttribute("data-hover-selected", "true");
		expect(button).toHaveAttribute("aria-current", "page");
		expect(button).toHaveClass("basalt-nav-item");
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

	it("keeps the footer pinned and contains nav overscroll", () => {
		render(
			<Sidebar>
				<SidebarNav>Items</SidebarNav>
				<SidebarFooter>User</SidebarFooter>
			</Sidebar>,
		);
		expect(screen.getByText("Items").className).toContain("overscroll-y-contain");
		expect(screen.getByText("User").className).toContain("shrink-0");
	});
});

describe("ContentIsland", () => {
	it("floats the panel with a corner shadow", () => {
		render(<ContentIsland>Body</ContentIsland>);
		const island = screen.getByText("Body");
		expect(island.className).toContain("shadow-sm");
		expect(island.className).toContain("ring-1");
		expect(island.className).toContain("ring-basalt-border/40");
		expect(island.className).toContain("rounded-basalt-lg");
		expect(island.className).toContain("md:rounded-basalt-island");
		expect(island).toHaveAttribute("data-basalt-island", "inset");
	});
	it("keeps the surface root without mobile inset chrome", () => {
		render(<ContentIsland mobileSurface="edge-to-edge">Read</ContentIsland>);
		const island = screen.getByText("Read");
		expect(island).toHaveAttribute("data-basalt-surface-root");
		expect(island).toHaveAttribute("data-basalt-island", "edge-to-edge");
		expect(island).not.toHaveAttribute("mobileSurface");
		expect(island).not.toHaveClass("p-basalt-layout-sm", "rounded-basalt-lg", "ring-1");
		expect(island).toHaveClass("md:p-basalt-layout", "md:rounded-basalt-island");
	});
});
