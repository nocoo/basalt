import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";

export const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
	<RadioGroupPrimitive.Root ref={ref} className={cn("grid gap-2", className)} {...props} />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export const Radio = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
	<RadioGroupPrimitive.Item
		ref={ref}
		className={cn(
			"aspect-square h-4 w-4 rounded-full border border-basalt-primary text-basalt-primary ring-offset-basalt-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-basalt-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}
	>
		<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
			<Circle className="h-2.5 w-2.5 fill-current text-current" />
		</RadioGroupPrimitive.Indicator>
	</RadioGroupPrimitive.Item>
));
Radio.displayName = RadioGroupPrimitive.Item.displayName;
