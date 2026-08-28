import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../utils/cn";

const badgeVariants = cva(
	"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
	{
		variants: {
			variant: {
				default: "border-transparent bg-basalt-primary text-basalt-primary-foreground",
				secondary: "border-transparent bg-basalt-secondary text-basalt-foreground",
				destructive: "border-transparent bg-basalt-destructive text-basalt-destructive-foreground",
				outline: "border-basalt-border text-basalt-foreground",
				success: "border-transparent bg-basalt-heatmap-green-3 text-white",
				warning: "border-transparent bg-basalt-heatmap-orange-3 text-white",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {
	dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props}>
			{dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
			{children}
		</span>
	);
}
