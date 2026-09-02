import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormsPage from "@/pages/FormsPage";

describe("FormsPage", () => {
	it("uses library buttons for form actions", () => {
		render(<FormsPage />);

		expect(screen.getByRole("button", { name: "Save profile" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Update security" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Browse files" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "View details" })).toBeInTheDocument();
	});
});
