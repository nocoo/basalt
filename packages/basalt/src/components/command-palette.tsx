import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cn(
			"flex h-full w-full flex-col overflow-hidden bg-basalt-popover text-basalt-popover-foreground",
			className,
		)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

export function CommandPalette({ children, ...props }: DialogProps) {
	return (
		<Dialog {...props}>
			<DialogContent aria-describedby={undefined} className="overflow-hidden p-0 shadow-lg">
				<DialogTitle className="sr-only">Command Palette</DialogTitle>
				<Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-basalt-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-11 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-1.5">
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
}

export const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
	<div className="flex items-center border-b border-basalt-border px-3" cmdk-input-wrapper="">
		<Search className="mr-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
		<CommandPrimitive.Input
			ref={ref}
			className={cn(
				"flex h-11 w-full bg-transparent py-3 text-sm outline-hidden placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	</div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

export const CommandList = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.List
		ref={ref}
		className={cn("max-h-72 overflow-y-auto overflow-x-hidden p-1", className)}
		{...props}
	/>
));
CommandList.displayName = CommandPrimitive.List.displayName;

export const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Empty>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Empty
		ref={ref}
		className={cn("py-6 text-center text-sm text-basalt-muted-foreground", className)}
		{...props}
	/>
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

export const CommandGroup = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Group
		ref={ref}
		className={cn("overflow-hidden p-1 text-basalt-foreground", className)}
		{...props}
	/>
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

export const CommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex cursor-default items-center gap-2 rounded-basalt-sm px-2 py-1.5 text-sm outline-hidden select-none data-[selected=true]:bg-basalt-accent data-[selected=true]:text-basalt-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
			className,
		)}
		{...props}
	/>
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

export const CommandSeparator = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 h-px bg-basalt-border", className)}
		{...props}
	/>
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn("ml-auto text-xs tracking-widest text-basalt-muted-foreground", className)}
			{...props}
		/>
	);
}
