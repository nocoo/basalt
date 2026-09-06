import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteResource } from "./delete-resource";

describe("DeleteResource", () => {
	it("confirms deletion of the named resource", async () => {
		const onDelete = vi.fn();
		render(<DeleteResource name="Atlas" onDelete={onDelete} />);
		fireEvent.click(screen.getByRole("button", { name: "Delete Atlas" }));
		expect(screen.getByRole("heading", { name: "Delete Atlas?" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		});
		expect(onDelete).toHaveBeenCalledTimes(1);
	});

	it("moves focus into the confirmation dialog from the trigger", () => {
		render(<DeleteResource name="Atlas" onDelete={() => undefined} />);
		const trigger = screen.getByRole("button", { name: "Delete Atlas" });
		trigger.focus();
		expect(document.activeElement).toBe(trigger);
		fireEvent.click(trigger);
		const dialog = screen.getByRole("alertdialog", { name: "Delete Atlas?" });
		expect(dialog.contains(document.activeElement)).toBe(true);
		expect(document.activeElement).not.toBe(trigger);
	});

	it("restores focus to the trigger when the confirmation closes", () => {
		render(<DeleteResource name="Atlas" onDelete={() => undefined} />);
		const trigger = screen.getByRole("button", { name: "Delete Atlas" });
		trigger.focus();
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(document.activeElement).toBe(trigger);
	});

	it("ignores close while delete work is pending", async () => {
		let finish!: () => void;
		const pending = new Promise<void>((resolve) => {
			finish = resolve;
		});
		render(<DeleteResource name="Atlas" onDelete={() => pending} />);
		fireEvent.click(screen.getByRole("button", { name: "Delete Atlas" }));
		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.getByRole("heading", { name: "Delete Atlas?" })).toBeInTheDocument();
		await act(async () => {
			finish();
			await pending;
		});
		expect(screen.queryByRole("heading", { name: "Delete Atlas?" })).toBeNull();
	});

	it("keeps the dialog open and displays accessible error alert when delete work rejects", async () => {
		const onDelete = vi.fn(() => Promise.reject(new Error("Local retryable deletion failure")));
		render(<DeleteResource name="Atlas" onDelete={onDelete} />);
		fireEvent.click(screen.getByRole("button", { name: "Delete Atlas" }));
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		});
		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("heading", { name: "Delete Atlas?" })).toBeInTheDocument();
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent("Local retryable deletion failure");
		expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
	});

	it("supports custom error message strings and function formatters", async () => {
		const onDelete = vi.fn(() => Promise.reject(new Error("network error")));
		const { rerender } = render(
			<DeleteResource
				name="Atlas"
				onDelete={onDelete}
				errorMessage={(err) => `Custom error: ${(err as Error).message}`}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Delete Atlas" }));
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		});
		expect(screen.getByRole("alert")).toHaveTextContent("Custom error: network error");

		rerender(
			<DeleteResource name="Atlas" onDelete={onDelete} errorMessage="Fixed custom error message" />,
		);
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		});
		expect(screen.getByRole("alert")).toHaveTextContent("Fixed custom error message");
	});
});
