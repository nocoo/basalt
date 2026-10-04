import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
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
	afterEach(() => vi.restoreAllMocks());

	it.each([false, true])(
		"insets and moves one selection layer with grouped=%s",
		async (grouped) => {
			vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (
				this: HTMLElement,
			) {
				return this.closest("[cmdk-list]");
			});
			vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockReturnValue(6);
			vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(288);
			vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(44);
			vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (
				this: HTMLElement,
			) {
				return this.textContent === "Input" ? 50 : 6;
			});
			const listRef = createRef<HTMLDivElement>();
			const onSelect = vi.fn();
			const items = (
				<>
					<CommandItem>Button</CommandItem>
					<CommandItem disabled>Unavailable</CommandItem>
					<CommandItem onSelect={onSelect}>Input</CommandItem>
				</>
			);
			render(
				<CommandPalette open>
					<CommandInput placeholder="Search" />
					<CommandList ref={listRef} style={{ maxHeight: 280 }}>
						<CommandEmpty>No results</CommandEmpty>
						{grouped ? <CommandGroup heading="Pages">{items}</CommandGroup> : items}
					</CommandList>
				</CommandPalette>,
			);
			const list = screen.getByRole("listbox");
			expect(listRef.current).toBe(list);
			expect(list).toHaveClass("p-1.5", "relative", "isolate");
			expect(list).toHaveStyle({ maxHeight: "280px" });
			if (grouped) expect(document.querySelector("[cmdk-group]")).not.toHaveClass("p-1");
			await waitFor(() => expect(list.style.getPropertyValue("--basalt-command-top")).toBe("6px"));
			expect(list.style.getPropertyValue("--basalt-command-left")).toBe("6px");
			expect(list.style.getPropertyValue("--basalt-command-width")).toBe("288px");
			fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
			await waitFor(() => expect(list.style.getPropertyValue("--basalt-command-top")).toBe("50px"));
			expect(screen.getByRole("option", { name: "Input" })).toHaveAttribute(
				"aria-selected",
				"true",
			);
			fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
			expect(onSelect).toHaveBeenCalledWith("Input");
			fireEvent.pointerMove(screen.getByRole("option", { name: "Button" }));
			await waitFor(() => expect(list.style.getPropertyValue("--basalt-command-top")).toBe("6px"));
			fireEvent.change(screen.getByRole("combobox"), { target: { value: "nothing-matches" } });
			await waitFor(() =>
				expect(list.style.getPropertyValue("--basalt-command-width")).toBe("0px"),
			);
			expect(list).toHaveAttribute("data-basalt-command-animated", "false");
		},
	);

	it("measures nested positioning contexts without using transformed client rectangles", async () => {
		vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (
			this: HTMLElement,
		) {
			return this.hasAttribute("cmdk-item")
				? this.closest("[cmdk-group]")
				: this.closest("[cmdk-list]");
		});
		vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockReturnValue(4);
		vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockReturnValue(10);
		render(
			<CommandPalette open>
				<CommandInput />
				<CommandList>
					<CommandGroup heading="Nested" style={{ position: "relative" }}>
						<CommandItem>Nested command</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandPalette>,
		);
		await waitFor(() =>
			expect(screen.getByRole("listbox").style.getPropertyValue("--basalt-command-top")).toBe(
				"20px",
			),
		);
		expect(screen.getByRole("listbox").style.getPropertyValue("--basalt-command-left")).toBe("8px");
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
		expect(screen.getByRole("dialog")).toHaveClass("flex", "flex-col");
		expect(screen.getByRole("listbox")).toHaveClass("min-h-0");
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

	it("labels the field Command Palette when no placeholder is given", () => {
		render(
			<CommandPalette open>
				<CommandInput />
				<CommandList>
					<CommandItem>Button</CommandItem>
				</CommandList>
			</CommandPalette>,
		);
		expect(screen.getByRole("combobox")).toHaveAttribute("aria-label", "Command Palette");
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
