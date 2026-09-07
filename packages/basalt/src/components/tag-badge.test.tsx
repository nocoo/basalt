import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { TAG_COLORS, TagBadge, tagColorFor } from "./tag-badge";

describe("TagBadge", () => {
	it("locks published hash assignments across versions and Unicode input", () => {
		expect(
			["", "research", "设计", "a very long stable resource identifier"].map(tagColorFor),
		).toEqual(["blue", "amber", "slate", "slate"]);
	});
	it("keeps a deterministic non-semantic palette and stable identity when labels change", () => {
		for (const key of ["", "research", "设计", "a very long stable resource identifier"]) {
			expect(tagColorFor(key)).toBe(tagColorFor(key));
			expect(["slate", "blue", "violet", "teal", "amber", "rose"]).toContain(tagColorFor(key));
		}
		const { rerender } = render(<TagBadge name="Research" colorKey="tag-123" />);
		const color = screen.getByText("Research").getAttribute("data-tag-color");
		rerender(<TagBadge name="Research notes" colorKey="tag-123" />);
		expect(screen.getByText("Research notes")).toHaveAttribute("data-tag-color", color);
	});
	it("supports explicit semantic colors, both sizes and forwarded native span props/ref", () => {
		const ref = createRef<HTMLSpanElement>();
		const { rerender } = render(
			<TagBadge name="Incident" color="danger" size="sm" ref={ref} title="Incident status" />,
		);
		expect(ref.current).toBe(screen.getByText("Incident"));
		expect(ref.current).toHaveAttribute("data-tag-color", "danger");
		expect(ref.current).toHaveAttribute("title", "Incident status");
		rerender(<TagBadge name="Healthy" color="success" />);
		expect(screen.getByText("Healthy")).toHaveAttribute("data-tag-color", "success");
		rerender(<TagBadge name="Research" />);
		expect(screen.getByText("Research")).toHaveAttribute("data-tag-color", tagColorFor("Research"));
		expect(Object.keys(TAG_COLORS)).toEqual([
			"slate",
			"blue",
			"violet",
			"teal",
			"amber",
			"rose",
			"success",
			"warning",
			"danger",
			"info",
		]);
	});
});
