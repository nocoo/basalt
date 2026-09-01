import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

export type TextVariant = "body" | "heading" | "mono";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextTone = "default" | "muted";
export type TextElement =
	| "h1"
	| "h2"
	| "h3"
	| "h4"
	| "h5"
	| "h6"
	| "p"
	| "span"
	| "label"
	| "dt"
	| "dd"
	| "li"
	| "figcaption"
	| "legend"
	| "pre"
	| "code"
	| "em"
	| "strong"
	| "small"
	| "abbr"
	| "time";

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

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
	/**
	 * Visual role. Does not infer document outline.
	 * @default "body"
	 */
	variant?: TextVariant;
	/** Type scale. Defaults by variant: body md, heading lg, mono sm. */
	size?: TextSize;
	/**
	 * Foreground tone.
	 * @default "default"
	 */
	tone?: TextTone;
	/** Rendered HTML element. Defaults by variant: body p, heading/mono span. */
	as?: TextElement;
	/**
	 * Apply semibold weight.
	 * @default false
	 */
	bold?: boolean;
	/**
	 * Ellipsize overflow on one line.
	 * @default false
	 */
	truncate?: boolean;
}

function defaultElement(variant: TextVariant): TextElement {
	return variant === "body" ? "p" : "span";
}

function defaultSize(variant: TextVariant): TextSize {
	if (variant === "heading") {
		return "lg";
	}
	if (variant === "mono") {
		return "sm";
	}
	return "md";
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
	(
		{
			as,
			bold = false,
			className,
			size,
			tone = "default",
			truncate = false,
			variant = "body",
			...props
		},
		ref,
	) => {
		const Component = as ?? defaultElement(variant);
		return React.createElement(Component, {
			...props,
			ref,
			className: cn(
				textVariants({ size: size ?? defaultSize(variant), tone }),
				variant === "heading" && "font-semibold",
				variant === "mono" && "font-mono",
				bold && "font-semibold",
				truncate && "min-w-0 truncate",
				className,
			),
		});
	},
);
Text.displayName = "Text";
