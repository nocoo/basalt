import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { FOCUS_BORDER } from "./overlay";

export type InputAreaSize = "sm" | "default" | "lg";

const INPUT_AREA_SIZE_CLASS: Record<InputAreaSize, string> = {
	sm: "min-h-basalt-textarea-sm px-basalt-space-lg py-basalt-space-md text-basalt-sm",
	default: "min-h-basalt-textarea px-basalt-control-x py-basalt-space-lg text-basalt-base",
	lg: "min-h-basalt-textarea-lg px-basalt-control-x-lg py-basalt-space-lg text-basalt-lg",
};

const PASSWORD_MANAGER_MARKERS = {
	"data-1p-ignore": "true",
	"data-bwignore": "true",
	"data-form-type": "other",
	"data-lpignore": "true",
} as const;

export type InputAreaProps = Omit<React.ComponentProps<"textarea">, "rows"> & {
	/**
	 * The visible text row count.
	 */
	rows?: number;
	/**
	 * The visual size of the text area.
	 * @default default
	 */
	size?: InputAreaSize;
	/**
	 * Ignore password managers on this field.
	 * @default false
	 */
	passwordManagerIgnore?: boolean;
};

export const InputArea = React.forwardRef<HTMLTextAreaElement, InputAreaProps>(
	({ className, size = "default", passwordManagerIgnore = false, ...props }, ref) => (
		<textarea
			ref={ref}
			className={controlSurfaceClass(
				cn(
					"flex w-full text-basalt-foreground shadow-xs placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
					INPUT_AREA_SIZE_CLASS[size],
					FOCUS_BORDER,
					"aria-invalid:border-basalt-destructive aria-invalid:focus-visible:border-basalt-destructive",
					passwordManagerIgnore && "keeper-ignore",
					className,
				),
			)}
			{...props}
			{...(passwordManagerIgnore ? PASSWORD_MANAGER_MARKERS : {})}
		/>
	),
);
InputArea.displayName = "InputArea";
