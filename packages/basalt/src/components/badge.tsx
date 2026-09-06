import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

const badgeVariants = cva(
	"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
	{
		variants: {
			variant: {
				default: "border-transparent bg-basalt-primary text-basalt-primary-foreground",
				secondary: "border-transparent bg-basalt-secondary text-basalt-foreground",
				destructive: "border-transparent bg-basalt-destructive text-basalt-destructive-foreground",
				outline: "border-basalt-border text-basalt-foreground",
				info: "border-transparent bg-basalt-info-tint text-basalt-info",
				success: "border-transparent bg-basalt-heatmap-green-3 text-basalt-badge-green-foreground",
				warning: "border-transparent bg-basalt-warning-tint text-basalt-warning",
				error: "border-transparent bg-basalt-danger-tint text-basalt-danger",
				red: "border-transparent bg-basalt-danger text-basalt-danger-foreground",
				orange: "border-transparent bg-basalt-warning text-basalt-warning-foreground",
				teal: "border-transparent bg-basalt-chart-3 text-basalt-badge-teal-foreground",
				blue: "border-transparent bg-basalt-info text-basalt-info-foreground",
				purple: "border-transparent bg-basalt-chart-14 text-basalt-badge-purple-foreground",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		Omit<VariantProps<typeof badgeVariants>, "variant"> {
	/**
	 * Visual style variant for the badge.
	 *
	 * Note: Supports standard semantic tones and decorative color tokens.
	 * Pass null to omit variant styling.
	 *
	 * @default "default"
	 */
	variant?: VariantProps<typeof badgeVariants>["variant"];

	/**
	 * Renders a small circular dot indicator before children.
	 *
	 * @default false
	 */
	dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
	return (
		<span className={cn(BASALT_UI_CLASS, badgeVariants({ variant }), className)} {...props}>
			{dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
			{children}
		</span>
	);
}
