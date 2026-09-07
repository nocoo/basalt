import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineEditable } from "./inline-editable";

async function edit() {
	fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
	return screen.findByRole("textbox", { name: "Name" });
}
function deferred() {
	let resolve!: () => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<void>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}

describe("InlineEditable", () => {
	it("waits for persistence, prevents repeated submits and restores focus after Enter", async () => {
		const pending = deferred(),
			save = vi.fn(() => pending.promise),
			change = vi.fn();
		const { rerender } = render(
			<InlineEditable label="Name" value="Old" onSave={save} onEditingChange={change} />,
		);
		const input = await edit();
		expect(input).toHaveFocus();
		fireEvent.change(input, { target: { value: "  New name  " } });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.blur(input);
		expect(save).toHaveBeenCalledExactlyOnceWith("New name");
		expect(screen.getByRole("status")).toHaveTextContent("Saving…");
		expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
		await act(async () => pending.resolve());
		expect(screen.getByRole("button", { name: "Edit Name" })).toHaveFocus();
		expect(change).toHaveBeenLastCalledWith(false, "save");
		// A completed request does not invent an application-owned committed value.
		expect(screen.getByRole("button", { name: "Edit Name" })).toHaveTextContent("Old");
		rerender(<InlineEditable label="Name" value="New name" onSave={save} />);
		expect(screen.getByRole("button", { name: "Edit Name" })).toHaveTextContent("New name");
	});
	it("saves on leaving the whole editor while preserving the new focus target", async () => {
		const save = vi.fn(),
			change = vi.fn();
		render(
			<>
				<InlineEditable label="Name" value="Old" onSave={save} onEditingChange={change} />
				<button type="button">Next field</button>
			</>,
		);
		const input = await edit();
		fireEvent.change(input, { target: { value: "New" } });
		act(() => screen.getByRole("button", { name: "Save" }).focus());
		expect(save).not.toHaveBeenCalled();
		act(() => screen.getByRole("button", { name: "Next field" }).focus());
		await waitFor(() => expect(save).toHaveBeenCalledExactlyOnceWith("New"));
		await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
		expect(screen.getByRole("button", { name: "Next field" })).toHaveFocus();
		expect(change).toHaveBeenLastCalledWith(false, "blur");
	});
	it("retains a failed draft and its accessible error, then accepts an explicit retry", async () => {
		const save = vi
			.fn()
			.mockRejectedValueOnce(new Error("Conflict: try again"))
			.mockResolvedValue(undefined);
		render(<InlineEditable label="Name" value="Old" onSave={save} />);
		const input = await edit();
		fireEvent.change(input, { target: { value: "New" } });
		fireEvent.click(screen.getByRole("button", { name: "Save" }));
		await screen.findByRole("alert");
		expect(input).toHaveValue("New");
		expect(input).toHaveAccessibleDescription("Conflict: try again");
		fireEvent.click(screen.getByRole("button", { name: "Save" }));
		await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
		expect(save).toHaveBeenCalledTimes(2);
	});
	it("validates empty and custom drafts before submitting, clears errors while typing and ignores IME Enter", async () => {
		const save = vi.fn();
		render(
			<InlineEditable
				label="Name"
				value="Old"
				onSave={save}
				requiredLabel="Name required"
				validate={(value) => (value.length < 4 ? "Too short" : undefined)}
			/>,
		);
		const input = await edit();
		fireEvent.change(input, { target: { value: " " } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(screen.getByRole("alert")).toHaveTextContent("Name required");
		fireEvent.change(input, { target: { value: "Hi" } });
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		fireEvent.keyDown(input, { key: "Enter" });
		expect(screen.getByRole("alert")).toHaveTextContent("Too short");
		fireEvent.change(input, { target: { value: "Valid name" } });
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });
		expect(save).not.toHaveBeenCalled();
		fireEvent.keyDown(input, { key: "Escape" });
		expect(screen.getByRole("button", { name: "Edit Name" })).toHaveTextContent("Old");
		expect(screen.getByRole("button", { name: "Edit Name" })).toHaveFocus();
	});
	it("supports optional untrimmed text, explicit save and cancellation without committing", async () => {
		const save = vi.fn();
		render(
			<InlineEditable
				label="Name"
				value=""
				onSave={save}
				placeholder="Add a name"
				saveOnBlur={false}
				required={false}
				trim={false}
				saveLabel="Apply"
				cancelLabel="Discard"
			/>,
		);
		expect(screen.getByText("Add a name")).toBeInTheDocument();
		const input = await edit();
		fireEvent.change(input, { target: { value: "  draft  " } });
		fireEvent.blur(input);
		expect(save).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Discard" }));
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		const second = await edit();
		fireEvent.change(second, { target: { value: "  exact  " } });
		fireEvent.click(screen.getByRole("button", { name: "Apply" }));
		await waitFor(() => expect(save).toHaveBeenCalledExactlyOnceWith("  exact  "));
	});
	it("does not submit unchanged text and leaves controlled edit-mode requests to the caller", async () => {
		const save = vi.fn(),
			change = vi.fn();
		const { rerender } = render(
			<InlineEditable
				label="Name"
				value="Old"
				editing={false}
				onSave={save}
				onEditingChange={change}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
		expect(change).toHaveBeenCalledWith(true, "edit");
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		rerender(
			<InlineEditable label="Name" value="Old" editing onSave={save} onEditingChange={change} />,
		);
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
		expect(save).not.toHaveBeenCalled();
		expect(change).toHaveBeenLastCalledWith(false, "save");
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});
	it("honors external pending/errors and disabled editing without invoking persistence", () => {
		const save = vi.fn();
		const { rerender } = render(<InlineEditable label="Name" value="Old" onSave={save} pending />);
		expect(screen.getByRole("button")).toBeDisabled();
		rerender(
			<InlineEditable
				label="Name"
				value="Old"
				onSave={save}
				editing
				pending
				error="Server validation"
				pendingLabel="Waiting"
			/>,
		);
		expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
		expect(screen.getByRole("status")).toHaveTextContent("Waiting");
		rerender(<InlineEditable label="Name" value="Old" onSave={save} editing disabled />);
		expect(screen.getByRole("textbox")).toBeDisabled();
		fireEvent.blur(screen.getByRole("textbox"));
		expect(save).not.toHaveBeenCalled();
	});
	it("uses a safe fallback for empty or non-Error rejections", async () => {
		const save = vi.fn().mockRejectedValueOnce("offline").mockRejectedValueOnce(new Error(""));
		render(
			<InlineEditable
				label="Name"
				value="Old"
				onSave={save}
				defaultEditing
				errorLabel="Try later"
			/>,
		);
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "New" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await screen.findByRole("alert");
		expect(screen.getByRole("alert")).toHaveTextContent("Try later");
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
		await screen.findByRole("alert");
		expect(screen.getByRole("alert")).toHaveTextContent("Try later");
	});
	it("ignores stale completion after external close or unmount", async () => {
		const first = deferred(),
			second = deferred(),
			save = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise),
			change = vi.fn();
		const { rerender, unmount } = render(
			<InlineEditable label="Name" value="Old" editing onSave={save} onEditingChange={change} />,
		);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "New" } });
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
		rerender(
			<InlineEditable
				label="Name"
				value="Other"
				editing={false}
				onSave={save}
				onEditingChange={change}
			/>,
		);
		rerender(
			<InlineEditable label="Name" value="Other" editing onSave={save} onEditingChange={change} />,
		);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Latest" } });
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
		await act(async () => first.resolve());
		expect(screen.getByRole("status")).toHaveTextContent("Saving");
		expect(change).not.toHaveBeenCalled();
		unmount();
		await act(async () => second.reject(new Error("late")));
		expect(change).not.toHaveBeenCalled();
	});
});
