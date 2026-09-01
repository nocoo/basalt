import * as React from "react";
import { cn } from "../utils/cn";
import { SkeletonLine } from "./skeleton-line";

export interface StatStripItem {
	/** The visible label for this statistic. */
	label: React.ReactNode;
	/** The visible value for this statistic. */
	value: React.ReactNode;
}

export interface StatStripProps
	extends Omit<React.HTMLAttributes<HTMLDListElement>, "children" | "className"> {
	/** Additional classes for the definition list. */
	className?: string;
	/** The labelled values shown in the strip. */
	items: readonly StatStripItem[];
	/**
	 * Replace each value with a skeleton while keeping labels visible.
	 * @default false
	 */
	loading?: boolean;
}

export const StatStrip = React.forwardRef<HTMLDListElement, StatStripProps>(
	({ "aria-busy": ariaBusy, className, items, loading = false, ...props }, ref) => {
		return (
			<dl
				ref={ref}
				className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}
				{...props}
				aria-busy={loading ? true : ariaBusy}
			>
				{items.map((item, index) => (
					<div
						key={index}
						className="rounded-basalt-lg bg-basalt-muted p-4 ring-1 ring-basalt-border"
					>
						<dt className="text-sm font-medium text-basalt-muted-foreground">{item.label}</dt>
						<dd className="mt-1 text-lg font-medium tabular-nums text-basalt-foreground">
							{loading ? <SkeletonLine /> : item.value}
						</dd>
					</div>
				))}
			</dl>
		);
	},
);
StatStrip.displayName = "StatStrip";
