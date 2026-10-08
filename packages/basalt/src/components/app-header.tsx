import { ChevronRight } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Breadcrumbs } from "./breadcrumbs";

export function AppHeader({
	leading,
	breadcrumbs,
	title,
	actions,
	sticky = false,
	density = "comfortable",
	className,
	...props
}: HTMLAttributes<HTMLElement> & {
	leading?: ReactNode;
	breadcrumbs?: { href?: string; label: ReactNode }[];
	title?: ReactNode;
	actions?: ReactNode;
	/** Keep this row visible in its current scroll owner, including the shell safe area. */
	sticky?: boolean;
	/** Compact is a 52px row; comfortable is 56px. */
	density?: "comfortable" | "compact";
}) {
	return (
		<header
			data-basalt-header=""
			data-sticky={sticky || undefined}
			data-density={density}
			className={cn(
				BASALT_UI_CLASS,
				"flex shrink-0 items-center justify-between gap-basalt-space-lg px-basalt-space-lg md:px-basalt-space-lg",
				density === "compact" ? "h-[3.25rem]" : "h-basalt-14",
				className,
			)}
			{...props}
		>
			<div className="flex min-w-0 items-center gap-basalt-space-lg">
				{leading ? (
					<div data-basalt-header-leading="" className="flex shrink-0 items-center">
						{leading}
					</div>
				) : null}
				<div className="flex min-w-0 items-center gap-basalt-space-sm">
					{breadcrumbs && breadcrumbs.length > 0 ? (
						<>
							<Breadcrumbs items={breadcrumbs} className="min-w-0" />
							<ChevronRight
								className="size-basalt-icon-sm shrink-0 text-basalt-muted-foreground"
								aria-hidden="true"
							/>
						</>
					) : null}
					{title ? (
						<h1 className="truncate text-basalt-base font-normal text-basalt-foreground">
							{title}
						</h1>
					) : null}
				</div>
			</div>
			{actions ? (
				<div
					data-basalt-header-actions=""
					className="flex shrink-0 items-center gap-basalt-space-sm"
				>
					{actions}
				</div>
			) : null}
		</header>
	);
}
