import { act, fireEvent, render, screen } from "@testing-library/react";
import { Terminal } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Code, CodeBlock, CodeHighlighted } from "./code";

describe("Code", () => {
	it("scrolls source horizontally with unmodified arrow keys", () => {
		render(<CodeBlock>{"long line"}</CodeBlock>);
		const region = screen.getByRole("region", { name: "Code" });
		Object.defineProperty(region, "clientWidth", { value: 240 });
		fireEvent.keyDown(region, { key: "ArrowRight" });
		expect(region.scrollLeft).toBe(60);
		fireEvent.keyDown(region, { key: "ArrowLeft" });
		expect(region.scrollLeft).toBe(0);
		fireEvent.keyDown(region, { key: "ArrowDown" });
		for (const modifier of ["altKey", "ctrlKey", "metaKey", "shiftKey"])
			fireEvent.keyDown(region, { key: "ArrowRight", [modifier]: true });
		expect(region.scrollLeft).toBe(0);
	});
	it("renders inline code without a panel", () => {
		render(<Code>cn()</Code>);
		expect(screen.getByText("cn()")).toHaveClass("text-[13px]");
		expect(screen.getByText("cn()")).not.toHaveClass("rounded-basalt-md");
	});
	it("renders a titled panel with custom icon and safe, numbered code", () => {
		const code = "<script>alert(1)</script>\n\n  next\n";
		const { container } = render(
			<CodeBlock
				title="setup.sh"
				icon={<Terminal data-testid="file-icon" />}
				lineNumbers
				id="block"
			>
				{code}
			</CodeBlock>,
		);
		const panel = container.querySelector("[data-basalt-code]");
		expect(panel?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(panel).toHaveAttribute("id", "block");
		expect(screen.getByRole("region", { name: "setup.sh" })).toHaveAttribute("tabindex", "0");
		expect(screen.getByTestId("file-icon").parentElement).toHaveAttribute("aria-hidden", "true");
		expect(container.querySelector("script")).toBeNull();
		expect(container.querySelectorAll("[data-line-number]")).toHaveLength(4);
		expect(container.querySelector("code")?.textContent).toBe(code);
		for (const gutter of container.querySelectorAll("[data-line-number]")) {
			expect(gutter.parentElement).toHaveAttribute("aria-hidden", "true");
			expect(gutter.textContent).toBe("");
		}
	});
	it("omits header, icon and numbering when disabled", () => {
		const { container, rerender } = render(
			<CodeBlock copyable={false} icon={null}>
				{"plain"}
			</CodeBlock>,
		);
		expect(container.querySelector('[data-slot="code-header"]')).toBeNull();
		expect(screen.queryByRole("button")).toBeNull();
		expect(container.querySelector("[data-line-number]")).toBeNull();
		expect(screen.getByRole("region", { name: "Code" })).toHaveTextContent("plain");
		rerender(
			<CodeBlock title="Notes" copyable={false} icon={null}>
				{""}
			</CodeBlock>,
		);
		expect(screen.getByRole("region", { name: "Notes" })).toBeInTheDocument();
		expect(container.querySelectorAll("[data-code-line]")).toHaveLength(1);
		expect(container.querySelector("svg")).toBeNull();
	});
	it("copies raw source, reports failure, retries and resets feedback after content changes", async () => {
		const writeText = vi
			.fn()
			.mockRejectedValueOnce(new Error("Denied"))
			.mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const { rerender } = render(
			<CodeHighlighted title="example.ts" code={"const n = 1;\r\n"} lineNumbers />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
		await screen.findByRole("alert");
		fireEvent.click(screen.getByRole("button", { name: "Copy failed" }));
		await screen.findByRole("button", { name: "Copied" });
		expect(writeText).toHaveBeenLastCalledWith("const n = 1;\r\n");
		rerender(<CodeHighlighted code="Changed" />);
		expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
		Object.assign(navigator, { clipboard: undefined });
		await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy code" })));
		expect(screen.getByRole("alert")).toHaveTextContent("Could not copy code");
	});
	it("highlights comments, strings, numbers and multiline code", () => {
		render(
			<CodeHighlighted
				code={
					'export async function fetchUser() {\n  const n = 1; // note\n  return fetch("/api/users");\n}\nplain'
				}
			/>,
		);
		expect(screen.getByText("export")).toHaveClass("text-basalt-primary");
		expect(screen.getByText("// note")).toHaveClass("text-basalt-muted-foreground");
		expect(screen.getByText("1")).toHaveClass("text-basalt-chart-4");
		expect(screen.getByText('"/api/users"')).toHaveClass("text-basalt-chart-5");
		expect(screen.getByText("plain")).toBeInTheDocument();
	});
});
