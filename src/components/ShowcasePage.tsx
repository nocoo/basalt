import { PageHeader, type PageHeaderProps } from "@nocoo/basalt/components/page-header";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ShowcasePageProps = PageHeaderProps &
	Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
		variant?: "application" | "document";
	};

export function ShowcasePage({
	title,
	description,
	actions,
	filters,
	breadcrumbs,
	variant = "application",
	size = variant === "document" ? "xl" : "md",
	children,
	className,
	...props
}: ShowcasePageProps) {
	return (
		<div
			data-showcase-page=""
			data-page-variant={variant}
			className={cn(
				"min-w-0 flex flex-col",
				variant === "document" ? "gap-basalt-layout-xl" : "gap-basalt-layout-lg",
				className,
			)}
			{...props}
		>
			<PageHeader {...{ title, description, actions, filters, breadcrumbs, size }} />
			{children}
		</div>
	);
}
