import { AccentProvider } from "@nocoo/basalt/providers/accent";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/DashboardLayout";

// Mock `useIsMobile` with switchable mobile state.
let mockIsMobile = true;
vi.mock("@/hooks/use-mobile", () => ({
	useIsMobile: () => mockIsMobile,
}));

function renderLayout(initialPath = "/") {
	return render(
		<ThemeProvider>
			<AccentProvider>
				<MemoryRouter initialEntries={[initialPath]}>
					<Routes>
						<Route element={<DashboardLayout />}>
							<Route path="/" element={<div data-testid="dashboard-outlet">Dashboard</div>} />
							<Route path="/accounts" element={<div data-testid="accounts-outlet">Accounts</div>} />
							<Route path="/settings" element={<div data-testid="settings-outlet">Settings</div>} />
							<Route path="/ui/:slug" element={<div data-testid="catalog-outlet">Catalog</div>} />
						</Route>
					</Routes>
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

	it("uses spaced catalog names in the header", () => {
		renderLayout("/ui/command-palette");
		expect(screen.getByRole("heading", { name: "Command Palette" })).toBeInTheDocument();
		expect(document.title).toBe("Command Palette · basalt.");
	});

	it("floats the content island with a corner shadow", () => {
		renderLayout("/");
		const island = screen.getByTestId("dashboard-outlet").parentElement;
		expect(island).toHaveClass("shadow-sm");
		expect(island).toHaveClass("ring-1");
		expect(island).toHaveClass("ring-basalt-border/40");
	});

	it("keeps the github icon second to last in the header", () => {
		renderLayout("/");
		const github = screen.getByRole("link", { name: "GitHub repository" });
		const theme = screen.getByRole("button", { name: /Toggle theme/ });
		expect(github.nextElementSibling).toBe(theme);
		expect(screen.getByRole("button", { name: "Theme Palette" })).toBeInTheDocument();
	});

	it("opens the mobile drawer and locks body scroll when the menu button is clicked", () => {
		renderLayout("/");
		fireEvent.click(screen.getByLabelText("Open navigation menu"));
		expect(document.body.style.overflow).toBe("hidden");
	});

	it("closes the mobile drawer when navigating to a new route", () => {
		renderLayout("/");

		// Open the drawer.
		fireEvent.click(screen.getByLabelText("Open navigation menu"));
		expect(document.body.style.overflow).toBe("hidden");

		// Click a nav item that lives in the drawer (there are two Accounts buttons
		// after opening — desktop sidebar is hidden by the mock, so the last visible
		// nav item is the drawer's).
		const accountsButtons = screen.getAllByRole("button", { name: /Accounts/i });
		act(() => {
			fireEvent.click(accountsButtons[accountsButtons.length - 1]);
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

	it("restores focus to the trigger button when dismissed via the collapse sidebar button inside drawer", async () => {
		renderLayout("/");
		const openButton = screen.getByLabelText("Open navigation menu");
		fireEvent.click(openButton);

		// Inside the drawer, click the collapse/toggle button
		const collapseButton = screen.getByRole("button", { name: "Collapse sidebar" });
		fireEvent.click(collapseButton);

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
						<Routes>
							<Route element={<DashboardLayout />}>
								<Route path="/" element={<div data-testid="dashboard-outlet">Dashboard</div>} />
							</Route>
						</Routes>
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
						<Routes>
							<Route element={<DashboardLayout />}>
								<Route path="/" element={<div data-testid="dashboard-outlet">Dashboard</div>} />
							</Route>
						</Routes>
					</MemoryRouter>
				</AccentProvider>
			</ThemeProvider>,
		);

		// Must NOT automatically reopen
		expect(document.body.style.overflow).toBe("");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});
