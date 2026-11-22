import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandItemMeta,
	CommandItemTrailing,
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
			expect(list).toHaveClass("p-basalt-menu-inset", "relative", "isolate");
			expect(list).toHaveStyle({ maxHeight: "280px" });
			if (grouped)
				expect(document.querySelector("[cmdk-group]")).not.toHaveClass("p-basalt-space-sm");
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
					<CommandEmpty className="custom-empty">No results</CommandEmpty>
					<CommandItem>Button</CommandItem>
				</CommandList>
			</CommandPalette>,
		);
		fireEvent.change(screen.getByPlaceholderText("Search pages..."), {
			target: { value: "zzzz" },
		});
		const empty = screen.getByText("No results");
		expect(empty).toBeInTheDocument();
		expect(empty).toHaveClass(
			"py-basalt-space-lg",
			"text-center",
			"text-basalt-muted-foreground",
			"custom-empty",
		);
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

	it("omits focus-ring wrappers on the search header and supports leading/trailing slots", () => {
		render(
			<CommandPalette open size="xl" className="custom-panel">
				<CommandInput
					placeholder="Search for conversations..."
					leading={<button type="button">Conversations</button>}
					trailing={<button type="button">Filter</button>}
				/>
				<CommandList>
					<CommandItem>
						<span>Sys2: 工作流编制</span>
						<CommandItemMeta>system</CommandItemMeta>
						<CommandItemTrailing>now</CommandItemTrailing>
					</CommandItem>
				</CommandList>
			</CommandPalette>,
		);
		const dialog = screen.getByRole("dialog");
		expect(dialog).toHaveClass(
			"top-[min(14vh,7rem)]",
			"translate-y-0",
			"max-h-[calc(100dvh-min(14vh,7rem)-var(--basalt-space-layout))]",
			"sm:w-[48rem]",
			"p-0",
			"sm:p-0",
			"custom-panel",
		);
		expect(dialog).not.toHaveClass("bg-basalt-muted", "shadow-lg");
		const input = screen.getByRole("combobox");
		expect(input).not.toHaveClass("basalt-action");
		expect(input).toHaveClass("outline-none", "focus-visible:outline-none");
		const wrapper = input.closest("[cmdk-input-wrapper]");
		expect(wrapper).not.toHaveClass("basalt-focus-group", "basalt-focus-inset");
		expect(screen.getByRole("button", { name: "Conversations" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
		expect(screen.getByText("system")).toHaveClass("text-basalt-muted-foreground");
		expect(screen.getByText("now")).toHaveClass("ml-auto", "tabular-nums");
	});

	it("omits default search icon when leading is null", () => {
		render(
			<CommandPalette open>
				<CommandInput leading={null} placeholder="Bare input" />
				<CommandList>
					<CommandItem>Item</CommandItem>
				</CommandList>
			</CommandPalette>,
		);
		const wrapper = screen.getByRole("combobox").closest("[cmdk-input-wrapper]");
		expect(wrapper?.querySelector("svg")).toBeNull();
	});
});
