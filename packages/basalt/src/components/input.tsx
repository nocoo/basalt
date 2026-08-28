import * as React from "react";
import { cn } from "../utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => (
		<input
			type={type}
			className={cn(
				"flex h-9 w-full rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 py-2 text-sm text-basalt-foreground shadow-xs ring-offset-basalt-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-basalt-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-basalt-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Input.displayName = "Input";
