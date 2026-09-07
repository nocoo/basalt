import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconPicker } from "./icon-picker";

const options = [
	{ value: "folder", label: "Folder", icon: <span>F</span> },
	{ value: "book", label: "Book", icon: <span>B</span> },
	{ value: "lock", label: "Vault", icon: <span>L</span>, disabled: true },
];
describe("IconPicker", () => {
	it("searches a supplied icon subset and updates an uncontrolled choice", async () => {
		const change = vi.fn();
		render(<IconPicker label="Icon" options={options} onValueChange={change} />);
		expect(screen.getByRole("button", { name: "Icon" })).toHaveTextContent("Choose icon");
		fireEvent.click(screen.getByRole("button", { name: "Icon" }));
		const search = await screen.findByRole("textbox", { name: "Icon: search" });
		fireEvent.change(search, { target: { value: "not found" } });
		expect(screen.getByRole("status")).toHaveTextContent("No icons found.");
		fireEvent.change(search, { target: { value: "  BOO  " } });
		expect(screen.getAllByRole("radio")).toHaveLength(1);
		fireEvent.click(screen.getByRole("radio", { name: "Book" }));
		expect(change).toHaveBeenCalledExactlyOnceWith("book");
		await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
		expect(screen.getByRole("button", { name: "Icon" })).toHaveTextContent("Book");
		fireEvent.click(screen.getByRole("button", { name: "Icon" }));
		expect(await screen.findByRole("textbox")).toHaveValue("");
	});
	it("retains controlled values, prevents deselection and disables reserved icons", async () => {
		const change = vi.fn();
		const { rerender } = render(
			<IconPicker label="Icon" options={options} value="folder" onValueChange={change} />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Icon" }));
		await screen.findByRole("radio", { name: "Folder" });
		fireEvent.click(screen.getByRole("radio", { name: "Folder" }));
		expect(change).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("radio", { name: "Vault" }));
		expect(change).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("radio", { name: "Book" }));
		expect(change).toHaveBeenCalledWith("book");
		expect(screen.getByRole("button", { name: "Icon" })).toHaveTextContent("Folder");
		rerender(<IconPicker label="Icon" options={options} value="folder" disabled />);
		expect(screen.getByRole("button")).toBeDisabled();
	});
	it("supports keyboard movement among enabled icons, defaults and an empty collection", async () => {
		const { rerender } = render(
			<IconPicker label="Icon" options={options} defaultValue="folder" />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Icon" }));
		const folder = await screen.findByRole("radio", { name: "Folder" });
		act(() => folder.focus());
		fireEvent.keyDown(folder, { key: "ArrowRight" });
		await waitFor(() => expect(screen.getByRole("radio", { name: "Book" })).toHaveFocus());
		fireEvent.click(screen.getByRole("radio", { name: "Book" }));
		rerender(
			<IconPicker
				label="Icon"
				options={[]}
				emptyLabel="No available icons"
				searchPlaceholder="Find icon"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Icon" }));
		expect(await screen.findByRole("status")).toHaveTextContent("No available icons");
		expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Find icon");
	});
});
