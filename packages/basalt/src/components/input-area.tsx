import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { FOCUS_BORDER } from "./overlay";

export type InputAreaProps = Omit<React.ComponentProps<"textarea">, "rows"> & {
	/**
	 * The visible text row count.
	 */
	rows?: number;
};

export const InputArea = React.forwardRef<HTMLTextAreaElement, InputAreaProps>(
	({ className, ...props }, ref) => (
		<textarea
			ref={ref}
			className={controlSurfaceClass(
				cn(
					"flex min-h-[80px] w-full px-3 py-2 text-basalt-foreground shadow-xs placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
					FOCUS_BORDER,
					className,
				),
			)}
			{...props}
		/>
	),
);
InputArea.displayName = "InputArea";
