import * as React from "react";
import { cn } from "../utils/cn";

export const InputArea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
	({ className, ...props }, ref) => (
		<textarea
			ref={ref}
			className={cn(
				"flex min-h-[80px] w-full rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 py-2 text-sm text-basalt-foreground shadow-xs ring-offset-basalt-background placeholder:text-basalt-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-basalt-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
				className,
			)}
			{...props}
		/>
	),
);
InputArea.displayName = "InputArea";
