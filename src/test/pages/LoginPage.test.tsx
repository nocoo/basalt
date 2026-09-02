import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoginPage from "@/pages/LoginPage";

describe("LoginPage", () => {
	it("uses library form controls for sign-in", () => {
		render(<LoginPage />);

		expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute("type", "submit");
		expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Forgot password?" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/");
	});
});
