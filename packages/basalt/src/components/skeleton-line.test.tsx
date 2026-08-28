import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonLine } from "./skeleton-line";

describe("SkeletonLine", () => {
	it("renders a pulse bar", () => {
		const { container } = render(<SkeletonLine minWidth={80} />);
		expect(container.firstChild).toHaveClass("animate-pulse");
	});
});
