import type { SVGAttributes } from "react";
import { basaltMarkPng } from "../assets/brand-mark";
import { cn } from "../utils/cn";

export type BasaltMarkProps = Omit<SVGAttributes<SVGSVGElement>, "className"> & {
	/**
	 * Additional classes for the mark.
	 */
	className?: string;
};

export function BasaltMark({ className, ...props }: BasaltMarkProps) {
	return (
		<svg
			className={cn("h-5 w-5", className)}
			viewBox="0 0 128 128"
			role="img"
			aria-label="Basalt"
			{...props}
		>
			<title>Basalt</title>
			<image href={basaltMarkPng} width="128" height="128" />
		</svg>
	);
}
