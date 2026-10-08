import { PageHeader, type PageHeaderProps } from "@nocoo/basalt/components/page-header";

export function ShowcaseHeader({
	variant = "compact",
	...props
}: PageHeaderProps & { variant?: "library" | "compact" }) {
	return (
		<div className="showcase-header" data-showcase-header data-variant={variant}>
			<div className="showcase-header-content">
				<PageHeader {...props} />
			</div>
		</div>
	);
}
