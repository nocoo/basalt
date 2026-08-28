import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Code, CodeBlock } from "./code";

describe("Code", () => {
	it("renders inline code", () => {
		render(<Code>cn()</Code>);
		expect(screen.getByText("cn()")).toBeInTheDocument();
	});

	it("renders a block", () => {
		render(<CodeBlock>const x = 1;</CodeBlock>);
		expect(screen.getByText("const x = 1;")).toBeInTheDocument();
	});
});
