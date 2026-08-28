import { ChevronRight } from "lucide-react";
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
		<nav
			aria-label="Breadcrumb"
			className={cn("flex items-center gap-1 text-sm text-basalt-muted-foreground", className)}
		>
			{items.map((item, index) => (
				<span key={`${String(item.label)}-${index}`} className="flex items-center gap-1">
					{index > 0 ? <ChevronRight className="size-3" aria-hidden="true" /> : null}
					{item.href ? (
						<a href={item.href} className="transition-colors hover:text-basalt-foreground">
							{item.label}
						</a>
					) : (
						<span aria-current="page" className="font-medium text-basalt-foreground">
							{item.label}
						</span>
					)}
				</span>
			))}
		</nav>
	);
}
