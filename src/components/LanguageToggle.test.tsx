import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageToggle } from "./LanguageToggle";

describe("LanguageToggle", () => {
	it("inherits the package single ToggleGroup indicator", () => {
		const { container } = render(<LanguageToggle />);
		expect(screen.getByRole("radiogroup", { name: "Language" })).toBeInTheDocument();
		expect(screen.getByText("EN")).toBeInTheDocument();
		expect(screen.getByText("中文")).toBeInTheDocument();
		expect(container.querySelector('[data-slot="selection-indicator"]')).toBeTruthy();
		const source = readFileSync("src/components/LanguageToggle.tsx", "utf8");
		expect(source).toContain("@nocoo/basalt/components/toggle-group");
		expect(source).not.toContain("ResizeObserver");
		expect(source).not.toContain("MutationObserver");
		expect(source).not.toContain("selection-indicator");
	});
});
