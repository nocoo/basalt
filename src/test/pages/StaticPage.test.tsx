import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import StaticPage from "@/pages/StaticPage";

describe("StaticPage", () => {
	it("uses a library link for the back entry", () => {
		render(
			<MemoryRouter>
				<StaticPage />
			</MemoryRouter>,
		);

		expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/");
	});
});
