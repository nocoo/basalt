import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
	CommandPaletteTrigger,
	CommandSeparator,
	CommandShortcut,
} from "./command-palette";

describe("CommandPalette", () => {
	beforeAll(() => {
		Element.prototype.scrollIntoView = vi.fn();
	});

	it("opens a searchable dialog", () => {
		const onOpenChange = vi.fn();
		render(
			<CommandPalette open onOpenChange={onOpenChange}>
				<CommandInput placeholder="Search pages..." />
				<CommandList>
					<CommandEmpty>No results</CommandEmpty>
					<CommandGroup heading="Pages">
						<CommandItem>Button</CommandItem>
						<CommandItem>Input</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandPalette>,
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByRole("dialog", { name: "Command Palette" })).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
		expect(screen.getByText("Button")).toBeInTheDocument();
		fireEvent.change(screen.getByPlaceholderText("Search pages..."), { target: { value: "Inp" } });
		expect(screen.getByText("Input")).toBeInTheDocument();
	});

	it("shows empty copy when nothing matches", () => {
		render(
			<CommandPalette open>
				<CommandInput placeholder="Search pages..." />
				<CommandList>
					<CommandEmpty>No results</CommandEmpty>
					<CommandItem>Button</CommandItem>
				</CommandList>
			</CommandPalette>,
		);
		fireEvent.change(screen.getByPlaceholderText("Search pages..."), {
			target: { value: "zzzz" },
		});
		expect(screen.getByText("No results")).toBeInTheDocument();
	});

	it("skips a disabled command", () => {
		const onSelect = vi.fn();
		render(
			<CommandPalette open shouldFilter={false}>
				<CommandInput placeholder="Search pages..." />
				<CommandList>
					<CommandItem disabled onSelect={onSelect}>
						Hidden
					</CommandItem>
					<CommandItem>Button</CommandItem>
				</CommandList>
			</CommandPalette>,
		);
		fireEvent.click(screen.getByText("Hidden"));
		expect(onSelect).not.toHaveBeenCalled();
		expect(screen.getByText("Hidden").getAttribute("data-disabled")).toBe("true");
	});

	it("names the search field and closes from the trigger", () => {
		render(
			<CommandPalette>
				<CommandPaletteTrigger>Search pages...</CommandPaletteTrigger>
				<CommandInput placeholder="Search pages..." />
				<CommandList>
					<CommandItem>Button</CommandItem>
				</CommandList>
			</CommandPalette>,
		);
		const trigger = screen.getByRole("button", { name: "Search pages..." });
		trigger.focus();
		fireEvent.click(trigger);
		expect(screen.getByPlaceholderText("Search pages...")).toHaveAttribute(
			"aria-label",
			"Search pages...",
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
	});

	it("renders shortcut and separator chrome", () => {
		render(
			<CommandPalette open>
				<CommandInput />
				<CommandList>
					<CommandItem>
						Save
						<CommandShortcut className="kbd">⌘S</CommandShortcut>
					</CommandItem>
					<CommandSeparator className="rule" />
				</CommandList>
			</CommandPalette>,
		);
		expect(screen.getByText("⌘S")).toHaveClass("kbd");
		expect(screen.getByText("⌘S").parentElement?.nextElementSibling).toHaveClass("rule");
	});
});
