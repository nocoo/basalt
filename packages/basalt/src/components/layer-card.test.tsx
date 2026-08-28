import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayerCard } from "./layer-card";

describe("LayerCard", () => {
	it("renders a plain surface by default", () => {
		render(<LayerCard>Body</LayerCard>);
		expect(screen.getByText("Body").className).toContain("bg-basalt-card");
		expect(screen.getByText("Body").className).not.toContain("border-basalt-border");
	});

	it("renders a bordered surface", () => {
		render(<LayerCard surface="bordered">Body</LayerCard>);
		expect(screen.getByText("Body").className).toContain("border-basalt-border");
	});
});
