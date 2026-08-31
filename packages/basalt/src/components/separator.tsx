import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";
import { cn } from "../utils/cn";

export type SeparatorProps = Omit<
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
	"orientation" | "decorative"
> & {
	/**
	 * The orientation of the separator.
	 * @default horizontal
	 */
	orientation?: "horizontal" | "vertical";
	/**
	 * Whether the separator is purely decorative.
	 * @default true
	 */
	decorative?: boolean;
};

export const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
	<SeparatorPrimitive.Root
		ref={ref}
		decorative={decorative}
		orientation={orientation}
		className={cn(
			"shrink-0 bg-basalt-border",
			orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
			className,
		)}
		{...props}
	/>
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
