import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Toolbar } from "./toolbar";

describe("Toolbar", () => {
	it("renders a grouped toolbar", () => {
		render(<Toolbar>Tools</Toolbar>);
		expect(screen.getByRole("toolbar")).toHaveTextContent("Tools");
		expect(screen.getByRole("toolbar").className).toContain("ring-1");
	});

	it("joins an input and icon buttons with shared borders", () => {
		render(
			<Toolbar className="w-full max-w-md">
				<Toolbar.Input aria-label="Query" placeholder="Search..." className="flex-1" />
				<Toolbar.Button aria-label="Search" icon={<span>+</span>} />
				<Toolbar.Button aria-label="Add">+</Toolbar.Button>
			</Toolbar>,
		);
		const toolbar = screen.getByRole("toolbar");
		expect(toolbar.className).toContain("[&>*:not(:first-child)]:border-l");
		expect(toolbar.className).not.toContain("overflow-hidden");
		expect(screen.getByPlaceholderText("Search...")).toHaveClass("border-0");
		expect(screen.getByPlaceholderText("Search...").className).toContain(
			"first:rounded-l-basalt-md",
		);
		expect(screen.getByRole("button", { name: "Search" }).className).toContain("w-9");
		expect(screen.getByRole("button", { name: "Add" }).className).not.toContain("w-9");
	});

	it("keeps toolbar buttons quiet and clickable", () => {
		const onClick = vi.fn();
		render(
			<Toolbar>
				<Toolbar.Button onClick={onClick}>Save</Toolbar.Button>
			</Toolbar>,
		);
		const button = screen.getByRole("button", { name: "Save" });
		expect(button.className).toContain("hover:bg-basalt-accent");
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("names the toolbar and disables a control", () => {
		const onClick = vi.fn();
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Button disabled onClick={onClick}>
					Save
				</Toolbar.Button>
			</Toolbar>,
		);
		expect(screen.getByRole("toolbar", { name: "Record tools" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Save" }));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("moves focus between buttons with arrows", () => {
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Button>Upload</Toolbar.Button>
				<Toolbar.Button>Download</Toolbar.Button>
			</Toolbar>,
		);
		const upload = screen.getByRole("button", { name: "Upload" });
		const download = screen.getByRole("button", { name: "Download" });
		upload.focus();
		expect(upload.tabIndex).toBe(0);
		expect(download.tabIndex).toBe(-1);
		fireEvent.keyDown(upload, { key: "ArrowRight" });
		expect(download).toHaveFocus();
		expect(download.tabIndex).toBe(0);
		expect(upload.tabIndex).toBe(-1);
	});

	it("leaves an empty input with arrows", () => {
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Input aria-label="Query" />
				<Toolbar.Button>Save</Toolbar.Button>
			</Toolbar>,
		);
		const input = screen.getByRole("textbox", { name: "Query" });
		input.focus();
		fireEvent.keyDown(input, { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
	});

	it("keeps caret motion when text is selected from the start", () => {
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Input aria-label="Query" defaultValue="ab" />
				<Toolbar.Button>Save</Toolbar.Button>
			</Toolbar>,
		);
		const input = screen.getByRole("textbox", { name: "Query" }) as HTMLInputElement;
		input.focus();
		input.setSelectionRange(0, 2);
		fireEvent.keyDown(input, { key: "ArrowLeft" });
		expect(input).toHaveFocus();
	});

	it("keeps caret motion inside a filled input", () => {
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Input aria-label="Query" defaultValue="ab" />
				<Toolbar.Button>Save</Toolbar.Button>
			</Toolbar>,
		);
		const input = screen.getByRole("textbox", { name: "Query" }) as HTMLInputElement;
		input.focus();
		input.setSelectionRange(1, 1);
		fireEvent.keyDown(input, { key: "ArrowLeft" });
		expect(input).toHaveFocus();
		input.setSelectionRange(1, 1);
		fireEvent.keyDown(input, { key: "ArrowRight" });
		expect(input).toHaveFocus();
	});

	it("wraps arrow focus from the last button", () => {
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Button>Upload</Toolbar.Button>
				<Toolbar.Button>Download</Toolbar.Button>
			</Toolbar>,
		);
		const upload = screen.getByRole("button", { name: "Upload" });
		const download = screen.getByRole("button", { name: "Download" });
		download.focus();
		fireEvent.keyDown(download, { key: "ArrowRight" });
		expect(upload).toHaveFocus();
		fireEvent.keyDown(upload, { key: "Home" });
		expect(upload).toHaveFocus();
	});

	it("restores a tab stop after the active control is disabled", () => {
		const { rerender } = render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Button>Upload</Toolbar.Button>
				<Toolbar.Button>Download</Toolbar.Button>
			</Toolbar>,
		);
		const upload = screen.getByRole("button", { name: "Upload" });
		upload.focus();
		expect(screen.getByRole("button", { name: "Download" }).tabIndex).toBe(-1);
		rerender(
			<Toolbar aria-label="Record tools">
				<Toolbar.Button disabled>Upload</Toolbar.Button>
				<Toolbar.Button>Download</Toolbar.Button>
			</Toolbar>,
		);
		expect(screen.getByRole("button", { name: "Download" }).tabIndex).toBe(0);
	});

	it("forwards function and object refs", () => {
		const objectRef = createRef<HTMLDivElement>();
		const functionRef = vi.fn();
		const { rerender } = render(<Toolbar ref={objectRef}>Tools</Toolbar>);
		expect(objectRef.current).toHaveAttribute("role", "toolbar");
		rerender(<Toolbar ref={functionRef}>Tools</Toolbar>);
		expect(functionRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
	});

	it("ignores arrows that do not start on a control", () => {
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Button>Upload</Toolbar.Button>
				<Toolbar.Button>Download</Toolbar.Button>
			</Toolbar>,
		);
		const toolbar = screen.getByRole("toolbar", { name: "Record tools" });
		const upload = screen.getByRole("button", { name: "Upload" });
		upload.focus();
		fireEvent.keyDown(toolbar, { key: "ArrowRight" });
		expect(upload).toHaveFocus();
	});

	it("wraps arrow focus from the first button", () => {
		render(
			<Toolbar aria-label="Record tools">
				<Toolbar.Button>Upload</Toolbar.Button>
				<Toolbar.Button>Download</Toolbar.Button>
			</Toolbar>,
		);
		const upload = screen.getByRole("button", { name: "Upload" });
		const download = screen.getByRole("button", { name: "Download" });
		upload.focus();
		fireEvent.keyDown(upload, { key: "ArrowLeft" });
		expect(download).toHaveFocus();
	});

	it("honors a prevented keydown", () => {
		render(
			<Toolbar
				aria-label="Record tools"
				onKeyDown={(event) => {
					event.preventDefault();
				}}
			>
				<Toolbar.Button>Upload</Toolbar.Button>
				<Toolbar.Button>Download</Toolbar.Button>
			</Toolbar>,
		);
		const upload = screen.getByRole("button", { name: "Upload" });
		upload.focus();
		fireEvent.keyDown(upload, { key: "ArrowRight" });
		expect(upload).toHaveFocus();
	});
});
