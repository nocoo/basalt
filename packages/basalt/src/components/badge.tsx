import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../utils/cn";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
	{
		variants: {
			variant: {
				default: "border-transparent bg-basalt-primary text-basalt-primary-foreground",
				secondary: "border-transparent bg-basalt-secondary text-basalt-foreground",
				destructive: "border-transparent bg-basalt-destructive text-basalt-destructive-foreground",
				outline: "border-basalt-border text-basalt-foreground",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
