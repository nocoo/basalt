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
	/** Actions aligned beside the title on wide screens. */
	actions?: React.ReactNode;
}

export function PageHeader({ actions, breadcrumbs, description, eyebrow, title }: PageHeaderProps) {
	const titleId = React.useId();

	return (
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: the title heading names this header
		<header
			aria-labelledby={titleId}
			className="rounded-basalt-lg bg-basalt-bright p-5 shadow-xs ring-1 ring-basalt-border md:p-6"
		>
			{breadcrumbs && breadcrumbs.length > 0 ? (
				<Breadcrumbs items={[...breadcrumbs]} className="mb-3" />
			) : null}
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="min-w-0 flex-1 space-y-2">
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
				{actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
			</div>
		</header>
	);
}
