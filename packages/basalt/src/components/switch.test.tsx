import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
	it("renders an enabled switch", () => {
		render(<Switch aria-label="Alerts" />);
		expect(screen.getByRole("switch", { name: "Alerts" })).toBeEnabled();
	});

	it("can be disabled", () => {
		render(<Switch aria-label="Alerts" disabled />);
		expect(screen.getByRole("switch", { name: "Alerts" })).toBeDisabled();
	});

	it("supports a compact size", () => {
		render(<Switch aria-label="Alerts" size="sm" />);
		expect(screen.getByRole("switch", { name: "Alerts" }).className).toContain("h-4");
	});
});
