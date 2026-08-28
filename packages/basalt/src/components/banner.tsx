import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

const bannerVariants = cva(
	"flex w-full items-start gap-3 rounded-basalt-md border px-4 py-3 text-sm",
	{
		variants: {
			variant: {
				default: "border-basalt-border bg-basalt-secondary text-basalt-foreground",
				alert: "border-basalt-border bg-basalt-accent text-basalt-foreground",
				error: "border-basalt-destructive/40 bg-basalt-destructive/10 text-basalt-destructive",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface BannerProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof bannerVariants> {
	title?: string;
	description?: string;
	icon?: ReactNode;
}

export function Banner({
	className,
	variant,
	title,
	description,
	icon,
	children,
	...props
}: BannerProps) {
	return (
		<div className={cn(bannerVariants({ variant }), className)} {...props}>
			{icon}
			<div className="space-y-0.5">
				{title ? <p className="font-medium">{title}</p> : null}
				{description ? <p className="text-basalt-muted-foreground">{description}</p> : null}
				{children}
			</div>
		</div>
	);
}
