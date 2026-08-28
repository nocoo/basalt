import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const textVariants = cva("text-basalt-foreground", {
	variants: {
		size: {
			xs: "text-xs",
			sm: "text-sm",
			md: "text-sm leading-6",
			lg: "text-base",
			xl: "text-lg",
		},
		tone: {
			default: "text-basalt-foreground",
			muted: "text-basalt-muted-foreground",
		},
	},
	defaultVariants: {
		size: "md",
		tone: "default",
	},
});

export interface TextProps
	extends React.HTMLAttributes<HTMLParagraphElement>,
		VariantProps<typeof textVariants> {}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
	({ className, size, tone, ...props }, ref) => (
		<p ref={ref} className={cn(textVariants({ size, tone }), className)} {...props} />
	),
);
Text.displayName = "Text";
