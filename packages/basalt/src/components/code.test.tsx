import { act, fireEvent, render, screen } from "@testing-library/react";
import { Terminal } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Code, CodeBlock, CodeHighlighted } from "./code";

describe("Code", () => {
	it.each(["plain", "highlighted"])(
		"allows native vertical scroll chaining for %s code",
		(mode) => {
			render(
				mode === "plain" ? (
					<CodeBlock>{"long line"}</CodeBlock>
				) : (
					<CodeHighlighted code="long line" />
				),
			);
			const region = screen.getByRole("region", { name: "Code" });
			expect(region).toHaveClass("overflow-auto", "overscroll-x-contain", "overscroll-y-auto");
			expect(region).not.toHaveClass("overscroll-contain");
			expect(fireEvent.wheel(region, { deltaY: 120, cancelable: true })).toBe(true);
			expect(fireEvent.keyDown(region, { key: "ArrowDown", cancelable: true })).toBe(true);
		},
	);
	it("attaches a code panel without removing its own content insets", () => {
		const { container } = render(<CodeBlock attached>{"const n = 1;"}</CodeBlock>);
		const panel = container.querySelector("[data-basalt-code]");
		expect(panel).toHaveClass("rounded-none", "border-0", "border-t");
		expect(panel).not.toHaveClass("border", "rounded-basalt-md");
		expect(panel).toHaveAttribute("data-code-attached", "true");
		expect(panel).not.toHaveAttribute("attached");
		expect(container.querySelector("code")).toHaveClass("px-basalt-panel-x");
	});
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
		expect(screen.getByText("cn()")).toHaveClass("text-basalt-sm");
		expect(screen.getByText("cn()")).not.toHaveClass("rounded-basalt-md");
	});
	it.each(["plain", "highlighted"])(
		"keeps %s source compact without shrinking its toolbar",
		(mode) => {
			render(
				mode === "plain" ? (
					<CodeBlock title="example.ts">{"const x = 1;"}</CodeBlock>
				) : (
					<CodeHighlighted title="example.ts" code="const x = 1;" />
				),
			);
			expect(screen.getByRole("region", { name: "example.ts" })).toHaveClass(
				"text-basalt-sm",
				"leading-[var(--basalt-line-body)]",
			);
			expect(screen.getByText("example.ts")).toHaveClass("text-basalt-code");
			expect(screen.getByRole("button", { name: "Copy code" })).toHaveClass("basalt-action");
		},
	);
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
