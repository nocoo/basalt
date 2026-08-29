import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Code, CodeBlock, CodeHighlighted } from "./code";

describe("Code", () => {
	it("renders inline code", () => {
		render(<Code>cn()</Code>);
		expect(screen.getByText("cn()")).toBeInTheDocument();
	});

	it("renders a block", () => {
		render(<CodeBlock>const x = 1;</CodeBlock>);
		expect(screen.getByText("const x = 1;")).toBeInTheDocument();
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
	});
});
