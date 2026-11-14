import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode, type RefObject, useRef, useState } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { LinkProvider } from "../providers/link";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet";
import {
	ContentIsland,
	SIDEBAR_DEFAULT_WIDTH_PX,
	Sidebar,
	SidebarBrand,
	SidebarDrawer,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarIconItem,
	type SidebarIconItemProps,
	SidebarItem,
	type SidebarItemProps,
	SidebarNav,
	SidebarProvider,
	SidebarSearch,
	SidebarToggle,
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
		expect(screen.getByRole("navigation")).toHaveClass(
			"basalt-hover-list",
			"basalt-nav-list",
			"basalt-sidebar-nav",
		);
		for (const name of ["Home", "Report"]) {
			expect(screen.getByRole("button", { name })).toHaveClass(
				"px-basalt-row-x",
				"py-basalt-space-lg",
				"[&>svg:first-child]:size-basalt-sidebar-brand-slot",
			);
			expect(screen.getByRole("button", { name })).not.toHaveClass("py-basalt-row-y");
			expect(screen.getByRole("button", { name })).toHaveAttribute("data-basalt-hover-item");
			expect(screen.getByRole("button", { name })).toHaveAttribute("data-sidebar-row");
		}
		const group = screen.getByRole("button", { name: "Recent" });
		expect(group).not.toHaveAttribute("data-basalt-hover-item");
		expect(group).toHaveClass(
			"uppercase",
			"font-semibold",
			"text-basalt-sm",
			"py-basalt-space-lg",
			"leading-basalt-row",
		);
		expect(group.closest('[data-slot="sidebar-group"]')).toHaveClass("pt-basalt-layout-sm");
		expect(screen.getByRole("button", { name: "Home" })).toHaveClass("basalt-focus-inset");
		expect(screen.getByText("Header")).toHaveClass("px-basalt-layout-lg");
		expect(screen.getByText("Footer").closest('[data-slot="sidebar-footer"]')).toHaveClass(
			"basalt-sidebar-footer",
			"pt-basalt-space-lg",
			"pb-basalt-layout",
		);
		expect(screen.getByText("Footer").closest('[data-slot="sidebar-footer"]')).not.toHaveClass(
			"px-basalt-nav-inset",
		);
	});

	it("keeps the brand slot fixed while exposing a version badge and action", () => {
		const { container, rerender } = render(
			<SidebarBrand
				logo={
					<span role="img" aria-label="Atlas logo">
						A
					</span>
				}
				name="Atlas"
				version="v1.2.3"
				action={<button type="button">Action</button>}
			/>,
		);
		expect(container.querySelector('[data-slot="sidebar-brand"]')).toBeInTheDocument();
		expect(container.querySelector('[data-slot="sidebar-brand-logo"]')).toHaveClass(
			"basalt-sidebar-brand-logo",
			"[&>img]:size-full",
			"[&>svg]:size-full",
			"[&>a>img]:size-full",
		);
		const brandName = screen.getByText("Atlas");
		expect(brandName).toHaveAttribute("data-slot", "sidebar-brand-name");
		// The badge follows the name instead of being pushed against the action.
		expect(brandName).not.toHaveClass("flex-1");
		expect(brandName.nextElementSibling).toHaveTextContent("v1.2.3");
		const version = screen.getByText("v1.2.3");
		expect(version).toHaveAttribute("data-slot", "sidebar-brand-version");
		expect(version).toHaveClass(
			"basalt-inline",
			"rounded-basalt-full",
			"bg-basalt-secondary",
			"text-basalt-muted-foreground",
			"shrink-0",
		);
		expect(container.querySelector('[data-slot="sidebar-brand-action"]')).toHaveClass(
			"basalt-sidebar-brand-action",
		);
		rerender(<SidebarBrand logo="A" name="Atlas" />);
		expect(screen.queryByText("v1.2.3")).not.toBeInTheDocument();
		expect(container.querySelector('[data-slot="sidebar-brand-action"]')).toBeNull();
	});

	it("hides brand copy on the collapsed rail and restores it when expanded or peeking", () => {
		const brand = (
			<SidebarHeader>
				<SidebarBrand logo={<span>A</span>} name="Atlas" version="v3.3.2" />
			</SidebarHeader>
		);
		const { container, rerender } = render(
			<SidebarProvider collapsed={false}>
				<Sidebar>{brand}</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByText("Atlas")).toBeVisible();
		expect(screen.getByText("v3.3.2")).toBeVisible();

		rerender(
			<SidebarProvider collapsed>
				<Sidebar>{brand}</Sidebar>
			</SidebarProvider>,
		);
		expect(container.querySelector("[data-basalt-sidebar]")).toHaveAttribute("data-collapsed");
		expect(container.querySelector('[data-slot="sidebar-brand-copy"]')).toBeInTheDocument();

		rerender(
			<SidebarProvider collapsed={false}>
				<Sidebar>{brand}</Sidebar>
			</SidebarProvider>,
		);
		expect(container.querySelector("[data-basalt-sidebar]")).not.toHaveAttribute("data-collapsed");

		rerender(
			<SidebarProvider collapsed peek>
				<Sidebar>{brand}</Sidebar>
			</SidebarProvider>,
		);
		const sidebar = container.querySelector<HTMLElement>("[data-basalt-sidebar]");
		if (!sidebar) throw new Error("Missing sidebar");
		expect(sidebar).toHaveAttribute("data-collapsed");
		fireEvent.mouseEnter(sidebar);
		expect(sidebar).not.toHaveAttribute("data-collapsed");
		expect(screen.getByText("Atlas")).toBeInTheDocument();
		expect(screen.getByText("v3.3.2")).toBeInTheDocument();
	});

	it("toggles through context with accessible expanded state", () => {
		const onCollapsedChange = vi.fn();
		const onClick = vi.fn();
		render(
			<SidebarProvider onCollapsedChange={onCollapsedChange}>
				<SidebarToggle onClick={onClick} />
			</SidebarProvider>,
		);
		const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
		expect(toggle).toHaveAttribute("aria-expanded", "true");
		expect(toggle).toHaveClass("basalt-action-icon-sm");
		expect(toggle).toHaveAttribute("data-slot", "sidebar-toggle");
		fireEvent.click(toggle);
		expect(onClick).toHaveBeenCalledOnce();
		expect(onCollapsedChange).toHaveBeenCalledWith(true);
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(toggle).toHaveAccessibleName("Expand sidebar");
	});

	it("uses an explicit label on a right-side collapsed toggle", () => {
		render(
			<SidebarProvider defaultCollapsed side="right">
				<SidebarToggle aria-label="Toggle navigation" />
			</SidebarProvider>,
		);
		const toggle = screen.getByRole("button", { name: "Toggle navigation" });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
	});

	it("dismisses a hosting drawer without touching collapse state or showing a tooltip", async () => {
		const onCollapsedChange = vi.fn();
		const onDismiss = vi.fn();
		render(
			<SidebarProvider onCollapsedChange={onCollapsedChange}>
				<SidebarToggle mode="dismiss" onDismiss={onDismiss} />
			</SidebarProvider>,
		);
		const close = screen.getByRole("button", { name: "Close navigation" });
		expect(close).toHaveAttribute("data-slot", "sidebar-toggle");
		expect(close).toHaveAttribute("data-mode", "dismiss");
		expect(close).not.toHaveAttribute("aria-expanded");
		expect(close).toHaveClass("basalt-action-icon-sm");
		act(() => close.focus());
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		fireEvent.click(close);
		expect(onDismiss).toHaveBeenCalledOnce();
		expect(onCollapsedChange).not.toHaveBeenCalled();
	});

	it("lets a dismiss toggle skip onDismiss when the click is prevented and works without a provider", () => {
		const onDismiss = vi.fn();
		render(
			<SidebarToggle
				mode="dismiss"
				dismissLabel="关闭导航"
				onDismiss={onDismiss}
				onClick={(event) => event.preventDefault()}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "关闭导航" }));
		expect(onDismiss).not.toHaveBeenCalled();
	});

	it("closes an auto-focused drawer on the first Escape in dismiss mode", async () => {
		function Drawer() {
			const [open, setOpen] = useState(true);
			return (
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetContent side="left">
						<SheetTitle>Navigation</SheetTitle>
						<SheetDescription>Drawer</SheetDescription>
						<SidebarToggle mode="dismiss" onDismiss={() => setOpen(false)} />
					</SheetContent>
				</Sheet>
			);
		}
		render(<Drawer />);
		const close = await screen.findByRole("button", { name: "Close navigation" });
		act(() => close.focus());
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		fireEvent.keyDown(document.activeElement ?? document, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
	});

	it("honors a prevented toggle click and custom labels", () => {
		const onCollapsedChange = vi.fn();
		render(
			<SidebarProvider onCollapsedChange={onCollapsedChange}>
				<SidebarToggle
					expandLabel="Open navigation"
					collapseLabel="Close navigation"
					onClick={(event) => event.preventDefault()}
				/>
			</SidebarProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
		expect(onCollapsedChange).not.toHaveBeenCalled();
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

	it("shows loading placeholders on the sidebar content column", () => {
		render(
			<SidebarProvider loading>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.queryByText("Nav")).not.toBeInTheDocument();
		const status = screen.getByRole("status");
		expect(status).toHaveClass("px-basalt-layout-lg", "py-basalt-space-lg");
		expect(status).not.toHaveClass("p-basalt-space-lg");
		expect(status.closest("aside")).toHaveAttribute("aria-busy");
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

	it("closes a focused generic overlay on the first Escape and restores focus", async () => {
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
				<Sidebar>
					<SidebarToggle />
				</Sidebar>
			</SidebarProvider>,
		);
		const open = screen.getByRole("button", { name: "Open" });
		open.focus();
		fireEvent.click(open);
		const panel = screen.getByRole("dialog", { name: "Sidebar" });
		await waitFor(() => expect(panel).toHaveFocus());
		fireEvent.keyDown(document, { key: "Escape" });
		await waitFor(() => {
			expect(screen.queryByRole("dialog", { name: "Sidebar" })).not.toBeInTheDocument();
			expect(open).toHaveFocus();
		});
	});

	it("dismisses an active tooltip before its overlay", async () => {
		render(
			<SidebarProvider overlay>
				<Sidebar>
					<SidebarToggle />
				</Sidebar>
			</SidebarProvider>,
		);
		act(() => screen.getByRole("button", { name: "Collapse sidebar" }).focus());
		expect(await screen.findByRole("tooltip")).toBeInTheDocument();
		fireEvent.keyDown(document, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
		expect(screen.getByRole("dialog", { name: "Sidebar" })).toBeInTheDocument();
		fireEvent.keyDown(document, { key: "Escape" });
		await waitFor(() =>
			expect(screen.queryByRole("dialog", { name: "Sidebar" })).not.toBeInTheDocument(),
		);
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

	it("allows fixed compositions to opt out without changing provider defaults", () => {
		const { unmount } = render(
			<SidebarProvider>
				<Sidebar resizable={false}>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.queryByRole("separator", { name: "Resize sidebar" })).not.toBeInTheDocument();
		unmount();
		render(
			<SidebarProvider>
				<Sidebar>Nav</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByRole("separator", { name: "Resize sidebar" })).toBeInTheDocument();
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

	it("renders router-backed and asChild sidebar links", () => {
		function RouterLink({ href, ...props }: { href: string; children?: ReactNode }) {
			return <a href={`/app${href}`} {...props} />;
		}
		render(
			<LinkProvider render={RouterLink}>
				<SidebarItem href="/home" active target="_blank">
					Home
				</SidebarItem>
				<SidebarItem asChild>
					<a href="/settings">Settings</a>
				</SidebarItem>
				<SidebarIconItem href="/mail" aria-label="Mail">
					M
				</SidebarIconItem>
				<SidebarIconItem asChild aria-label="Account">
					<a href="/account">A</a>
				</SidebarIconItem>
			</LinkProvider>,
		);
		const home = screen.getByRole("link", { name: "Home" });
		expect(home).toHaveAttribute("href", "/app/home");
		expect(home).toHaveAttribute("target", "_blank");
		expect(home).toHaveAttribute("data-basalt-hover-item");
		expect(home).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
		expect(screen.getByRole("link", { name: "Mail" })).toHaveAttribute("href", "/app/mail");
		expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account");
	});

	it("rejects disabled asChild rows at the type and runtime boundaries", () => {
		type DisabledItemSlot = {
			asChild: true;
			disabled: true;
			children: ReactNode;
		} extends SidebarItemProps
			? true
			: false;
		type DisabledIconSlot = {
			asChild: true;
			disabled: true;
			children: ReactNode;
		} extends SidebarIconItemProps
			? true
			: false;
		expectTypeOf<DisabledItemSlot>().toEqualTypeOf<false>();
		expectTypeOf<DisabledIconSlot>().toEqualTypeOf<false>();

		const invalid = {
			asChild: true,
			disabled: true,
			children: <a href="/account">Account</a>,
		} as unknown as SidebarItemProps;
		expect(() => SidebarItem(invalid)).toThrow(/native button row/);
		expect(() => SidebarIconItem(invalid as unknown as SidebarIconItemProps)).toThrow(
			/native button row/,
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
		const search = screen.getByRole("button", { name: /Search/ });
		expect(search).toHaveAttribute("data-slot", "sidebar-search");
		expect(search).toHaveClass(
			"basalt-sidebar-row",
			"w-full",
			"text-basalt-base",
			"[&>svg:first-child]:size-basalt-sidebar-brand-slot",
		);
		expect(search.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
		expect(screen.getByText("⌘K")).toBeInTheDocument();
	});

	it("renders one accessible icon search with a tooltip while collapsed", async () => {
		const onClick = vi.fn();
		render(
			<SidebarProvider defaultCollapsed>
				<Sidebar>
					<SidebarNav>
						<SidebarSearch onClick={onClick}>Search</SidebarSearch>
					</SidebarNav>
				</Sidebar>
			</SidebarProvider>,
		);
		const search = screen.getByRole("button", { name: "Search (⌘K)" });
		expect(search).toHaveClass("basalt-sidebar-row", "w-basalt-control", "justify-center");
		expect(search).toHaveAttribute("data-basalt-hover-item");
		expect(search.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
		expect(screen.queryByText("⌘K")).not.toBeInTheDocument();
		fireEvent.click(search);
		expect(onClick).toHaveBeenCalledOnce();
		act(() => search.focus());
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Search (⌘K)");
	});

	it("does not carry an expanded hover into the collapsed search tooltip", async () => {
		function HoverThenCollapse() {
			const { collapsed, setCollapsed } = useSidebar();
			return (
				<>
					<button type="button" onClick={() => setCollapsed(!collapsed)}>
						Toggle collapse
					</button>
					<Sidebar>
						<SidebarNav>
							<SidebarSearch>Search</SidebarSearch>
						</SidebarNav>
					</Sidebar>
				</>
			);
		}
		render(
			<SidebarProvider>
				<HoverThenCollapse />
			</SidebarProvider>,
		);
		const search = screen.getByRole("button", { name: /Search/ });
		const pointer = (type: "pointermove" | "pointerout") => {
			// React derives onPointerLeave from a bubbling pointerout to an outside target.
			const event = new MouseEvent(type, { bubbles: true, relatedTarget: document.body });
			Object.defineProperty(event, "pointerType", { value: "mouse" });
			act(() => {
				search.dispatchEvent(event);
			});
		};
		// Pointer crosses the expanded search row on its way to the collapse toggle.
		pointer("pointermove");
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 20));
		});
		pointer("pointerout");
		fireEvent.click(screen.getByRole("button", { name: "Toggle collapse" }));
		expect(screen.getByRole("button", { name: "Search (⌘K)" })).toBe(search);
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
		});
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		// A real hover in the collapsed rail still opens it.
		pointer("pointermove");
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Search (⌘K)");
	});

	it("preserves search focus and DOM identity across collapse and peek transitions", async () => {
		function SearchTransitions() {
			const { collapsed, setCollapsed } = useSidebar();
			return (
				<>
					<button type="button" onClick={() => setCollapsed(!collapsed)}>
						Toggle collapse
					</button>
					<Sidebar>
						<SidebarNav>
							<SidebarSearch>Search</SidebarSearch>
						</SidebarNav>
					</Sidebar>
				</>
			);
		}
		const { container } = render(
			<SidebarProvider peek>
				<SearchTransitions />
			</SidebarProvider>,
		);
		const sidebar = container.querySelector<HTMLElement>("[data-basalt-sidebar]");
		const toggle = screen.getByRole("button", { name: "Toggle collapse" });
		const search = screen.getByRole("button", { name: /Search/ });
		const icon = search.querySelector("svg");
		if (!sidebar || !icon) throw new Error("Missing sidebar search transition fixture");

		act(() => search.focus());
		fireEvent.click(toggle);
		expect(screen.getByRole("button", { name: "Search (⌘K)" })).toBe(search);
		expect(search.querySelector("svg")).toBe(icon);
		expect(search).toHaveFocus();
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Search (⌘K)");

		fireEvent.mouseEnter(sidebar);
		expect(screen.getByRole("button", { name: /Search/ })).toBe(search);
		expect(search.querySelector("svg")).toBe(icon);
		expect(search).toHaveFocus();
		expect(search).not.toHaveAttribute("data-basalt-hover-item");

		fireEvent.mouseLeave(sidebar);
		expect(screen.getByRole("button", { name: "Search (⌘K)" })).toBe(search);
		expect(search.querySelector("svg")).toBe(icon);
		expect(search).toHaveFocus();
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Search (⌘K)");

		fireEvent.click(toggle);
		expect(screen.getByRole("button", { name: /Search/ })).toBe(search);
		expect(search.querySelector("svg")).toBe(icon);
		expect(search).toHaveFocus();
	});

	it("relaxes destination rows locally without a fixed height", () => {
		render(<SidebarItem>Home</SidebarItem>);
		const row = screen.getByRole("button", { name: "Home" });
		expect(row).toHaveClass(
			"py-basalt-space-lg",
			"leading-basalt-row",
			"min-h-[calc(var(--basalt-line-row)+2*var(--basalt-space-lg))]",
		);
		expect(row).not.toHaveClass("py-basalt-row-y");
		expect(row.className.split(/\s+/)).not.toContain("h-basalt-14");
	});

	it("keeps collapsed icon items on the centered rail slot", () => {
		render(<SidebarIconItem aria-label="Mail">Mail</SidebarIconItem>);
		const button = screen.getByRole("button", { name: "Mail" });
		expect(button).toHaveClass(
			"py-basalt-space-lg",
			"min-h-[calc(var(--basalt-line-row)+2*var(--basalt-space-lg))]",
			"w-basalt-control",
			"justify-center",
		);
		expect(button).not.toHaveClass("w-full");
		expect(button).not.toHaveClass("min-h-basalt-control");
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

	it("collapses SidebarUser to its avatar with a rail tooltip", async () => {
		const { rerender } = render(
			<SidebarProvider collapsed>
				<Sidebar>
					<SidebarFooter>
						<SidebarUser
							name="Ada"
							email="ada@hexly.ai"
							avatar={<span>AV</span>}
							action={<button type="button">Menu</button>}
						/>
					</SidebarFooter>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByText("AV")).toBeInTheDocument();
		expect(screen.queryByText("ada@hexly.ai")).toBeNull();
		expect(screen.queryByRole("button", { name: "Menu" })).toBeNull();
		const user = screen.getByText("AV").closest('[data-slot="sidebar-user"]');
		expect(user).toHaveAttribute("data-collapsed");
		const trigger = screen.getByText("AV").closest('[data-slot="sidebar-user-avatar"]');
		if (!trigger) throw new Error("Missing collapsed avatar trigger");
		const event = new MouseEvent("pointermove", { bubbles: true });
		Object.defineProperty(event, "pointerType", { value: "mouse" });
		act(() => {
			trigger.dispatchEvent(event);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Ada");
		rerender(
			<SidebarProvider collapsed>
				<Sidebar>
					<SidebarFooter>
						<SidebarUser name="Ada" tooltip="Ada (owner)" />
					</SidebarFooter>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.queryByText("AV")).toBeNull();
		expect(document.querySelector('[data-slot="sidebar-user"]')).toBeNull();
	});

	it("shows the full SidebarUser row while a collapsed rail peeks", () => {
		const { container } = render(
			<SidebarProvider collapsed peek>
				<Sidebar>
					<SidebarFooter>
						<SidebarUser
							name="Ada"
							email="ada@hexly.ai"
							avatar={<span>AV</span>}
							tooltip="Ada (owner)"
						/>
					</SidebarFooter>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.queryByText("ada@hexly.ai")).toBeNull();
		const sidebar = container.querySelector<HTMLElement>("[data-basalt-sidebar]");
		if (!sidebar) throw new Error("Missing sidebar");
		fireEvent.mouseEnter(sidebar);
		expect(screen.getByText("ada@hexly.ai")).toBeInTheDocument();
		expect(screen.getByText("Ada")).toBeInTheDocument();
		expect(screen.queryByText("Ada (owner)")).toBeNull();
		expect(screen.getByText("AV").closest('[data-slot="sidebar-user"]')).not.toHaveAttribute(
			"data-collapsed",
		);
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

	it("renders the standard SidebarUser sign-out button with a top tooltip", async () => {
		const onSignOut = vi.fn();
		render(
			<SidebarUser
				name="Ada"
				avatar={<span>AV</span>}
				action={<button type="button">Menu</button>}
				onSignOut={onSignOut}
			/>,
		);
		const signOut = screen.getByRole("button", { name: "Sign out" });
		expect(signOut).toHaveAttribute("data-slot", "sidebar-user-sign-out");
		expect(signOut).toHaveAttribute("type", "button");
		expect(signOut.querySelector("svg.lucide-log-out")).not.toBeNull();
		const menu = screen.getByRole("button", { name: "Menu" });
		expect(menu.compareDocumentPosition(signOut) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		fireEvent.click(signOut);
		expect(onSignOut).toHaveBeenCalledTimes(1);
		const event = new MouseEvent("pointermove", { bubbles: true });
		Object.defineProperty(event, "pointerType", { value: "mouse" });
		act(() => {
			signOut.dispatchEvent(event);
		});
		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip).toHaveTextContent("Sign out");
		expect(document.querySelector('[data-side="top"]')).not.toBeNull();
	});

	it("renders SidebarUser sign-out as a link with a custom label", () => {
		const onSignOut = vi.fn();
		render(
			<SidebarUser
				name="Ada"
				avatar={<span>AV</span>}
				signOutHref="/cdn-cgi/access/logout"
				onSignOut={onSignOut}
				signOutLabel="退出登录"
			/>,
		);
		const link = screen.getByRole("link", { name: "退出登录" });
		expect(link).toHaveAttribute("href", "/cdn-cgi/access/logout");
		expect(link).toHaveAttribute("data-slot", "sidebar-user-sign-out");
		expect(screen.queryByRole("button", { name: "退出登录" })).toBeNull();
	});

	it("hides the SidebarUser sign-out on the collapsed rail and omits it by default", () => {
		const { rerender } = render(
			<SidebarProvider collapsed>
				<Sidebar>
					<SidebarFooter>
						<SidebarUser name="Ada" avatar={<span>AV</span>} onSignOut={() => {}} />
					</SidebarFooter>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByText("AV")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
		rerender(<SidebarUser name="Ada" avatar={<span>AV</span>} />);
		expect(document.querySelector('[data-slot="sidebar-user-sign-out"]')).toBeNull();
	});

	it.each([
		["~390px (Sheet p-basalt-card / 16px)", 390],
		["≥640px sm (Sheet sm:p-basalt-card-lg / 24px)", 640],
	])(
		"merges zero padding utilities over SheetContent side padding at %s",
		(_label, viewportWidth) => {
			// Viewport width is for scenario labeling; jsdom does not evaluate @media.
			// Regression was utilities-layer card padding beating components-layer
			// `.basalt-sidebar-drawer { padding: 0 }`. We assert cn/tailwind-merge
			// drops `p-basalt-card` and `sm:p-basalt-card-lg` from the dialog class list.
			Object.defineProperty(window, "innerWidth", {
				configurable: true,
				writable: true,
				value: viewportWidth,
			});
			render(
				<SidebarDrawer open>
					<Sidebar resizable={false}>
						<SidebarNav aria-label="Main">
							<SidebarItem>Home</SidebarItem>
						</SidebarNav>
					</Sidebar>
				</SidebarDrawer>,
			);
			const dialog = screen.getByRole("dialog", { name: "Navigation" });
			expect(dialog.className).toContain("basalt-sidebar-drawer");
			expect(dialog.className).toContain("p-0");
			expect(dialog.className).toContain("sm:p-0");
			expect(dialog.className).toContain("w-[var(--basalt-size-sidebar-width)]");
			expect(dialog.className).toContain("max-w-[var(--basalt-size-sidebar-width)]");
			expect(dialog.className).toContain("border-r-0");
			expect(dialog.className).not.toMatch(/\bp-basalt-card\b/);
			expect(dialog.className).not.toContain("sm:p-basalt-card-lg");
			expect(dialog.className).not.toMatch(/\bw-basalt-80\b/);
			expect(dialog.className).not.toMatch(/\bborder-r\b(?!-0)/);
		},
	);

	it("opens and closes SidebarDrawer with accessible name, forced expansion and focus return", async () => {
		function Shell() {
			const [open, setOpen] = useState(false);
			const menuButton = useRef<HTMLButtonElement>(null);
			return (
				<>
					<button ref={menuButton} type="button" onClick={() => setOpen(true)}>
						Open menu
					</button>
					<SidebarDrawer
						open={open}
						onOpenChange={setOpen}
						id="mobile-navigation"
						returnFocusRef={menuButton}
						description="Primary navigation"
					>
						<Sidebar resizable={false}>
							<SidebarHeader>
								<SidebarBrand
									logo={<span>A</span>}
									name="Atlas"
									action={<SidebarToggle mode="dismiss" onDismiss={() => setOpen(false)} />}
								/>
							</SidebarHeader>
							<SidebarNav aria-label="Main">
								<SidebarItem>Home</SidebarItem>
							</SidebarNav>
						</Sidebar>
					</SidebarDrawer>
				</>
			);
		}
		render(<Shell />);
		const menu = screen.getByRole("button", { name: "Open menu" });
		fireEvent.click(menu);
		const dialog = await screen.findByRole("dialog", { name: "Navigation" });
		expect(dialog).toHaveAttribute("id", "mobile-navigation");
		expect(dialog).toHaveAttribute("data-slot", "sidebar-drawer");
		expect(dialog.className).toContain("basalt-sidebar-drawer");
		expect(document.querySelector("[data-basalt-sidebar]")).not.toHaveAttribute("data-collapsed");
		expect(document.querySelector("[data-basalt-sidebar]")).toHaveStyle({
			width: `${SIDEBAR_DEFAULT_WIDTH_PX}px`,
		});
		expect(screen.getByText("Atlas")).toBeVisible();
		expect(screen.getByText("Home")).toBeVisible();
		expect(screen.getByText("Primary navigation").closest(".sr-only")).not.toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
		expect(menu).toHaveFocus();
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
		expect(island).toHaveClass(
			"p-basalt-layout",
			"md:p-basalt-layout-lg",
			"lg:px-basalt-layout-xl",
		);
	});
	it("keeps the surface root without mobile inset chrome", () => {
		render(<ContentIsland mobileSurface="edge-to-edge">Read</ContentIsland>);
		const island = screen.getByText("Read");
		expect(island).toHaveAttribute("data-basalt-surface-root");
		expect(island).toHaveAttribute("data-basalt-island", "edge-to-edge");
		expect(island).not.toHaveAttribute("mobileSurface");
		expect(island).not.toHaveClass("p-basalt-layout", "rounded-basalt-lg", "ring-1");
		expect(island).toHaveClass(
			"md:p-basalt-layout-lg",
			"lg:px-basalt-layout-xl",
			"md:rounded-basalt-island",
		);
	});
});
