import { fireEvent, render, screen } from "@testing-library/react";
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
		fireEvent.keyDown(upload, { key: "ArrowRight" });
		expect(download).toHaveFocus();
	});
});
