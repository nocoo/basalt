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

	it("keeps crumb ancestor and title at the same size and weight", () => {
		render(
			<AppHeader
				aria-label="Workspace chrome"
				breadcrumbs={[{ href: "/", label: "Examples" }]}
				title="Dashboard"
			/>,
		);
		const banner = screen.getByRole("banner", { name: "Workspace chrome" });
		expect(banner.className.split(/\s+/)).toContain("h-14");
		const ancestor = screen.getByRole("link", { name: "Examples" });
		const title = screen.getByRole("heading", { level: 1, name: "Dashboard" });
		expect(title.tagName).toBe("H1");
		for (const token of ["text-sm", "font-normal"]) {
			expect(ancestor.className.split(/\s+/)).toContain(token);
			expect(title.className.split(/\s+/)).toContain(token);
		}
		expect(ancestor.className.split(/\s+/)).toContain("text-basalt-muted-foreground");
		expect(title.className.split(/\s+/)).toContain("text-basalt-foreground");
		expect(title.className.split(/\s+/)).not.toContain("font-semibold");
		expect(title.className.split(/\s+/)).not.toContain("text-lg");
		expect(title.className.split(/\s+/)).not.toContain("md:text-xl");
		expect(banner.querySelector("svg")).toBeTruthy();
		expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
	});
});

describe("LoadingScreen", () => {
	it("exposes a status landmark", () => {
		render(<LoadingScreen label="Loading workspace" />);
		expect(screen.getByRole("status", { name: "Loading workspace" })).toBeInTheDocument();
	});
});
