import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const layerCardVariants = cva("flex flex-col rounded-lg text-basalt-card-foreground", {
	variants: {
		surface: {
			plain: "bg-basalt-card",
			bordered: "border border-basalt-border bg-basalt-card",
		},
	},
	defaultVariants: {
		surface: "plain",
	},
});

export interface LayerCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof layerCardVariants> {}

export const LayerCard = React.forwardRef<HTMLDivElement, LayerCardProps>(
	({ className, surface, ...props }, ref) => (
		<div ref={ref} className={cn(layerCardVariants({ surface }), className)} {...props} />
	),
);
LayerCard.displayName = "LayerCard";
