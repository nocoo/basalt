import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { Link } from "./link";

export function Breadcrumbs({
	items,
	className,
}: {
	items: { href?: string; label: ReactNode; icon?: ReactNode }[];
	className?: string;
}) {
	return (
		<nav
			aria-label="Breadcrumb"
			className={cn("flex items-center gap-1 text-sm text-basalt-muted-foreground", className)}
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
								className="text-basalt-muted-foreground no-underline transition-colors hover:text-basalt-foreground"
							>
								{label}
							</Link>
						) : (
							<span
								aria-current={current ? "page" : undefined}
								className={cn(current && "font-medium text-basalt-foreground")}
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
