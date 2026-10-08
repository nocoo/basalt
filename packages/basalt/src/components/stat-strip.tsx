import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
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
				className={cn(
					BASALT_UI_CLASS,
					"grid grid-cols-2 gap-basalt-layout md:grid-cols-4",
					className,
				)}
				{...props}
				aria-busy={loading ? true : ariaBusy}
			>
				{items.map((item, index) => (
					<div key={index} data-basalt-surface="" className="rounded-basalt-lg p-basalt-card">
						<dt className="text-basalt-base font-medium text-basalt-muted-foreground">
							{item.label}
						</dt>
						<dd className="mt-basalt-space-sm text-basalt-xl font-medium tabular-nums text-basalt-foreground">
							{loading ? <SkeletonLine /> : item.value}
						</dd>
					</div>
				))}
			</dl>
		);
	},
);
StatStrip.displayName = "StatStrip";
