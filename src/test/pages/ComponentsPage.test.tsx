import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ComponentsPage from "@/pages/ComponentsPage";

describe("ComponentsPage", () => {
	it("uses library buttons for module actions", () => {
		render(<ComponentsPage />);

		expect(screen.getAllByRole("button", { name: "View module" })).toHaveLength(2);
	});
});
