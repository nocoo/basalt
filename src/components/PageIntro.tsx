import { PageHeader } from "@nocoo/basalt/components/page-header";
import type { ReactNode } from "react";

interface PageIntroProps {
	title: string;
	description: string;
	eyebrow?: string;
	icon?: React.ElementType;
	actions?: ReactNode;
	filters?: ReactNode;
}

export function PageIntro({
	title,
	description,
	eyebrow,
	icon: Icon,
	actions,
	filters,
}: PageIntroProps) {
	return (
		<PageHeader
			title={title}
			description={description}
			eyebrow={
				eyebrow ? (
					<span className="inline-flex items-center gap-2">
						{Icon ? <Icon className="h-4 w-4" strokeWidth={1.5} /> : null}
						{eyebrow}
					</span>
				) : undefined
			}
			actions={actions}
			filters={filters}
		/>
	);
}
