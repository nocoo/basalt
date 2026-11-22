import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { FOCUS_RING } from "../utils/overlay";

export type InputSize = "sm" | "default" | "lg";

const INPUT_SIZE_CLASS: Record<InputSize, string> = {
	sm: "basalt-action basalt-action-sm",
	default: "basalt-action",
	lg: "basalt-action basalt-action-lg",
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
					"flex w-full text-basalt-foreground file:border-0 file:bg-transparent file:text-basalt-base file:font-medium placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
					INPUT_SIZE_CLASS[size],
					FOCUS_RING,
					"aria-invalid:border-basalt-danger-solid aria-invalid:focus-visible:border-basalt-danger-solid",
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
