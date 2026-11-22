import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
	it("defaults to line variant with 100% width and shimmer", () => {
		const { container } = render(<Skeleton />);
		const el = container.firstElementChild as HTMLElement;
		expect(el).toHaveAttribute("data-slot", "skeleton");
		expect(el).toHaveAttribute("data-variant", "line");
		expect(el).toHaveAttribute("aria-hidden", "true");
		expect(el).toHaveClass("h-basalt-2", "rounded-basalt-sm", "bg-basalt-well", "overflow-hidden");
		expect(el).toHaveStyle({ width: "100%" });
		expect(el.querySelector("span")).toHaveClass(
			"animate-basalt-shimmer",
			"via-basalt-foreground/10",
			"motion-reduce:animate-none",
		);
	});

	it("supports block and circle variants", () => {
		const { container, rerender } = render(<Skeleton variant="block" />);
		let el = container.firstElementChild as HTMLElement;
		expect(el).toHaveAttribute("data-variant", "block");
		expect(el).toHaveClass("h-basalt-16", "rounded-basalt-md");
		expect(el).toHaveStyle({ width: "100%" });

		rerender(<Skeleton variant="circle" />);
		el = container.firstElementChild as HTMLElement;
		expect(el).toHaveAttribute("data-variant", "circle");
		expect(el).toHaveClass("size-basalt-8", "shrink-0", "rounded-basalt-full");
		expect(el.style.width).toBe("");
	});

	it("accepts numeric pixel dimensions and CSS length strings", () => {
		const { container, rerender } = render(<Skeleton width={160} height={24} />);
		expect(container.firstElementChild).toHaveStyle({ width: "160px", height: "24px" });

		rerender(<Skeleton variant="circle" width="2.5rem" height="2.5rem" />);
		const circle = container.firstElementChild as HTMLElement;
		expect(circle.style.width).toBe("2.5rem");
		expect(circle.style.height).toBe("2.5rem");
	});

	it("disables shimmer when animate=false and forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		const { container } = render(<Skeleton ref={ref} animate={false} data-testid="skel" />);
		const el = container.firstElementChild as HTMLElement;
		expect(ref.current).toBe(el);
		expect(el.querySelector("span")).toBeNull();
	});
});
