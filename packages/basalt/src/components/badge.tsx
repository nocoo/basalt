import type * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";
export type BadgeVariant = "soft" | "solid" | "outline";

const TONE_CLASSES: Record<BadgeTone, Record<BadgeVariant, string>> = {
	neutral: {
		soft: "border-transparent bg-basalt-foreground/6 text-basalt-foreground",
		solid: "border-transparent bg-basalt-foreground text-basalt-background",
		outline: "border-basalt-border bg-transparent text-basalt-foreground",
	},
	info: {
		soft: "border-transparent bg-basalt-info-tint text-basalt-info",
		solid: "border-transparent bg-basalt-info-solid text-basalt-info-solid-foreground",
		outline: "border-basalt-info/40 bg-transparent text-basalt-info",
	},
	success: {
		soft: "border-transparent bg-basalt-success-tint text-basalt-success",
		solid: "border-transparent bg-basalt-success-solid text-basalt-success-solid-foreground",
		outline: "border-basalt-success/40 bg-transparent text-basalt-success",
	},
	warning: {
		soft: "border-transparent bg-basalt-warning-tint text-basalt-warning",
		solid: "border-transparent bg-basalt-warning-solid text-basalt-warning-solid-foreground",
		outline: "border-basalt-warning/40 bg-transparent text-basalt-warning",
	},
	danger: {
		soft: "border-transparent bg-basalt-danger-tint text-basalt-danger",
		solid: "border-transparent bg-basalt-danger-solid text-basalt-danger-solid-foreground",
		outline: "border-basalt-danger/40 bg-transparent text-basalt-danger",
	},
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	/**
	 * Semantic status tone of the badge.
	 *
	 * @default "neutral"
	 */
	tone?: BadgeTone;

	/**
	 * Surface emphasis style for the badge.
	 *
	 * @default "soft"
	 */
	variant?: BadgeVariant;

	/**
	 * Renders a small circular dot indicator before children.
	 *
	 * @default false
	 */
	dot?: boolean;
}

export function Badge({
	className,
	tone = "neutral",
	variant = "soft",
	dot,
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={cn(
				BASALT_UI_CLASS,
				"inline-flex items-center gap-basalt-space-md rounded-basalt-full border basalt-inline font-medium",
				TONE_CLASSES[tone][variant],
				className,
			)}
			{...props}
		>
			{dot ? (
				<span className="size-basalt-1_5 rounded-basalt-full bg-current" aria-hidden="true" />
			) : null}
			{children}
		</span>
	);
}
