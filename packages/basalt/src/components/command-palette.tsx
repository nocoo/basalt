import { Command } from "cmdk";
import * as React from "react";
import { cn } from "../utils/cn";

export function CommandPalette({ className, ...props }: React.ComponentProps<typeof Command>) {
	return (
		<Command
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover text-sm text-basalt-popover-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export const CommandInput = React.forwardRef<
	React.ElementRef<typeof Command.Input>,
	React.ComponentPropsWithoutRef<typeof Command.Input>
>(({ className, ...props }, ref) => (
	<Command.Input
		ref={ref}
		className={cn(
			"flex h-10 w-full border-b border-basalt-border bg-transparent px-3 text-sm outline-hidden placeholder:text-basalt-muted-foreground",
			className,
		)}
		{...props}
	/>
));
CommandInput.displayName = Command.Input.displayName;

export const CommandList = React.forwardRef<
	React.ElementRef<typeof Command.List>,
	React.ComponentPropsWithoutRef<typeof Command.List>
>(({ className, ...props }, ref) => (
	<Command.List ref={ref} className={cn("max-h-64 overflow-y-auto p-1", className)} {...props} />
));
CommandList.displayName = Command.List.displayName;

export const CommandItem = React.forwardRef<
	React.ElementRef<typeof Command.Item>,
	React.ComponentPropsWithoutRef<typeof Command.Item>
>(({ className, ...props }, ref) => (
	<Command.Item
		ref={ref}
		className={cn(
			"relative flex h-8 cursor-default items-center rounded-basalt-sm px-2 text-sm outline-hidden select-none data-[selected=true]:bg-basalt-accent",
			className,
		)}
		{...props}
	/>
));
CommandItem.displayName = Command.Item.displayName;

export const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof Command.Empty>,
	React.ComponentPropsWithoutRef<typeof Command.Empty>
>(({ className, ...props }, ref) => (
	<Command.Empty
		ref={ref}
		className={cn("px-2 py-6 text-center text-sm text-basalt-muted-foreground", className)}
		{...props}
	/>
));
CommandEmpty.displayName = Command.Empty.displayName;

export const CommandGroup = Command.Group;
