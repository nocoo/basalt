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

	it("uses the paired foreground tokens for solid color badges", () => {
		for (const [variant, label, foreground] of [
			["success", "Ready", "badge-green-foreground"],
			["red", "Red", "danger-foreground"],
			["orange", "Orange", "warning-foreground"],
			["teal", "Teal", "badge-teal-foreground"],
			["blue", "Blue", "info-foreground"],
			["purple", "Purple", "badge-purple-foreground"],
		] as const) {
			render(<Badge variant={variant}>{label}</Badge>);
			expect(screen.getByText(label).className).toContain(`text-basalt-${foreground}`);
			expect(screen.getByText(label).className).not.toContain("text-basalt-on-solid");
		}
	});

	it("renders a status dot", () => {
		render(<Badge dot>Live</Badge>);
		expect(screen.getByText("Live").querySelector("span")).toBeTruthy();
	});
});
