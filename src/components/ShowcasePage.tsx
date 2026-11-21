import { PageHeader, type PageHeaderProps } from "@nocoo/basalt/components/page-header";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ShowcasePageProps = Pick<
	PageHeaderProps,
	"title" | "description" | "actions" | "filters" | "breadcrumbs"
> &
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
	children,
	className,
	...props
}: ShowcasePageProps) {
	return (
		<div
			data-showcase-page=""
			data-page-variant={variant}
			className={cn(
				"min-w-0 flex flex-col gap-basalt-layout-lg",
				variant === "document" ? "max-w-[84rem]" : "max-w-[96rem]",
				className,
			)}
			{...props}
		>
			<PageHeader {...{ title, description, actions, filters, breadcrumbs }} />
			{children}
		</div>
	);
}
