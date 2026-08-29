import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "../utils/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export const SheetDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-basalt-muted-foreground", className)}
		{...props}
	/>
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

const SIDE = {
	right:
		"fixed inset-y-0 right-0 z-50 box-border flex h-full w-80 flex-col gap-3 border-l border-basalt-border bg-basalt-popover p-6 text-sm text-basalt-popover-foreground shadow-lg",
	left: "fixed inset-y-0 left-0 z-50 box-border flex h-full w-80 flex-col gap-3 border-r border-basalt-border bg-basalt-popover p-6 text-sm text-basalt-popover-foreground shadow-lg",
	top: "fixed inset-x-0 top-0 z-50 box-border flex h-80 w-full flex-col gap-3 border-b border-basalt-border bg-basalt-popover p-6 text-sm text-basalt-popover-foreground shadow-lg",
	bottom:
		"fixed inset-x-0 bottom-0 z-50 box-border flex h-80 w-full flex-col gap-3 border-t border-basalt-border bg-basalt-popover p-6 text-sm text-basalt-popover-foreground shadow-lg",
} as const;

export type SheetSide = keyof typeof SIDE;

export const SheetContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: SheetSide }
>(({ className, side = "right", children, ...props }, ref) => (
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(SIDE[side], className)}
			{...props}
			style={{ boxSizing: "border-box", ...props.style }}
		>
			{children}
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

export const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
		{...props}
	/>
);
SheetFooter.displayName = "SheetFooter";
