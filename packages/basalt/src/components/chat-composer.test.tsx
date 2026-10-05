import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./chat-composer";

describe("ChatComposer", () => {
	it("sends trimmed text and clears the field", async () => {
		const onSend = vi.fn();
		render(<ChatComposer onSend={onSend} />);
		fireEvent.change(screen.getByLabelText("Message"), { target: { value: "  hello  " } });
		fireEvent.click(screen.getByRole("button", { name: "Send message" }));
		expect(onSend).toHaveBeenCalledWith("hello");
		await waitFor(() => expect(screen.getByLabelText("Message")).toHaveValue(""));
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

	it("uses native five-line sizing without JS height mutations", () => {
		render(<ChatComposer onSend={vi.fn()} />);
		const field = screen.getByLabelText("Message");
		expect(field).toHaveClass("basalt-chat-input");
		expect(field).toHaveAttribute("rows", "1");
		fireEvent.change(field, { target: { value: "one\ntwo\nthree\nfour\nfive\nsix" } });
		expect(field.style.height).toBe("");
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

it("preserves failed async drafts, blocks duplicates and emits attachments", async () => {
	let reject: (reason: unknown) => void = () => {};
	const send = vi.fn(
		() =>
			new Promise<void>((_, no) => {
				reject = no;
			}),
	);
	const files = vi.fn();
	const remove = vi.fn();
	const { container } = render(
		<ChatComposer
			onSend={send}
			defaultValue="Keep draft"
			attachments={[{ id: "file", name: "notes.txt" }]}
			onFilesSelect={files}
			onRemoveAttachment={remove}
		/>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
	expect(remove).toHaveBeenCalledWith("file");
	const file = new File(["notes"], "notes.txt");
	fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
		target: { files: [file] },
	});
	expect(files).toHaveBeenCalledWith([file]);
	fireEvent.submit(screen.getByLabelText("Message").closest("form") as HTMLFormElement);
	fireEvent.submit(screen.getByLabelText("Message").closest("form") as HTMLFormElement);
	expect(send).toHaveBeenCalledTimes(1);
	await import("@testing-library/react").then(({ act }) =>
		act(async () => reject(new Error("Offline"))),
	);
	expect(screen.getByRole("alert")).toHaveTextContent("Offline");
	expect(screen.getByLabelText("Message")).toHaveValue("Keep draft");
});
it("keeps controlled drafts host-owned and supports attachment-only sends", async () => {
	const change = vi.fn();
	const send = vi.fn();
	const { rerender } = render(
		<ChatComposer value="Host draft" onValueChange={change} onSend={send} />,
	);
	fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Updated" } });
	expect(change).toHaveBeenCalledWith("Updated");
	expect(screen.getByLabelText("Message")).toHaveValue("Host draft");
	rerender(<ChatComposer value="" attachments={[{ id: "a", name: "a.txt" }]} onSend={send} />);
	fireEvent.click(screen.getByRole("button", { name: "Send message" }));
	expect(send).toHaveBeenCalledWith("");
});
