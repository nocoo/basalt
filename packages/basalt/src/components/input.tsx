import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_BORDER } from "./overlay";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => (
		<input
			type={type}
			className={cn(
				"flex h-9 w-full rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 py-2 text-sm text-basalt-foreground shadow-xs file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
				FOCUS_BORDER,
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Input.displayName = "Input";
