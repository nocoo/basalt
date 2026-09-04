import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./chat-composer";

describe("ChatComposer", () => {
	it("sends trimmed text and clears the field", () => {
		const onSend = vi.fn();
		render(<ChatComposer onSend={onSend} />);
		fireEvent.change(screen.getByLabelText("Message"), { target: { value: "  hello  " } });
		fireEvent.click(screen.getByRole("button", { name: "Send message" }));
		expect(onSend).toHaveBeenCalledWith("hello");
		expect(screen.getByLabelText("Message")).toHaveValue("");
	});

	it("shows stop while streaming", () => {
		const onCancel = vi.fn();
		render(<ChatComposer streaming onSend={vi.fn()} onCancel={onCancel} />);
		fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
		expect(onCancel).toHaveBeenCalled();
	});
});
