import { type BasaltTheme, ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LANDING_HEADING, LANDING_INSTALL, LANDING_TEMPLATES } from "@/lib/landing";
import { SITE } from "@/lib/site";
import { APP_VERSION } from "@/lib/version";
import LandingPage from "@/pages/LandingPage";

function renderLanding(defaultTheme: BasaltTheme = "light") {
	return render(
		<ThemeProvider persist={false} defaultTheme={defaultTheme}>
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
		expect(screen.getByRole("link", { name: "Open dashboard" })).toHaveAttribute(
			"href",
			"/dashboard",
		);
		expect(screen.getByRole("link", { name: "npm" })).toHaveAttribute("href", SITE.npm);
		expect(screen.getByRole("link", { name: "GitHub repository" })).toHaveAttribute(
			"href",
			SITE.github,
		);
		expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", SITE.portfolio);
		expect(document.title).toBe(SITE.homeTitle);
		expect(document.querySelector("footer #landing-version")).toHaveTextContent(`v${APP_VERSION}`);
		expect(document.querySelector("header")).not.toHaveTextContent(`v${APP_VERSION}`);
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
		expect(screen.getAllByText(LANDING_INSTALL).length).toBeGreaterThan(0);
	});

	it.each(["light", "dark"] as const)(
		"renders dark only over a %s visitor theme without touching the document theme",
		(theme) => {
			renderLanding(theme);
			const landing = document.querySelector("[data-landing-page]");
			expect(landing).toHaveAttribute("data-mode", "dark");
			expect(landing).toHaveClass("dark");
			expect(document.documentElement.dataset.mode).toBe(theme);
			expect(screen.queryByRole("button", { name: /Toggle theme/ })).toBeNull();
		},
	);

	it("swaps the template preview with the open template", () => {
		renderLanding();
		const frame = () =>
			screen.getByRole("link", { name: /^Open the .* template$/ }) as HTMLAnchorElement;
		expect(frame()).toHaveAttribute("href", LANDING_TEMPLATES[0].href);
		const [, second] = LANDING_TEMPLATES;
		const details = screen.getByText(second.name).closest("details") as HTMLDetailsElement;
		details.open = true;
		fireEvent(details, new Event("toggle"));
		expect(frame()).toHaveAttribute("href", second.href);
		expect(frame()).toHaveAccessibleName(`Open the ${second.name} template`);
		expect(frame().querySelector("img")?.getAttribute("src")).toContain(`${second.image}-dark`);
		details.open = false;
		fireEvent(details, new Event("toggle"));
		expect(frame()).toHaveAttribute("href", second.href);
	});
});
