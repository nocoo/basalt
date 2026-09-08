import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import LoginPage from "@/pages/LoginPage";

describe("LoginPage", () => {
	it("uses the badge login as the default sign-in surface", () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		expect(screen.getByRole("button", { name: "Continue with Google" })).toHaveAttribute(
			"type",
			"button",
		);
		expect(screen.getByText("basalt.")).toBeInTheDocument();
	});
});
