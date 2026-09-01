import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { FOCUS_BORDER } from "./overlay";

export type InputSize = "sm" | "default" | "lg";

const INPUT_SIZE_CLASS: Record<InputSize, string> = {
	sm: "h-8 px-2.5 py-1.5 text-xs",
	default: "h-9 px-3 py-2 text-sm",
	lg: "h-10 px-4 py-2 text-base",
};

const PASSWORD_MANAGER_MARKERS = {
	"data-1p-ignore": "true",
	"data-bwignore": "true",
	"data-form-type": "other",
	"data-lpignore": "true",
} as const;

export type InputProps = Omit<React.ComponentProps<"input">, "type" | "size"> & {
	/**
	 * The type of input control to render.
	 */
	type?: React.HTMLInputTypeAttribute;
	/**
	 * The visual size of the input.
	 * @default default
	 */
	size?: InputSize;
	/**
	 * Ignore password managers on this field.
	 * @default false
	 */
	passwordManagerIgnore?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, size = "default", passwordManagerIgnore = false, ...props }, ref) => (
		<input
			type={type}
			className={controlSurfaceClass(
				cn(
					"flex w-full text-basalt-foreground shadow-xs file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
					INPUT_SIZE_CLASS[size],
					FOCUS_BORDER,
					"aria-invalid:border-basalt-destructive aria-invalid:focus-visible:border-basalt-destructive",
					passwordManagerIgnore && "keeper-ignore",
					className,
				),
			)}
			ref={ref}
			{...props}
			{...(passwordManagerIgnore ? PASSWORD_MANAGER_MARKERS : {})}
		/>
	),
);
Input.displayName = "Input";
