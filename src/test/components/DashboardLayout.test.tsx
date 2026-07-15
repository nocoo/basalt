import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/DashboardLayout";

// Force `useIsMobile` to return true so the mobile drawer paths render.
vi.mock("@/hooks/use-mobile", () => ({
	useIsMobile: () => true,
}));

function renderLayout(initialPath = "/") {
	return render(
		<MemoryRouter initialEntries={[initialPath]}>
			<Routes>
				<Route element={<DashboardLayout />}>
					<Route path="/" element={<div data-testid="dashboard-outlet">Dashboard</div>} />
					<Route path="/accounts" element={<div data-testid="accounts-outlet">Accounts</div>} />
					<Route path="/settings" element={<div data-testid="settings-outlet">Settings</div>} />
				</Route>
			</Routes>
		</MemoryRouter>,
	);
}

describe("DashboardLayout", () => {
	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterEach(() => {
		vi.useRealTimers();
		document.body.style.overflow = "";
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
});
