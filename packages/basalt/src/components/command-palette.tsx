import { Command } from "cmdk";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export function CommandPalette({ className, ...props }: ComponentProps<typeof Command>) {
	return (
		<Command
			className={cn(
				"overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover text-basalt-popover-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export const CommandInput = Command.Input;
export const CommandList = Command.List;
export const CommandItem = Command.Item;
export const CommandEmpty = Command.Empty;
export const CommandGroup = Command.Group;
