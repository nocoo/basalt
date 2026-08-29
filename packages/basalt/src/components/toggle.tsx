import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const toggleVariants = cva(
	"inline-flex items-center justify-center rounded-basalt-md text-sm font-medium transition-colors hover:bg-basalt-accent data-[state=on]:bg-basalt-accent outline-hidden focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-basalt-ring",
	{
		variants: {
			variant: {
				default: "bg-basalt-muted text-basalt-foreground",
				outline:
					"border border-basalt-border bg-basalt-secondary focus-visible:border-basalt-ring focus-visible:ring-0",
			},
			size: { default: "h-9 px-3", sm: "h-8 px-2 text-xs", lg: "h-10 px-4" },
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

export const Toggle = React.forwardRef<
	React.ElementRef<typeof TogglePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
	<TogglePrimitive.Root
		ref={ref}
		className={cn(toggleVariants({ variant, size }), className)}
		{...props}
	/>
));
Toggle.displayName = TogglePrimitive.Root.displayName;
