import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Breadcrumbs } from "./breadcrumbs";

export interface PageHeaderBreadcrumb {
	href?: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
}

export interface PageHeaderProps
	extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "className"> {
	/** The page title, rendered as the only heading. */
	title: React.ReactNode;
	/** Supporting text below the title. */
	description?: React.ReactNode;
	/** Trail of parent pages. */
	breadcrumbs?: readonly PageHeaderBreadcrumb[];
	/** Right-side title-row actions. Put the create button last. */
	actions?: React.ReactNode;
	/** Own-row filters. Keep short filters in actions. */
	filters?: React.ReactNode;
	/**
	 * Heading visual scale.
	 * @default "lg"
	 */
	size?: "md" | "lg";
	/** Additional classes for the header root. */
	className?: string;
}

export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
	(
		{ actions, breadcrumbs, className, description, filters, size = "lg", title, ...props },
		ref,
	) => {
		const titleId = React.useId();

		return (
			// biome-ignore lint/a11y/useAriaPropsSupportedByRole: the title heading names this header
			<header
				ref={ref}
				data-slot="page-header"
				data-size={size}
				aria-labelledby={titleId}
				className={cn(BASALT_UI_CLASS, "min-w-0 shrink-0 space-y-basalt-layout", className)}
				{...props}
			>
				{breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={[...breadcrumbs]} /> : null}
				<div className="flex flex-col gap-basalt-layout md:flex-row md:items-start md:justify-between">
					<div className="min-w-0 flex-1 space-y-basalt-space-lg">
						<h1
							id={titleId}
							className={cn(
								"font-basalt-display font-semibold leading-basalt-tight text-basalt-foreground [overflow-wrap:anywhere]",
								size === "md" ? "text-basalt-xl" : "text-basalt-3xl",
							)}
						>
							{title}
						</h1>
						{description ? (
							<p className="max-w-[65ch] text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground [overflow-wrap:anywhere]">
								{description}
							</p>
						) : null}
					</div>
					{actions ? (
						<div className="flex flex-wrap items-center justify-end gap-basalt-space-lg">
							{actions}
						</div>
					) : null}
				</div>
				{filters ? (
					<div className="flex flex-wrap items-center gap-basalt-space-lg">{filters}</div>
				) : null}
			</header>
		);
	},
);
PageHeader.displayName = "PageHeader";
