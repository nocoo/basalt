import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

	it("disables stop when there is no cancel handler", () => {
		render(<ChatComposer streaming onSend={vi.fn()} />);
		expect(screen.getByRole("button", { name: "Stop generating" })).toBeDisabled();
	});

	it("collapses the field after send", async () => {
		render(<ChatComposer onSend={vi.fn()} />);
		const field = screen.getByLabelText("Message");
		field.style.height = "160px";
		fireEvent.change(field, { target: { value: "hello" } });
		fireEvent.click(screen.getByRole("button", { name: "Send message" }));
		await waitFor(() => {
			expect(field.style.height).not.toBe("160px");
		});
	});

	it("sends on Enter and ignores Shift+Enter", () => {
		const onSend = vi.fn();
		render(<ChatComposer onSend={onSend} />);
		const field = screen.getByLabelText("Message");
		fireEvent.change(field, { target: { value: "hello" } });
		fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
		expect(onSend).not.toHaveBeenCalled();
		fireEvent.keyDown(field, { key: "Enter" });
		expect(onSend).toHaveBeenCalledWith("hello");
	});

	it("ignores Enter while composing", () => {
		const onSend = vi.fn();
		render(<ChatComposer onSend={onSend} />);
		const field = screen.getByLabelText("Message");
		fireEvent.change(field, { target: { value: "你好" } });
		fireEvent.compositionStart(field);
		fireEvent.keyDown(field, { key: "Enter" });
		expect(onSend).not.toHaveBeenCalled();
		fireEvent.compositionEnd(field);
		fireEvent.keyDown(field, { key: "Enter", isComposing: true });
		expect(onSend).not.toHaveBeenCalled();
		fireEvent.keyDown(field, { key: "Enter" });
		expect(onSend).toHaveBeenCalledWith("你好");
	});

	it("does not send empty, disabled, or streaming drafts", () => {
		const onSend = vi.fn();
		const { rerender } = render(<ChatComposer onSend={onSend} />);
		fireEvent.submit(screen.getByLabelText("Message").closest("form") as HTMLFormElement);
		expect(onSend).not.toHaveBeenCalled();
		rerender(<ChatComposer disabled onSend={onSend} />);
		fireEvent.change(screen.getByLabelText("Message"), { target: { value: "hello" } });
		fireEvent.submit(screen.getByLabelText("Message").closest("form") as HTMLFormElement);
		expect(onSend).not.toHaveBeenCalled();
		rerender(<ChatComposer streaming onSend={onSend} />);
		fireEvent.submit(screen.getByLabelText("Message").closest("form") as HTMLFormElement);
		expect(onSend).not.toHaveBeenCalled();
	});

	it("uses custom control labels", () => {
		render(
			<ChatComposer
				streaming
				onSend={vi.fn()}
				onCancel={vi.fn()}
				sendLabel="Post"
				cancelLabel="Halt"
				label="Draft"
				placeholder="Ask"
			/>,
		);
		expect(screen.getByLabelText("Draft")).toHaveAttribute("placeholder", "Ask");
		expect(screen.getByRole("button", { name: "Halt" })).toBeEnabled();
	});
});
