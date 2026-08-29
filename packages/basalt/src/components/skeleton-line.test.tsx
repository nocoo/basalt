import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonLine } from "./skeleton-line";

describe("SkeletonLine", () => {
	it("uses a percent width", () => {
		const { container } = render(<SkeletonLine minWidth={40} maxWidth={40} />);
		expect(container.firstChild).toHaveStyle({ width: "40%" });
	});

	it("accepts a custom bar height", () => {
		const { container } = render(<SkeletonLine minWidth={100} maxWidth={100} height={24} />);
		expect(container.firstChild).toHaveStyle({ height: "24px" });
	});

	it("shimmers across the bar", () => {
		const { container } = render(<SkeletonLine minWidth={50} maxWidth={50} />);
		expect(container.firstChild).toHaveClass("overflow-hidden");
		expect(container.querySelector("span")?.className).toContain("animate-basalt-shimmer");
	});
});
