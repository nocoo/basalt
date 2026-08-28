import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "../utils/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

const SIDE = {
	right:
		"fixed inset-y-0 right-0 z-50 h-full w-80 border-l border-basalt-border bg-basalt-background p-6 shadow-lg",
	left: "fixed inset-y-0 left-0 z-50 h-full w-80 border-r border-basalt-border bg-basalt-background p-6 shadow-lg",
	top: "fixed inset-x-0 top-0 z-50 h-80 w-full border-b border-basalt-border bg-basalt-background p-6 shadow-lg",
	bottom:
		"fixed inset-x-0 bottom-0 z-50 h-80 w-full border-t border-basalt-border bg-basalt-background p-6 shadow-lg",
} as const;

export type SheetSide = keyof typeof SIDE;

export const SheetContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: SheetSide }
>(({ className, side = "right", children, ...props }, ref) => (
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
		<DialogPrimitive.Content ref={ref} className={cn(SIDE[side], className)} {...props}>
			{children}
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";
