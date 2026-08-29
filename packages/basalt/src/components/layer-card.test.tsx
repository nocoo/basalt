import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayerCard } from "./layer-card";

describe("LayerCard", () => {
	it("renders a single surface by default", () => {
		render(<LayerCard>Body</LayerCard>);
		expect(screen.getByText("Body").className).toContain("bg-basalt-card");
		expect(screen.getByText("Body").className).toContain("ring-1");
	});

	it("layers a muted header over a raised primary card", () => {
		render(
			<LayerCard>
				<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
				<LayerCard.Primary>Hello</LayerCard.Primary>
			</LayerCard>,
		);
		const header = screen.getByText("Next Steps");
		const body = screen.getByText("Hello");
		expect(header.className).toContain("text-basalt-muted-foreground");
		expect(body.className).toContain("bg-basalt-card");
		expect(body.className).toContain("rounded-basalt-lg");
		expect(header.parentElement?.className).toContain("bg-basalt-muted");
	});
});
