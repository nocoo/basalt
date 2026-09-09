import { type BasaltTheme, ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LANDING_HEADING, LANDING_INSTALL } from "@/lib/landing";
import { SITE } from "@/lib/site";
import LandingPage from "@/pages/LandingPage";

function renderLanding(defaultTheme: BasaltTheme = "light", persist = false) {
	return render(
		<ThemeProvider persist={persist} defaultTheme={defaultTheme}>
			<MemoryRouter>
				<LandingPage />
			</MemoryRouter>
		</ThemeProvider>,
	);
}

afterEach(() => {
	Reflect.deleteProperty(navigator, "clipboard");
	vi.restoreAllMocks();
	localStorage.clear();
});

describe("LandingPage", () => {
	it("offers the catalog, real templates, and package information with a single heading", () => {
		renderLanding();
		expect(screen.getByRole("heading", { level: 1, name: LANDING_HEADING })).toBeInTheDocument();
		expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
		expect(screen.getByRole("link", { name: "Browse components" })).toHaveAttribute("href", "/ui");
		expect(screen.getByRole("link", { name: "Explore templates" })).toHaveAttribute(
			"href",
			"#templates",
		);
		expect(screen.getByRole("link", { name: "npm" })).toHaveAttribute("href", SITE.npm);
		expect(screen.getByRole("link", { name: "GitHub repository" })).toHaveAttribute(
			"href",
			SITE.github,
		);
		expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", SITE.portfolio);
		expect(document.title).toBe(SITE.homeTitle);
	});

	it("copies the install command and announces success", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
		renderLanding();
		fireEvent.click(screen.getByRole("button", { name: "Copy install command" }));
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard."),
		);
		expect(writeText).toHaveBeenCalledWith(LANDING_INSTALL);
	});

	it("keeps the command selectable when clipboard permission is denied", async () => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
		});
		renderLanding();
		fireEvent.click(screen.getByRole("button", { name: "Copy install command" }));
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("Select the command to copy it."),
		);
		expect(screen.getByText(LANDING_INSTALL)).toBeInTheDocument();
	});

	it("keeps the preview in sync with the light/dark switch", () => {
		renderLanding();
		const preview = document.querySelector(".landing-preview source");
		expect(preview).toHaveAttribute("media", "not all");
		fireEvent.click(screen.getByRole("button", { name: "Toggle theme (current: light)" }));
		expect(preview).toHaveAttribute("media", "all");
	});

	it.each(["light", "dark"] as const)(
		"starts from the %s system preference, switches both ways, and remembers the choice",
		(systemTheme) => {
			const matchMedia = window.matchMedia;
			vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
				...matchMedia(query),
				matches: query === "(prefers-color-scheme: dark)" && systemTheme === "dark",
			}));
			const { unmount } = renderLanding("system", true);
			expect(localStorage.getItem("theme")).toBeNull();
			const opposite = systemTheme === "dark" ? "light" : "dark";
			fireEvent.click(
				screen.getByRole("button", { name: `Toggle theme (current: ${systemTheme})` }),
			);
			expect(document.documentElement.dataset.mode).toBe(opposite);
			expect(localStorage.getItem("theme")).toBe(opposite);
			expect(document.querySelector(".landing-preview source")).toHaveAttribute(
				"media",
				opposite === "dark" ? "all" : "not all",
			);
			fireEvent.click(screen.getByRole("button", { name: `Toggle theme (current: ${opposite})` }));
			expect(document.documentElement.dataset.mode).toBe(systemTheme);
			expect(localStorage.getItem("theme")).toBe(systemTheme);
			unmount();
			renderLanding("system", true);
			expect(
				screen.getByRole("button", { name: `Toggle theme (current: ${systemTheme})` }),
			).toBeInTheDocument();
		},
	);
});
