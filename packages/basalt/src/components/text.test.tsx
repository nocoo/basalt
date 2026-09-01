import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Text } from "./text";

const SIZE_CLASS = {
	xs: "text-xs",
	sm: "text-sm",
	md: "text-sm leading-6",
	lg: "text-base",
	xl: "text-lg",
} as const;

describe("Text", () => {
	it("renders default body copy as a paragraph with a host ref", () => {
		const ref = createRef<HTMLElement>();
		render(<Text ref={ref}>Hello</Text>);
		const node = screen.getByText("Hello");
		expect(node.tagName).toBe("P");
		expect(node.className).toContain("text-sm");
		expect(node.className).toContain("leading-6");
		expect(node.className).not.toContain("font-semibold");
		expect(node.className).not.toContain("font-mono");
		expect(ref.current).toBe(node);
	});

	it("renders heading as a span with lg semibold, and explicit heading elements", () => {
		const { rerender } = render(<Text variant="heading">Title</Text>);
		const heading = screen.getByText("Title");
		expect(heading.tagName).toBe("SPAN");
		expect(heading.className).toContain("text-base");
		expect(heading.className).toContain("font-semibold");

		for (const as of ["h1", "h2", "h3", "h4", "h5", "h6"] as const) {
			rerender(
				<Text variant="heading" as={as}>
					Title
				</Text>,
			);
			expect(screen.getByText("Title").tagName).toBe(as.toUpperCase());
		}
	});

	it("renders mono as a span or code with the sm monospace scale", () => {
		const { rerender } = render(<Text variant="mono">npm</Text>);
		const mono = screen.getByText("npm");
		expect(mono.tagName).toBe("SPAN");
		expect(mono.className).toContain("text-sm");
		expect(mono.className).toContain("font-mono");
		rerender(
			<Text variant="mono" as="code">
				npm
			</Text>,
		);
		expect(screen.getByText("npm").tagName).toBe("CODE");
	});

	it("keeps the five existing size class mappings", () => {
		const { rerender } = render(<Text size="xs">Copy</Text>);
		for (const [size, className] of Object.entries(SIZE_CLASS)) {
			rerender(<Text size={size as keyof typeof SIZE_CLASS}>Copy</Text>);
			for (const token of className.split(" ")) {
				expect(screen.getByText("Copy").className).toContain(token);
			}
		}
	});

	it("applies muted tone", () => {
		render(<Text tone="muted">Quiet</Text>);
		expect(screen.getByText("Quiet").tagName).toBe("P");
		expect(screen.getByText("Quiet").className).toContain("text-basalt-muted-foreground");
	});

	it("applies bold and single-line truncate", () => {
		const { rerender } = render(<Text bold>Strong</Text>);
		expect(screen.getByText("Strong").className).toContain("font-semibold");
		rerender(<Text truncate>Long copy</Text>);
		expect(screen.getByText("Long copy").className.split(/\s+/)).toEqual(
			expect.arrayContaining(["min-w-0", "truncate"]),
		);
	});

	it("forwards className, HTML, ARIA, and events onto the host", () => {
		const onClick = vi.fn();
		render(
			<Text id="copy" className="extra" aria-label="Body" data-testid="text" onClick={onClick}>
				Hello
			</Text>,
		);
		const node = screen.getByTestId("text");
		expect(node).toHaveAttribute("id", "copy");
		expect(node).toHaveAttribute("aria-label", "Body");
		expect(node.className).toContain("extra");
		fireEvent.click(node);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("rejects non-text elements at the type level", () => {
		render(
			<Text
				// @ts-expect-error div is not a TextElement
				as="div"
			>
				Nope
			</Text>,
		);
		render(
			<Text
				// @ts-expect-error button is not a TextElement
				as="button"
			>
				Nope
			</Text>,
		);
	});
});
