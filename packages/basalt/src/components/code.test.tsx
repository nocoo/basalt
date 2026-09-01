import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Code, CodeBlock, CodeHighlighted } from "./code";

describe("Code", () => {
	it("renders inline code", () => {
		render(<Code>cn()</Code>);
		const inline = screen.getByText("cn()");
		expect(inline.className.split(/\s+/)).toContain("text-[13px]");
		expect(inline.className.split(/\s+/)).not.toContain("text-sm");
		expect(inline.className).not.toContain("rounded-basalt-md");
	});

	it("renders a block", () => {
		render(<CodeBlock>const x = 1;</CodeBlock>);
		const block = screen.getByText("const x = 1;");
		expect(block.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(block.className.split(/\s+/)).not.toContain("text-[13px]");
	});

	it("highlights comments numbers and leftover text", () => {
		render(<CodeHighlighted code={"const n = 1; // note\nplain"} />);
		expect(screen.getByText("// note")).toHaveClass("text-basalt-muted-foreground");
		expect(screen.getByText("1")).toHaveClass("text-basalt-chart-4");
		expect(screen.getByText(/plain/)).toBeInTheDocument();
	});

	it("highlights keywords in a real function", () => {
		render(
			<CodeHighlighted
				code={`export async function fetchUser(id: string) {
  const response = await fetch("/api/users");
  return response.json();
}`}
			/>,
		);
		expect(screen.getByText("export")).toHaveClass("text-basalt-primary");
		expect(screen.getByText(/fetchUser/)).toBeInTheDocument();
		expect(screen.getByText('"/api/users"')).toHaveClass("text-basalt-chart-5");
		const pre = screen.getByText("export").closest("pre");
		expect(pre?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(pre?.querySelector("code")?.className.split(/\s+/)).not.toContain("text-[13px]");
	});
});
