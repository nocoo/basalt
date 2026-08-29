import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../utils/cn";

export const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn("relative flex w-full touch-none select-none items-center", className)}
		{...props}
	>
		<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-basalt-muted">
			<SliderPrimitive.Range className="absolute h-full bg-basalt-primary" />
		</SliderPrimitive.Track>
		<SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-basalt-primary bg-basalt-background shadow outline-hidden focus-visible:border-basalt-ring" />
	</SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
