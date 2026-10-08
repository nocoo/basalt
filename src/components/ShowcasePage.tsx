import { PageHeader, type PageHeaderProps } from "@nocoo/basalt/components/page-header";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ShowcaseHeader } from "./ShowcaseHeader";

type ShowcasePageProps = PageHeaderProps &
	Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
		headerVariant?: "compact" | "library";
	};

export function ShowcasePage({
	title,
	description,
	actions,
	filters,
	breadcrumbs,
	headerVariant,
	children,
	className,
	...props
}: ShowcasePageProps) {
	const header = { title, description, actions, filters, breadcrumbs };
	return (
		<div
			data-showcase-page=""
			className={cn("min-w-0 flex flex-col gap-basalt-layout-lg", className)}
			{...props}
		>
			{headerVariant ? (
				<ShowcaseHeader variant={headerVariant} {...header} />
			) : (
				<PageHeader {...header} />
			)}
			{children}
		</div>
	);
}
