import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HealthPage from "@/pages/HealthPage";

describe("HealthPage", () => {
	it("uses library controls in prompt studio", () => {
		render(<HealthPage />);

		expect(screen.getByRole("textbox", { name: "Prompt studio" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Generate insight" })).toBeInTheDocument();
	});
});
