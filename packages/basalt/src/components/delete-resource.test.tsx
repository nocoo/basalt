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
});
