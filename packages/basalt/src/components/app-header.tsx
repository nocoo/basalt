import { ChevronRight } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { Breadcrumbs } from "./breadcrumbs";

export function AppHeader({
	leading,
	breadcrumbs,
	title,
	actions,
	className,
	...props
}: HTMLAttributes<HTMLElement> & {
	leading?: ReactNode;
	breadcrumbs?: { href?: string; label: ReactNode }[];
	title?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<header
			className={cn(
				"flex h-14 shrink-0 items-center justify-between gap-3 px-4 md:px-6",
				className,
			)}
			{...props}
		>
			<div className="flex min-w-0 items-center gap-3">
				{leading}
				<div className="flex min-w-0 items-center gap-1">
					{breadcrumbs && breadcrumbs.length > 0 ? (
						<>
							<Breadcrumbs items={breadcrumbs} className="min-w-0" />
							<ChevronRight
								className="size-3 shrink-0 text-basalt-muted-foreground"
								aria-hidden="true"
							/>
						</>
					) : null}
					{title ? (
						<h1 className="truncate text-lg font-semibold text-basalt-foreground md:text-xl">
							{title}
						</h1>
					) : null}
				</div>
			</div>
			{actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
		</header>
	);
}
