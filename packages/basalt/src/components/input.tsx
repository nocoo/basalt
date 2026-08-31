import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { FOCUS_BORDER } from "./overlay";

export type InputProps = Omit<React.ComponentProps<"input">, "type"> & {
	/**
	 * The type of input control to render.
	 */
	type?: React.HTMLInputTypeAttribute;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => (
		<input
			type={type}
			className={controlSurfaceClass(
				cn(
					"flex h-9 w-full px-3 py-2 text-basalt-foreground shadow-xs file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
					FOCUS_BORDER,
					className,
				),
			)}
			ref={ref}
			{...props}
		/>
	),
);
Input.displayName = "Input";
