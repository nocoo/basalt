import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export type SpinnerSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<SpinnerSize, string> = {
	sm: "size-basalt-icon-sm",
	md: "size-basalt-icon",
	lg: "size-basalt-6",
};

export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<"svg">, "children"> {
	/**
	 * Visual diameter of the spinner ring.
	 * @default "md"
	 */
	size?: SpinnerSize;
	/**
	 * Accessible status label announced when the spinner is not marked decorative.
	 * @default "Loading"
	 */
	label?: string;
}

/** Matte rotating ring indicator for inline and localized busy states. */
export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
	{
		size = "md",
		label = "Loading",
		className,
		"aria-hidden": ariaHidden,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		...props
	},
	ref,
) {
	const decorative = ariaHidden === true || ariaHidden === "true";

	return (
		<svg
			ref={ref}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			data-slot="spinner"
			data-size={size}
			role={decorative ? undefined : "status"}
			aria-hidden={ariaHidden}
			aria-label={decorative || ariaLabelledBy ? undefined : (ariaLabel ?? label)}
			aria-labelledby={ariaLabelledBy}
			className={cn(
				BASALT_UI_CLASS,
				"shrink-0 animate-basalt-spin motion-reduce:animate-none",
				SIZE_CLASSES[size],
				className,
			)}
			{...props}
		>
			<circle cx="12" cy="12" r="9" strokeOpacity={0.2} />
			<path d="M21 12a9 9 0 0 0-9-9" />
		</svg>
	);
});

Spinner.displayName = "Spinner";
