import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "../utils/cn";

export const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & { size?: "default" | "sm" }
>(({ className, size = "default", ...props }, ref) => (
	<SwitchPrimitives.Root
		className={cn(
			"peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-basalt-primary data-[state=unchecked]:bg-basalt-input outline-hidden focus-visible:border-basalt-ring disabled:cursor-not-allowed disabled:opacity-50",
			size === "sm" ? "h-4 w-7" : "h-6 w-11",
			className,
		)}
		{...props}
		ref={ref}
	>
		<SwitchPrimitives.Thumb
			className={cn(
				"pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
				size === "sm"
					? "h-3 w-3 data-[state=checked]:translate-x-3"
					: "h-5 w-5 data-[state=checked]:translate-x-5",
			)}
		/>
	</SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
