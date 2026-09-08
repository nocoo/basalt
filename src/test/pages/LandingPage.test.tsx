import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { LANDING_HEADING } from "@/lib/landing";
import { SITE } from "@/lib/site";
import LandingPage from "@/pages/LandingPage";

describe("LandingPage", () => {
	it("renders the crawler heading and package links", () => {
		render(
			<MemoryRouter>
				<LandingPage />
			</MemoryRouter>,
		);
		expect(screen.getByRole("heading", { level: 1, name: LANDING_HEADING })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Browse the catalog" })).toHaveAttribute("href", "/ui");
		expect(screen.getByRole("link", { name: "Install on npm" })).toHaveAttribute("href", SITE.npm);
		expect(screen.getAllByRole("link", { name: "GitHub" })[0]).toHaveAttribute("href", SITE.github);
		expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", SITE.portfolio);
	});
});
