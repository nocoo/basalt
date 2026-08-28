import * as React from "react";
import { cn } from "../utils/cn";

export const InputArea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
	({ className, ...props }, ref) => (
		<textarea
			ref={ref}
			className={cn(
				"flex min-h-[80px] w-full rounded-md border border-basalt-input bg-basalt-background px-3 py-2 text-sm text-basalt-foreground ring-offset-basalt-background placeholder:text-basalt-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-basalt-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	),
);
InputArea.displayName = "InputArea";
