import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Breadcrumbs } from "./breadcrumbs";

export interface PageHeaderBreadcrumb {
	href?: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
}

export interface PageHeaderProps {
	/** Heading scale: workspace, dashboard, or reading-focused page. @default "md" */
	size?: "md" | "lg" | "xl";
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
}

export function PageHeader({
	actions,
	breadcrumbs,
	description,
	filters,
	size = "md",
	title,
}: PageHeaderProps) {
	const titleId = React.useId();

	return (
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: the title heading names this header
		<header
			aria-labelledby={titleId}
			className={cn(BASALT_UI_CLASS, "min-w-0 shrink-0 space-y-basalt-layout")}
		>
			{breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={[...breadcrumbs]} /> : null}
			<div className="flex flex-col gap-basalt-layout md:flex-row md:items-start md:justify-between">
				<div className="min-w-0 flex-1 space-y-basalt-space-lg">
					<h1
						id={titleId}
						className={cn(
							"font-basalt-display font-semibold tracking-tight text-basalt-foreground [overflow-wrap:anywhere]",
							size === "md" && "text-basalt-3xl",
							size === "lg" && "text-basalt-4xl",
							size === "xl" && "text-basalt-4xl md:text-basalt-5xl",
							"leading-basalt-tight",
						)}
					>
						{title}
					</h1>
					{description ? (
						<p
							className={cn(
								"max-w-[65ch] text-basalt-muted-foreground [overflow-wrap:anywhere]",
								size === "md" ? "text-basalt-base" : "text-basalt-lg leading-basalt-relaxed",
							)}
						>
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
}
