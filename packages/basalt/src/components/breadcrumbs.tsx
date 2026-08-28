import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Breadcrumbs({
	items,
	className,
}: {
	items: { href?: string; label: ReactNode }[];
	className?: string;
}) {
	return (
		<nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
			{items.map((item, index) => (
				<span key={`${item.label}-${index}`} className="flex items-center gap-1">
					{index > 0 ? <span className="text-basalt-muted-foreground">/</span> : null}
					{item.href ? (
						<a
							href={item.href}
							className="text-basalt-muted-foreground hover:text-basalt-foreground"
						>
							{item.label}
						</a>
					) : (
						<span className="font-medium text-basalt-foreground">{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}
