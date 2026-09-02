import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BadgeLoginPage from "@/pages/BadgeLoginPage";

describe("BadgeLoginPage", () => {
	it("uses a library button for Google sign-in", () => {
		render(<BadgeLoginPage />);

		expect(screen.getByRole("button", { name: "Continue with Google" })).toHaveAttribute(
			"type",
			"button",
		);
	});
});
