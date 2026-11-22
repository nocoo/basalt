import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge, type BadgeTone, type BadgeVariant } from "./badge";

const TONE_VARIANT_CASES: readonly [BadgeTone, BadgeVariant, readonly string[]][] = [
	["neutral", "soft", ["border-transparent", "bg-basalt-foreground/6", "text-basalt-foreground"]],
	["neutral", "solid", ["border-transparent", "bg-basalt-foreground", "text-basalt-background"]],
	["neutral", "outline", ["border-basalt-border", "bg-transparent", "text-basalt-foreground"]],
	["info", "soft", ["border-transparent", "bg-basalt-info-tint", "text-basalt-info"]],
	[
		"info",
		"solid",
		["border-transparent", "bg-basalt-info-solid", "text-basalt-info-solid-foreground"],
	],
	["info", "outline", ["border-basalt-info/40", "bg-transparent", "text-basalt-info"]],
	["success", "soft", ["border-transparent", "bg-basalt-success-tint", "text-basalt-success"]],
	[
		"success",
		"solid",
		["border-transparent", "bg-basalt-success-solid", "text-basalt-success-solid-foreground"],
	],
	["success", "outline", ["border-basalt-success/40", "bg-transparent", "text-basalt-success"]],
	["warning", "soft", ["border-transparent", "bg-basalt-warning-tint", "text-basalt-warning"]],
	[
		"warning",
		"solid",
		["border-transparent", "bg-basalt-warning-solid", "text-basalt-warning-solid-foreground"],
	],
	["warning", "outline", ["border-basalt-warning/40", "bg-transparent", "text-basalt-warning"]],
	["danger", "soft", ["border-transparent", "bg-basalt-danger-tint", "text-basalt-danger"]],
	[
		"danger",
		"solid",
		["border-transparent", "bg-basalt-danger-solid", "text-basalt-danger-solid-foreground"],
	],
	["danger", "outline", ["border-basalt-danger/40", "bg-transparent", "text-basalt-danger"]],
];

describe("Badge", () => {
	it("defaults to neutral soft tone", () => {
		render(<Badge>Stable</Badge>);
		const badge = screen.getByText("Stable");
		expect(badge).toHaveClass("bg-basalt-foreground/6", "text-basalt-foreground");
	});

	it.each(TONE_VARIANT_CASES)("applies %s %s classes", (tone, variant, expectedClasses) => {
		const label = `${tone}-${variant}`;
		render(
			<Badge tone={tone} variant={variant}>
				{label}
			</Badge>,
		);
		const badge = screen.getByText(label);
		for (const cls of expectedClasses) {
			expect(badge).toHaveClass(cls);
		}
	});

	it("renders a status dot", () => {
		render(<Badge dot>Live</Badge>);
		expect(screen.getByText("Live").querySelector("span")).toBeTruthy();
	});

	it("forwards ref and stamps data-slot", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Badge ref={ref}>Queued</Badge>);
		const badge = screen.getByText("Queued");
		expect(ref.current).toBe(badge);
		expect(badge).toHaveAttribute("data-slot", "badge");
	});
});
