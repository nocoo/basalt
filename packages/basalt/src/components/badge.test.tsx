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
		render(<Badge variant="info">Info</Badge>);
		expect(screen.getByText("Info").className).toContain("bg-basalt-info-tint");
		render(<Badge variant="purple">Purple</Badge>);
		expect(screen.getByText("Purple").className).toContain("bg-basalt-badge-purple");
	});

	it("keeps solid color badge labels white", () => {
		for (const [variant, label] of [
			["success", "Ready"],
			["red", "Red"],
			["orange", "Orange"],
			["teal", "Teal"],
			["blue", "Blue"],
			["purple", "Purple"],
		] as const) {
			render(<Badge variant={variant}>{label}</Badge>);
			expect(screen.getByText(label).className).toContain("text-white");
		}
	});

	it("renders a status dot", () => {
		render(<Badge dot>Live</Badge>);
		expect(screen.getByText("Live").querySelector("span")).toBeTruthy();
	});
});
