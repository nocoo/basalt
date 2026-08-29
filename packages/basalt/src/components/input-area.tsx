import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_BORDER } from "./overlay";

export const InputArea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
	({ className, ...props }, ref) => (
		<textarea
			ref={ref}
			className={cn(
				"flex min-h-[80px] w-full rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 py-2 text-sm text-basalt-foreground shadow-xs placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
				FOCUS_BORDER,
				className,
			)}
			{...props}
		/>
	),
);
InputArea.displayName = "InputArea";
