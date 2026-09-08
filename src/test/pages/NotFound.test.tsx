import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import NotFound from "@/pages/NotFound";

describe("NotFound", () => {
	it("uses a library link to go home", () => {
		render(
			<MemoryRouter>
				<NotFound />
			</MemoryRouter>,
		);

		expect(screen.getByRole("link", { name: "Back to Homepage" })).toHaveAttribute("href", "/");
	});
});
