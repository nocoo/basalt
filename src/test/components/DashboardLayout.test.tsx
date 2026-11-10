import { AccentProvider } from "@nocoo/basalt/providers/accent";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Link as RouterLink, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/DashboardLayout";

// Mock `useIsMobile` with switchable mobile state.
let mockIsMobile = true;
vi.mock("@/hooks/use-mobile", () => ({
	useIsMobile: () => mockIsMobile,
}));

function TestLink({
	href,
	className,
	children,
	...props
}: { href: string; className?: string; children?: ReactNode } & Record<string, unknown>) {
	return (
		<RouterLink to={href} className={className} {...props}>
			{children}
		</RouterLink>
	);
}

function renderLayout(initialPath = "/") {
	return render(
		<ThemeProvider>
			<AccentProvider>
				<MemoryRouter initialEntries={[initialPath]}>
					<LinkProvider render={TestLink}>
						<Routes>
							<Route element={<DashboardLayout />}>
								<Route path="/ui" element={<div>Library</div>} />
								<Route path="/dashboard" element={<div>Dashboard</div>} />
								<Route path="/ui/:slug/source" element={<div>Source</div>} />
								<Route path="/" element={<div data-testid="dashboard-outlet">Dashboard</div>} />
								<Route
									path="/accounts"
									element={<div data-testid="accounts-outlet">Accounts</div>}
								/>
								<Route
									path="/settings"
									element={<div data-testid="settings-outlet">Settings</div>}
								/>
								<Route path="/ui/:slug" element={<div data-testid="catalog-outlet">Catalog</div>} />
								<Route path="/ui/overview/:category" element={<div>Overview</div>} />
							</Route>
						</Routes>
					</LinkProvider>
				</MemoryRouter>
			</AccentProvider>
		</ThemeProvider>,
	);
}

describe("DashboardLayout", () => {
	beforeEach(() => {
		mockIsMobile = true;
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterEach(() => {
		vi.useRealTimers();
		document.body.style.overflow = "";
	});

	it("shows the dashboard root as the current breadcrumb", () => {
		mockIsMobile = false;
		const { container } = renderLayout("/dashboard");
		expect(container.querySelector('[data-basalt-header] [aria-current="page"]')).toHaveTextContent(
			"Dashboard",
		);
	});

	it("marks the component library root as current", () => {
		mockIsMobile = false;
		const { container } = renderLayout("/ui");
		expect(container.querySelector('[data-basalt-header] a[href="/dashboard"]')).toHaveTextContent(
			"Dashboard",
		);
		expect(container.querySelector('[data-basalt-header] [aria-current="page"]')).toHaveTextContent(
			"Component library",
		);
		expect(container.querySelector('[data-basalt-header] a[href="/ui"]')).toBeNull();
	});

	it("shows full catalog paths and a non-link current page", () => {
		mockIsMobile = false;
		const { container } = renderLayout("/ui/button");
		expect(container.querySelector('[data-basalt-header] a[href="/dashboard"]')).toHaveTextContent(
			"Dashboard",
		);
		expect(container.querySelector('[data-basalt-header] a[href="/ui"]')).toHaveTextContent(
			"Component library",
		);
		expect(
			container.querySelector('[data-basalt-header] a[href="/ui/overview/action"]'),
		).toHaveTextContent("Actions");
		expect(container.querySelector('[data-basalt-header] [aria-current="page"]')).toHaveTextContent(
			"Button",
		);
	});

	it("includes all source ancestors", () => {
		mockIsMobile = false;
		const { container } = renderLayout("/ui/button/source");
		expect(container.querySelector('[data-basalt-header] a[href="/dashboard"]')).toHaveTextContent(
			"Dashboard",
		);
		expect(container.querySelector('[data-basalt-header] a[href="/ui"]')).toHaveTextContent(
			"Component library",
		);
		expect(
			container.querySelector('[data-basalt-header] a[href="/ui/overview/action"]'),
		).toHaveTextContent("Actions");
		expect(container.querySelector('[data-basalt-header] a[href="/ui/button"]')).toHaveTextContent(
			"Button",
		);
		expect(container.querySelector('[data-basalt-header] [aria-current="page"]')).toHaveTextContent(
			"Button source",
		);
	});

	it("shows the full breadcrumb path on mobile", () => {
		const { container } = renderLayout("/ui/overview/action");
		expect(container.querySelector('[data-basalt-header] a[href="/dashboard"]')).toHaveTextContent(
			"Dashboard",
		);
		expect(container.querySelector('[data-basalt-header] a[href="/ui"]')).toHaveTextContent(
			"Component library",
		);
		expect(container.querySelector('[data-basalt-header] [aria-current="page"]')).toHaveTextContent(
			"Actions",
		);
		expect(container.querySelector("[data-basalt-header]")).toHaveClass(
			"max-sm:[&_nav]:max-w-[42vw]",
		);
		expect(container.querySelector("[data-basalt-header] h1")).toBeNull();
	});

	it("uses spaced catalog names in the header", () => {
		renderLayout("/ui/command-palette");
		expect(
			screen.getByText("Command Palette", { selector: '[aria-current="page"]' }),
		).toBeInTheDocument();
		expect(screen.queryByRole("heading", { name: "Command Palette" })).not.toBeInTheDocument();
		expect(document.title).toBe("Command Palette · basalt.");
	});

	it("names overview routes and links component breadcrumbs to the right group", () => {
		const { unmount } = renderLayout("/ui/overview/action");
		expect(screen.getByText("Actions", { selector: '[aria-current="page"]' })).toBeInTheDocument();
		expect(document.title).toBe("Actions overview · basalt.");
		unmount();
		mockIsMobile = false;
		renderLayout("/ui/button");
		expect(screen.getByRole("link", { name: "Actions" })).toHaveAttribute(
			"href",
			"/ui/overview/action",
		);
	});

	it("floats the content island with a corner shadow", () => {
		renderLayout("/");
		const island = screen.getByTestId("dashboard-outlet").parentElement;
		expect(island).toHaveClass("shadow-sm");
		expect(island).toHaveClass("ring-1");
		expect(island).toHaveClass("ring-basalt-border/40");
	});

	it("places the project links before the final theme button", () => {
		renderLayout("/");
		const github = screen.getByRole("link", { name: "GitHub repository (opens in a new tab)" });
		expect(github).toHaveAttribute("href", "https://github.com/nocoo/basalt");
		const hexly = screen.getByRole("link", { name: "Basalt on hexly.ai (opens in a new tab)" });
		const theme = screen.getByRole("button", {
			name: /^(Switch to (light|dark) theme|Use system theme)$/,
		});
		expect(github.nextElementSibling).toBe(hexly);
		expect(hexly).toHaveAttribute("href", "https://hexly.ai/projects/basalt");
		expect(hexly.nextElementSibling).toBe(theme);
		expect(screen.getByRole("button", { name: "Theme Palette" })).toBeInTheDocument();
	});

	it("opens the fixed mobile drawer without resizing and locks body scroll", () => {
		renderLayout("/");
		fireEvent.click(screen.getByLabelText("Open navigation menu"));
		expect(document.body.style.overflow).toBe("hidden");
		expect(screen.queryByRole("separator", { name: "Resize sidebar" })).not.toBeInTheDocument();
	});

	it("closes the mobile drawer when navigating to a new route", () => {
		renderLayout("/");

		// Open the drawer.
		fireEvent.click(screen.getByLabelText("Open navigation menu"));
		expect(document.body.style.overflow).toBe("hidden");

		// Click a nav item that lives in the drawer (there are two Accounts buttons
		// after opening — desktop sidebar is hidden by the mock, so the last visible
		// nav item is the drawer's).
		const accountLinks = screen.getAllByRole("link", { name: /Accounts/i });
		act(() => {
			fireEvent.click(accountLinks[accountLinks.length - 1]);
		});

		// Route change must reset the drawer state — body scroll unlocks.
		expect(document.body.style.overflow).toBe("");
	});

	it("restores focus to the open navigation menu button on close when triggered by Escape or dismiss", async () => {
		renderLayout("/");
		const openButton = screen.getByLabelText("Open navigation menu");
		openButton.focus();
		expect(document.activeElement).toBe(openButton);

		// Open drawer
		fireEvent.click(openButton);
		expect(document.body.style.overflow).toBe("hidden");

		// Press Escape on the open sheet
		const sheet = screen.getByRole("dialog");
		fireEvent.keyDown(sheet, { key: "Escape" });

		// Focus must return to the open button, and body scroll must unlock
		await waitFor(() => {
			expect(openButton).toHaveFocus();
		});
		expect(document.body.style.overflow).toBe("");
	});

	it("restores focus to the trigger button when dismissed via the drawer close button", async () => {
		renderLayout("/");
		const openButton = screen.getByLabelText("Open navigation menu");
		fireEvent.click(openButton);

		// Inside the drawer, the brand action is a dismiss-mode SidebarToggle
		expect(screen.queryByRole("button", { name: "Collapse sidebar" })).not.toBeInTheDocument();
		const closeButton = screen.getByRole("button", { name: "Close navigation menu" });
		expect(closeButton).toHaveAttribute("data-mode", "dismiss");
		fireEvent.click(closeButton);

		await waitFor(() => {
			expect(openButton).toHaveFocus();
		});
		expect(document.body.style.overflow).toBe("");
	});

	it("resets mobile drawer and restores body scroll on resize to desktop, and does not reopen on return to mobile", async () => {
		const { rerender } = renderLayout("/");
		const openButton = screen.getByLabelText("Open navigation menu");
		fireEvent.click(openButton);
		expect(document.body.style.overflow).toBe("hidden");
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		// Resize to desktop (isMobile: false)
		mockIsMobile = false;
		rerender(
			<ThemeProvider>
				<AccentProvider>
					<MemoryRouter initialEntries={["/"]}>
						<LinkProvider render={TestLink}>
							<Routes>
								<Route element={<DashboardLayout />}>
									<Route path="/" element={<div data-testid="dashboard-outlet">Dashboard</div>} />
								</Route>
							</Routes>
						</LinkProvider>
					</MemoryRouter>
				</AccentProvider>
			</ThemeProvider>,
		);

		// Body overflow must be cleaned up and sheet unmounted
		expect(document.body.style.overflow).toBe("");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		// Resize back to mobile (isMobile: true)
		mockIsMobile = true;
		rerender(
			<ThemeProvider>
				<AccentProvider>
					<MemoryRouter initialEntries={["/"]}>
						<LinkProvider render={TestLink}>
							<Routes>
								<Route element={<DashboardLayout />}>
									<Route path="/" element={<div data-testid="dashboard-outlet">Dashboard</div>} />
								</Route>
							</Routes>
						</LinkProvider>
					</MemoryRouter>
				</AccentProvider>
			</ThemeProvider>,
		);

		// Must NOT automatically reopen
		expect(document.body.style.overflow).toBe("");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});
