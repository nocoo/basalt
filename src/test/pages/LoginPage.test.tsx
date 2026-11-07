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
		const button = screen.getByRole("button", { name: "Continue with Google" });
		expect(button).toHaveClass("border", "border-basalt-border", "rounded-xl", "py-3");
		expect(button.parentElement).toHaveClass("px-6", "pt-6", "pb-14");
		expect(button.closest("[data-basalt-surface-root]")).toHaveClass(
			"aspect-[54/86]",
			"rounded-2xl",
		);
	});

	it("disables the provider sign-in as an explained demo", () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		const button = screen.getByRole("button", { name: "Continue with Google" });
		expect(button).toBeDisabled();

		const notice = screen.getByText("Demo template · sign-in is disabled");
		expect(button).toHaveAttribute("aria-describedby", "login-demo-notice");
		expect(notice).toHaveAttribute("id", "login-demo-notice");
		expect(screen.queryByText(/secure authentication/i)).not.toBeInTheDocument();
	});
});
