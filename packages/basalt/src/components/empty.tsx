import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export function Empty({
	title = "No results",
	description,
	icon,
	className,
	...props
}: HTMLAttributes<HTMLDivElement> & { title?: string; description?: string; icon?: ReactNode }) {
	return (
		<div className={cn("flex flex-col items-center gap-2 text-center", className)} {...props}>
			{icon ? <div className="text-basalt-muted-foreground [&_svg]:size-8">{icon}</div> : null}
			<p className="text-sm font-medium text-basalt-foreground">{title}</p>
			{description ? <p className="text-xs text-basalt-muted-foreground">{description}</p> : null}
		</div>
	);
}
