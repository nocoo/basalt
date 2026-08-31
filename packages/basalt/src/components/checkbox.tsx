import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_RING } from "./overlay";

export type CheckboxProps = Omit<
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
	"checked"
> & {
	/**
	 * The controlled checked state of the checkbox.
	 */
	checked?: boolean | "indeterminate";
};

export const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"group peer h-4 w-4 shrink-0 rounded-[4px] border border-basalt-primary data-[state=checked]:bg-basalt-primary data-[state=checked]:text-basalt-primary-foreground data-[state=indeterminate]:bg-basalt-primary data-[state=indeterminate]:text-basalt-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
			FOCUS_RING,
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
			<Check className="hidden h-4 w-4 group-data-[state=checked]:block" />
			<Minus className="hidden h-3 w-3 group-data-[state=indeterminate]:block" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
