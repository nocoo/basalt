import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "./app-header";
import { AppMain, AppShell, AppSkipLink } from "./app-shell";
import { LoadingScreen } from "./loading-screen";

describe("AppShell", () => {
	it("renders skip link, header, and main", () => {
		render(
			<AppShell>
				<AppSkipLink>Skip</AppSkipLink>
				<AppHeader
					breadcrumbs={[{ href: "/", label: "Examples" }]}
					title="Dashboard"
					actions={<button type="button">Theme</button>}
				/>
				<AppMain>Body</AppMain>
			</AppShell>,
		);
		expect(screen.getByRole("link", { name: "Skip" })).toHaveAttribute("href", "#main-content");
		expect(screen.getByRole("link", { name: "Examples" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
		expect(screen.getByRole("main")).toHaveTextContent("Body");
		expect(screen.getByRole("button", { name: "Theme" })).toBeInTheDocument();
	});
});

describe("AppHeader", () => {
	it("keeps a named banner with leading and omits breadcrumbs, title, and actions", () => {
		render(
			<AppHeader aria-label="Workspace chrome" leading={<button type="button">Menu</button>} />,
		);
		const banner = screen.getByRole("banner", { name: "Workspace chrome" });
		expect(within(banner).getByRole("button", { name: "Menu" })).toBeInTheDocument();
		expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
		expect(banner.querySelector("svg")).toBeNull();
		expect(screen.queryByRole("heading")).toBeNull();
		expect(banner.children).toHaveLength(1);
		expect(banner.children[0]).toHaveClass("min-w-0");
		expect(banner.children[0]).toHaveClass("gap-3");
		expect(banner.children[0]).not.toHaveClass("shrink-0");
		expect(banner.children[0]).not.toHaveClass("gap-1");
		expect(banner.children[0].contains(screen.getByRole("button", { name: "Menu" }))).toBe(true);
	});
});

describe("LoadingScreen", () => {
	it("exposes a status landmark", () => {
		render(<LoadingScreen label="Loading workspace" />);
		expect(screen.getByRole("status", { name: "Loading workspace" })).toBeInTheDocument();
	});
});
