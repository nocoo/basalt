import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "@/pages/NotFound";

describe("NotFound", () => {
	it("uses a library link to go home", () => {
		render(<NotFound />);

		expect(screen.getByRole("link", { name: "Back to Homepage" })).toHaveAttribute("href", "/");
	});
});
