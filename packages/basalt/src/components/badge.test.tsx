import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
	it("renders label text", () => {
		render(<Badge>Stable</Badge>);
		expect(screen.getByText("Stable")).toBeInTheDocument();
	});

	it("applies semantic variants", () => {
		render(<Badge variant="secondary">Beta</Badge>);
		expect(screen.getByText("Beta").className).toContain("bg-basalt-secondary");
		render(<Badge variant="destructive">Down</Badge>);
		expect(screen.getByText("Down").className).toContain("bg-basalt-destructive");
		render(<Badge variant="outline">Draft</Badge>);
		expect(screen.getByText("Draft").className).toContain("border-basalt-border");
	});

	it("renders a status dot", () => {
		render(<Badge dot>Live</Badge>);
		expect(screen.getByText("Live").querySelector("span")).toBeTruthy();
	});
});
