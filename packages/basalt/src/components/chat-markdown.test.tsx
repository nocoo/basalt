import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatMarkdown } from "./chat-markdown";
import { ChatMessage } from "./chat-message";

describe("safe chat content", () => {
	it("renders markdown blocks, GFM tables and inline styles without interpreting HTML", () => {
		const { container } = render(
			<ChatMarkdown
				content={
					"# Heading\n\n**Strong** *emphasis* ~~deleted~~ `inline`  \nnext\n\n> Quote\n\n1. First\n2. Second\n\n- [x] Done\n- [ ] Later\n\n---\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1)) [ok](https://example.com) ![Image](https://example.com/p.png)"
				}
			/>,
		);
		expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
		expect(container.querySelector("strong")).toHaveTextContent("Strong");
		expect(container.querySelector("em")).toHaveTextContent("emphasis");
		expect(container.querySelector("del")).toHaveTextContent("deleted");
		expect(screen.getByText("inline")).toHaveClass("text-basalt-sm");
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(container.querySelector("script")).toBeNull();
		expect(container.querySelector("img")).toBeNull();
		expect(screen.queryByRole("link", { name: "bad" })).toBeNull();
		expect(screen.getByRole("link", { name: "ok" })).toHaveAttribute("rel", "noopener noreferrer");
	});
	it("copies fenced code and reports clipboard failure", async () => {
		const writeText = vi
			.fn()
			.mockRejectedValueOnce(new Error("Denied"))
			.mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		render(<ChatMarkdown content={"```ts\nconst x = 1;\n```\n\n```\nplain\n```"} />);
		expect(screen.getByRole("region", { name: "ts" })).toHaveClass("text-basalt-sm");
		fireEvent.click(screen.getAllByRole("button", { name: "Copy code" })[0]);
		await screen.findByRole("button", { name: "Copy failed" });
		fireEvent.click(screen.getByRole("button", { name: "Copy failed" }));
		await screen.findByRole("button", { name: "Copied" });
		expect(writeText).toHaveBeenLastCalledWith("const x = 1;");
	});
	it("exposes message actions and hides them while streaming", async () => {
		const writeText = vi
			.fn()
			.mockRejectedValueOnce(new Error("Denied"))
			.mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const edit = vi.fn(),
			retry = vi.fn(),
			feedback = vi.fn();
		const { rerender } = render(
			<ChatMessage
				variant="assistant"
				content="Answer"
				trace={<span>Trace</span>}
				onEdit={edit}
				onRegenerate={retry}
				onFeedback={feedback}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Copy message" }));
		await screen.findByRole("alert");
		fireEvent.click(screen.getByRole("button", { name: "Copy message" }));
		await screen.findByRole("button", { name: "Copied" });
		fireEvent.click(screen.getByRole("button", { name: "Edit message" }));
		fireEvent.click(screen.getByRole("button", { name: "Regenerate response" }));
		fireEvent.click(screen.getByRole("button", { name: "Helpful" }));
		fireEvent.click(screen.getByRole("button", { name: "Not helpful" }));
		expect(edit).toHaveBeenCalledOnce();
		expect(retry).toHaveBeenCalledOnce();
		expect(feedback).toHaveBeenCalledWith("down");
		rerender(<ChatMessage variant="user" content="Literal **text**" streaming author="Owner" />);
		expect(screen.getByRole("article", { name: "Owner message" })).toHaveTextContent(
			"Literal **text**",
		);
		expect(screen.queryByRole("button")).toBeNull();
	});
});

it("decodes Markdown entities before URL validation but never decodes code or raw HTML", () => {
	const { container } = render(
		<ChatMarkdown
			streaming
			content={
				"A &amp; B &lt;safe&gt; &#65;\n\n[jump](jav&#x61;script:alert(1)) [query](https://example.com?a=1&amp;b=2)\n\n`&amp;`\n\n<img src=x onerror=alert(1)>"
			}
		/>,
	);
	expect(container.textContent).toContain("A & B <safe> A");
	expect(container.querySelectorAll(".basalt-chat-word").length).toBeGreaterThan(3);
	expect(screen.queryByRole("link", { name: "jump" })).toBeNull();
	expect(screen.getByRole("link", { name: "query" })).toHaveAttribute(
		"href",
		"https://example.com/?a=1&b=2",
	);
	expect(container.querySelector("code")).toHaveTextContent("&amp;");
	expect(container.querySelector("img")).toBeNull();
});

it("resets copy confirmation when message or code content changes", async () => {
	Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
	const { rerender } = render(<ChatMessage variant="assistant" content={"```\nfirst\n```"} />);
	fireEvent.click(screen.getByRole("button", { name: "Copy message" }));
	fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
	await screen.findAllByRole("button", { name: "Copied" });
	rerender(<ChatMessage variant="assistant" content={"```\nsecond\n```"} />);
	expect(screen.getByRole("button", { name: "Copy message" })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
});

it("keeps sources in a compact disclosure beside actions without nested cards", () => {
	const sources = [
		{ id: "safe", name: "Sales report", type: "CSV", href: "https://example.com/sales" },
		{ id: "bad", name: "Private notes", href: "javascript:alert(1)" },
	];
	const { container, rerender } = render(
		<ChatMessage variant="assistant" content="Answer" sources={sources} />,
	);
	expect(screen.queryByRole("list", { name: "Sources" })).toBeNull();
	const toggle = screen.getByRole("button", { name: "Sources 2" });
	expect(toggle.parentElement).toBe(
		screen.getByRole("button", { name: "Copy message" }).parentElement,
	);
	fireEvent.click(toggle);
	expect(screen.getByRole("link", { name: /Sales report/ })).toHaveAttribute(
		"rel",
		"noopener noreferrer",
	);
	expect(screen.queryByRole("link", { name: /Private notes/ })).toBeNull();
	expect(screen.getByText("Private notes")).toBeInTheDocument();
	expect(container.querySelector("[data-basalt-surface]")).toBeNull();
	rerender(<ChatMessage variant="assistant" content="More" sources={sources} streaming />);
	expect(screen.queryByRole("button")).toBeNull();
	expect(screen.queryByRole("list")).toBeNull();
});
