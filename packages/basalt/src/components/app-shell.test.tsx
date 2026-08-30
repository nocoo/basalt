import { render, screen } from "@testing-library/react";
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

describe("LoadingScreen", () => {
	it("exposes a status landmark", () => {
		render(<LoadingScreen label="Loading workspace" />);
		expect(screen.getByRole("status", { name: "Loading workspace" })).toBeInTheDocument();
	});
});
