import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./text";

describe("Text", () => {
	it("renders default copy", () => {
		render(<Text>Hello</Text>);
		expect(screen.getByText("Hello")).toBeInTheDocument();
	});

	it("applies muted tone", () => {
		render(<Text tone="muted">Quiet</Text>);
		expect(screen.getByText("Quiet").className).toContain("text-basalt-muted-foreground");
	});
});
