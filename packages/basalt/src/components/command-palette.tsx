import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { useSelectionIndicator } from "../utils/selection-indicator";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog";

const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cn(
			"flex min-h-0 w-full flex-col overflow-hidden rounded-basalt-md bg-basalt-popover text-basalt-popover-foreground",
			className,
		)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

export interface CommandPaletteProps
	extends Omit<DialogProps, "open" | "defaultOpen" | "onOpenChange" | "children" | "modal"> {
	/**
	 * Command palette structure elements, including CommandPaletteTrigger and inner command items.
	 * Note: Triggers must be direct children of CommandPalette (child.type === CommandPaletteTrigger)
	 * to be separated from modal dialog content. Wrapping triggers in Fragments or HOCs will cause
	 * them to be treated as modal content.
	 */
	children?: React.ReactNode;
	/**
	 * The controlled open state of the command palette dialog.
	 */
	open?: boolean;
	/**
	 * The uncontrolled initial open state of the command palette dialog.
	 * @default false
	 */
	defaultOpen?: boolean;
	/**
	 * Called when the open state changes.
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Filter items as the query changes.
	 * @default true
	 */
	shouldFilter?: boolean;
	/**
	 * The modality of the dialog. When set to true, interaction with outside elements
	 * will be disabled and only dialog content will be visible to screen readers.
	 * @default true
	 */
	modal?: boolean;
}

type RadixDialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;

export interface CommandPaletteTriggerProps extends Omit<RadixDialogTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * CommandPaletteTrigger is an alias for DialogTrigger; forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixDialogTriggerProps["asChild"];
}

export const CommandPaletteTrigger = DialogTrigger;

export function CommandPalette({ children, shouldFilter, ...props }: CommandPaletteProps) {
	const kids = React.Children.toArray(children);
	const triggers = kids.filter(
		(child) => React.isValidElement(child) && child.type === CommandPaletteTrigger,
	);
	const content = kids.filter(
		(child) => !(React.isValidElement(child) && child.type === CommandPaletteTrigger),
	);
	return (
		<Dialog {...props}>
			{triggers}
			<DialogContent
				size="lg"
				aria-describedby={undefined}
				className="flex flex-col overflow-hidden bg-basalt-popover p-0 shadow-lg"
			>
				<DialogTitle className="sr-only">Command Palette</DialogTitle>
				<Command
					label="Command Palette"
					{...(shouldFilter !== undefined && { shouldFilter })}
					className="[&_[cmdk-group-heading]]:px-basalt-space-lg [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-basalt-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-basalt-5 [&_[cmdk-input-wrapper]_svg]:w-basalt-5 [&_[cmdk-input]]:min-h-basalt-control [&_[cmdk-item]]:px-basalt-space-lg [&_[cmdk-item]]:py-basalt-space-md [&_[cmdk-item]_svg]:h-basalt-4 [&_[cmdk-item]_svg]:w-basalt-4"
				>
					{content}
				</Command>
			</DialogContent>
		</Dialog>
	);
}

type RadixCommandInputProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;

export interface CommandInputProps
	extends Omit<RadixCommandInputProps, "value" | "onValueChange" | "asChild"> {
	/**
	 * Optional controlled state for the search input value.
	 * Note: Underlying cmdk input excludes standard onChange/type props in favor of value/onValueChange.
	 */
	value?: RadixCommandInputProps["value"];
	/**
	 * Event handler called when the search value changes.
	 */
	onValueChange?: RadixCommandInputProps["onValueChange"];
	/**
	 * Change the default rendered input element to the child element, merging props and behavior.
	 * CommandInput forwards ref to HTMLInputElement and inherits native input attributes (excluding onChange/type).
	 * Note: When aria-label is omitted, defaults to placeholder if string, or "Command Palette".
	 * @default false
	 */
	asChild?: RadixCommandInputProps["asChild"];
}

export const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	CommandInputProps
>(({ className, ...props }, ref) => (
	<div
		className="flex shrink-0 items-center border-b border-basalt-border px-basalt-space-lg"
		cmdk-input-wrapper=""
	>
		<Search
			className="mr-basalt-space-lg size-basalt-icon-lg shrink-0 opacity-50"
			aria-hidden="true"
		/>
		<CommandPrimitive.Input
			ref={ref}
			className={cn(
				"basalt-action flex min-w-0 w-full rounded-basalt-md bg-transparent outline-hidden ring-0 shadow-none placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
			aria-label={
				props["aria-label"] ??
				(typeof props.placeholder === "string" ? props.placeholder : "Command Palette")
			}
		/>
	</div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

type RadixCommandListProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>;

export interface CommandListProps extends Omit<RadixCommandListProps, "label" | "asChild"> {
	/**
	 * Accessible label for this list of suggestions. Not shown visibly.
	 * @default "Suggestions"
	 */
	label?: RadixCommandListProps["label"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * CommandList forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixCommandListProps["asChild"];
}

function measureCommandItem(item: HTMLElement, root: HTMLElement) {
	let left = 0;
	let top = 0;
	for (
		let node: HTMLElement | null = item;
		node && node !== root;
		node = node.offsetParent as HTMLElement | null
	) {
		left += node.offsetLeft;
		top += node.offsetTop;
	}
	return { left, top, width: item.offsetWidth, height: item.offsetHeight };
}

export const CommandList = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.List>,
	CommandListProps
>(({ className, style, ...props }, ref) => {
	const { ref: listRef, state } = useSelectionIndicator({
		itemSelector: '[cmdk-item][data-selected="true"]:not([data-disabled="true"])',
		mapGeometry: measureCommandItem,
		ref,
	});
	return (
		<CommandPrimitive.List
			ref={listRef}
			className={cn(
				"basalt-command-list relative isolate min-h-0 max-h-[18.75rem] overflow-y-auto overflow-x-hidden p-basalt-menu-inset",
				className,
			)}
			{...props}
			data-basalt-command-animated={state.animated}
			style={
				{
					"--basalt-command-left": `${state.left}px`,
					"--basalt-command-top": `${state.top}px`,
					"--basalt-command-width": `${state.visible ? state.width : 0}px`,
					"--basalt-command-height": `${state.visible ? state.height : 0}px`,
					...style,
				} as React.CSSProperties
			}
		/>
	);
});
CommandList.displayName = CommandPrimitive.List.displayName;

type RadixCommandEmptyProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>;

export interface CommandEmptyProps extends Omit<RadixCommandEmptyProps, "asChild"> {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * CommandEmpty forwards ref to HTMLDivElement and inherits native div attributes.
	 * Note: cmdk Empty does not support forceMount.
	 * @default false
	 */
	asChild?: RadixCommandEmptyProps["asChild"];
}

export const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Empty>,
	CommandEmptyProps
>((props, ref) => (
	<CommandPrimitive.Empty
		ref={ref}
		className="py-basalt-space-lg text-center text-basalt-base text-basalt-muted-foreground"
		{...props}
	/>
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

type RadixCommandGroupProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>;

export interface CommandGroupProps
	extends Omit<RadixCommandGroupProps, "heading" | "value" | "forceMount" | "asChild"> {
	/**
	 * Heading to render for this group of command items.
	 */
	heading?: RadixCommandGroupProps["heading"];
	/**
	 * Unique value identifying this group. If no heading is provided, value must be specified.
	 */
	value?: RadixCommandGroupProps["value"];
	/**
	 * Whether this group is forcibly rendered regardless of filtering state.
	 */
	forceMount?: RadixCommandGroupProps["forceMount"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * CommandGroup forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixCommandGroupProps["asChild"];
}

export const CommandGroup = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Group>,
	CommandGroupProps
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Group
		ref={ref}
		className={cn(
			"overflow-hidden py-basalt-space-sm text-basalt-foreground [&_[cmdk-group-heading]]:px-basalt-space-lg [&_[cmdk-group-heading]]:py-basalt-space-md [&_[cmdk-group-heading]]:text-basalt-sm [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-basalt-muted-foreground",
			className,
		)}
		{...props}
	/>
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

type RadixCommandSeparatorProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>;

export interface CommandSeparatorProps
	extends Omit<RadixCommandSeparatorProps, "alwaysRender" | "asChild"> {
	/**
	 * Whether this separator should always be rendered. Useful when automatic filtering is disabled.
	 * When false (default), visible only when the search query is empty.
	 */
	alwaysRender?: RadixCommandSeparatorProps["alwaysRender"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * CommandSeparator forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixCommandSeparatorProps["asChild"];
}

export const CommandSeparator = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Separator>,
	CommandSeparatorProps
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Separator
		ref={ref}
		className={cn("-mx-basalt-space-sm h-px bg-basalt-border", className)}
		{...props}
	/>
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

type RadixCommandItemProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>;

export interface CommandItemProps
	extends Omit<
		RadixCommandItemProps,
		"disabled" | "onSelect" | "value" | "keywords" | "forceMount" | "asChild"
	> {
	/**
	 * Whether this item is currently disabled from selection.
	 * @default false
	 */
	disabled?: RadixCommandItemProps["disabled"];
	/**
	 * Event handler called when this item is selected via click or keyboard.
	 * Note: cmdk passes the item's resolved value string `(value: string) => void`,
	 * not a standard DOM SelectEvent.
	 */
	onSelect?: RadixCommandItemProps["onSelect"];
	/**
	 * Unique value identifying this item during filtering and selection.
	 * Inferred from children/textContent if omitted.
	 */
	value?: RadixCommandItemProps["value"];
	/**
	 * Optional additional keywords matched during filtering.
	 */
	keywords?: RadixCommandItemProps["keywords"];
	/**
	 * Whether this item is forcibly rendered regardless of query filtering.
	 * Inherits forceMount from parent CommandGroup when omitted.
	 */
	forceMount?: RadixCommandItemProps["forceMount"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * CommandItem forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixCommandItemProps["asChild"];
}

export const CommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	CommandItemProps
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={cn(
			"relative z-10 flex cursor-default items-center rounded-basalt-sm px-basalt-menu-x py-basalt-menu-y text-basalt-base leading-basalt-row outline-hidden select-none data-[disabled=true]:pointer-events-none data-[selected=true]:text-basalt-accent-foreground data-[disabled=true]:opacity-50",
			className,
		)}
		{...props}
	/>
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

export interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function CommandShortcut({ className, ...props }: CommandShortcutProps) {
	return (
		<span
			className={cn(
				"ml-auto text-basalt-sm tracking-widest text-basalt-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}
CommandShortcut.displayName = "CommandShortcut";
