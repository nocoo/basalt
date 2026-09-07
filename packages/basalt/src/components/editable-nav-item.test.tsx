import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EditableNavItem, FolderNavItem } from "./editable-nav-item";

describe("editable navigation", () => {
	it("separates navigation and trailing actions and retains native link semantics", () => {
		const select = vi.fn(),
			action = vi.fn();
		const { rerender } = render(
			<EditableNavItem
				label="Library"
				href="#library"
				count={0}
				selected
				onSelect={select}
				actions={
					<button type="button" onClick={action}>
						Pin
					</button>
				}
			/>,
		);
		const link = screen.getByRole("link", { name: "Library" });
		expect(link).toHaveAttribute("href", "#library");
		expect(link).toHaveAccessibleDescription("0");
		expect(link).toHaveAttribute("aria-current", "page");
		fireEvent.click(screen.getByRole("button", { name: "Pin" }));
		expect(action).toHaveBeenCalledOnce();
		expect(select).not.toHaveBeenCalled();
		fireEvent.click(link);
		expect(select).toHaveBeenCalledOnce();
		rerender(<EditableNavItem label="Locked" onSelect={select} disabled />);
		fireEvent.click(screen.getByRole("button"));
		expect(select).toHaveBeenCalledOnce();
	});
	it("renames a folder, retains a rejected draft, and restores the rename trigger on save/cancel", async () => {
		function Example() {
			const [name, setName] = useState("Docs");
			return (
				<FolderNavItem
					label={name}
					onRename={(next) => {
						if (next === "Bad") throw new Error("Already exists");
						setName(next);
					}}
				/>
			);
		}
		render(<Example />);
		fireEvent.click(screen.getByRole("button", { name: "Rename Docs" }));
		const input = screen.getByRole("textbox", { name: "Rename Docs" });
		expect(input).toHaveFocus();
		fireEvent.change(input, { target: { value: "Bad" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await screen.findByRole("alert");
		expect(input).toHaveValue("Bad");
		fireEvent.change(input, { target: { value: "Guides" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Rename Guides" })).toHaveFocus(),
		);
		fireEvent.click(screen.getByRole("button", { name: "Rename Guides" }));
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
		expect(screen.getByRole("button", { name: "Rename Guides" })).toHaveFocus();
	});
	it("does not reclaim focus when rename commits on blur", async () => {
		const rename = vi.fn();
		render(
			<>
				<FolderNavItem label="Docs" icon={<span>Custom icon</span>} onRename={rename} />
				<button type="button">Next item</button>
			</>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Rename Docs" }));
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Guides" } });
		act(() => screen.getByRole("button", { name: "Next item" }).focus());
		await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
		expect(rename).toHaveBeenCalledWith("Guides");
		expect(screen.getByRole("button", { name: "Next item" })).toHaveFocus();
	});
});
