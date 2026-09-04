import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatBubble } from "./chat-bubble";

describe("ChatBubble", () => {
	it("aligns user copy to the end", () => {
		render(<ChatBubble variant="user">Hello</ChatBubble>);
		expect(screen.getByText("Hello").parentElement).toHaveClass("justify-end");
	});

	it("renders system copy as a caption", () => {
		render(<ChatBubble variant="system">Today</ChatBubble>);
		expect(screen.getByText("Today").tagName).toBe("P");
	});

	it("shows a streaming caret on assistant", () => {
		const { container } = render(
			<ChatBubble variant="assistant" streaming>
				Thinking
			</ChatBubble>,
		);
		expect(container.querySelector("[aria-hidden]")).toBeInTheDocument();
	});
});
