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

	it("keeps the dialog open when delete work rejects", async () => {
		const onDelete = vi.fn(() => Promise.reject(new Error("busy")));
		render(<DeleteResource name="Atlas" onDelete={onDelete} />);
		fireEvent.click(screen.getByRole("button", { name: "Delete Atlas" }));
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		});
		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("heading", { name: "Delete Atlas?" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
	});
});
