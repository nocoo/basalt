import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Link } from "./link";

const crumbTypeClass = "text-sm font-normal";

export interface BreadcrumbItem {
	/**
	 * Navigation target URL. When omitted, item renders as unlinked text (and only receives aria-current="page" if it is the final item).
	 */
	href?: string;
	/**
	 * Content label rendered inside the breadcrumb segment.
	 */
	label: ReactNode;
	/**
	 * Optional leading icon rendered before the label.
	 */
	icon?: ReactNode;
}

export interface BreadcrumbsProps {
	/**
	 * List of breadcrumb segments ({ label: ReactNode, href?: string, icon?: ReactNode }[]) in hierarchical order from root to current page.
	 * Only the final item in the array without an href receives aria-current="page".
	 * Interactive items render via Link, delegating routing to LinkProvider when configured.
	 * Component only accepts items and className without native HTML rest attribute forwarding or forwarded ref.
	 */
	items: BreadcrumbItem[];
	/**
	 * Optional class name applied to the outer nav element.
	 */
	className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
	return (
		<nav
			aria-label="Breadcrumb"
			className={cn(
				BASALT_UI_CLASS,
				"flex items-center gap-1 text-sm font-normal text-basalt-muted-foreground",
				className,
			)}
		>
			{items.map((item, index) => {
				const current = index === items.length - 1 && !item.href;
				const label = item.icon ? (
					<span className="inline-flex items-center gap-1">
						{item.icon}
						{item.label}
					</span>
				) : (
					item.label
				);
				return (
					<span key={`${String(item.label)}-${index}`} className="flex items-center gap-1">
						{index > 0 ? <ChevronRight className="size-3" aria-hidden="true" /> : null}
						{item.href ? (
							<Link
								href={item.href}
								className={cn(
									crumbTypeClass,
									"text-basalt-muted-foreground no-underline transition-colors hover:text-basalt-foreground",
								)}
							>
								{label}
							</Link>
						) : (
							<span
								aria-current={current ? "page" : undefined}
								className={cn(
									crumbTypeClass,
									current ? "text-basalt-foreground" : "text-basalt-muted-foreground",
								)}
							>
								{label}
							</span>
						)}
					</span>
				);
			})}
		</nav>
	);
}
