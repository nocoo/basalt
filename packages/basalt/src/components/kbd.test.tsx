import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Kbd } from "./kbd";

describe("Kbd", () => {
	it("renders a keycap element with default sm size", () => {
		render(<Kbd>⌘K</Kbd>);
		const kbd = screen.getByText("⌘K");
		expect(kbd.tagName).toBe("KBD");
		expect(kbd).toHaveAttribute("data-slot", "kbd");
		expect(kbd).toHaveAttribute("data-size", "sm");
		expect(kbd).toHaveClass(
			"basalt-ui",
			"bg-basalt-card",
			"border-basalt-border",
			"font-basalt-mono",
			"min-h-basalt-5",
			"text-basalt-xs",
		);
	});

	it("supports md size, custom className, native props, and ref forwarding", () => {
		const ref = createRef<HTMLElement>();
		render(
			<Kbd ref={ref} size="md" className="tracking-wide" title="Open command palette">
				Enter
			</Kbd>,
		);
		expect(ref.current).toBe(screen.getByText("Enter"));
		expect(ref.current).toHaveAttribute("data-size", "md");
		expect(ref.current).toHaveAttribute("title", "Open command palette");
		expect(ref.current).toHaveClass("min-h-basalt-6", "text-basalt-sm", "tracking-wide");
	});
});
