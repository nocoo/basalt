import { PageHeader, type PageHeaderProps } from "@nocoo/basalt/components/page-header";

/** A scenic opening for the showcase, aligned with the content island's page grid. */
export function ShowcaseHeader({
	variant = "compact",
	...props
}: PageHeaderProps & { variant?: "library" | "compact" }) {
	return (
		<div className="showcase-header" data-showcase-header data-variant={variant}>
			<div className="showcase-header-landscape" aria-hidden="true" />
			<div className="showcase-header-content">
				<PageHeader {...props} />
			</div>
		</div>
	);
}
