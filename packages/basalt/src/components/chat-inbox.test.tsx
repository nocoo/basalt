import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatInbox } from "./chat-inbox";

describe("ChatInbox", () => {
	it("selects a thread", () => {
		const onSelect = vi.fn();
		render(
			<ChatInbox
				aria-label="Inbox"
				activeId="a"
				onSelect={onSelect}
				items={[
					{ id: "a", title: "Analytics", preview: "Ask about usage", time: "2m" },
					{ id: "b", title: "Quality", preview: "Error rate", time: "1h" },
				]}
			/>,
		);
		expect(screen.getByRole("button", { name: /Analytics/ })).toHaveAttribute(
			"aria-current",
			"true",
		);
		fireEvent.click(screen.getByRole("button", { name: /Quality/ }));
		expect(onSelect).toHaveBeenCalledWith("b");
	});
});
