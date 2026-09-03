import * as React from "react";
import { Breadcrumbs } from "./breadcrumbs";

export interface PageHeaderBreadcrumb {
	href?: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
}

export interface PageHeaderProps {
	/** The page title, rendered as the only heading. */
	title: React.ReactNode;
	/** Supporting text below the title. */
	description?: React.ReactNode;
	/** A short label above the title. */
	eyebrow?: React.ReactNode;
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
	eyebrow,
	filters,
	title,
}: PageHeaderProps) {
	const titleId = React.useId();

	return (
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: the title heading names this header
		<header aria-labelledby={titleId} className="space-y-4">
			{breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={[...breadcrumbs]} /> : null}
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="min-w-0 flex-1 space-y-1">
					{eyebrow ? (
						<p className="text-xs font-medium text-basalt-muted-foreground">{eyebrow}</p>
					) : null}
					<h1 id={titleId} className="text-2xl font-semibold tracking-tight text-basalt-foreground">
						{title}
					</h1>
					{description ? (
						<p className="text-sm text-basalt-muted-foreground">{description}</p>
					) : null}
				</div>
				{actions ? (
					<div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
				) : null}
			</div>
			{filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
		</header>
	);
}
