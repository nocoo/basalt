import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BasaltMark, type BasaltMarkProps } from "./basalt-mark";

function acceptBasaltMarkProps(_props: BasaltMarkProps) {}

describe("BasaltMark", () => {
	it("labels the mark", () => {
		render(<BasaltMark />);
		expect(screen.getByLabelText("Basalt")).toBeInTheDocument();
	});

	it("accepts className and SVG props and rejects a wrong className type", () => {
		acceptBasaltMarkProps({ className: "extra" });
		acceptBasaltMarkProps({
			id: "mark",
			role: "img",
			style: { display: "block" },
			"aria-label": "Logo",
			strokeWidth: 2,
			onClick: () => undefined,
		});
		// @ts-expect-error className must be a string
		acceptBasaltMarkProps({ className: 1 });
	});

	it("merges class, forwards SVG attributes, and keeps override order", () => {
		const { rerender } = render(<BasaltMark />);
		const defaults = screen.getByLabelText("Basalt");
		expect(defaults).toHaveClass("h-5", "w-5", "text-basalt-primary");
		expect(defaults).toHaveAttribute("stroke-width", "1.5");
		expect(defaults).toHaveAttribute("aria-label", "Basalt");
		rerender(
			<BasaltMark className="extra" id="mark" data-kind="mark" aria-label="Logo" strokeWidth={2} />,
		);
		const mark = screen.getByLabelText("Logo");
		expect(mark).toHaveClass("h-5", "w-5", "text-basalt-primary", "extra");
		expect(mark).toHaveAttribute("id", "mark");
		expect(mark).toHaveAttribute("data-kind", "mark");
		expect(mark).toHaveAttribute("aria-label", "Logo");
		expect(mark).toHaveAttribute("stroke-width", "2");
	});
});
