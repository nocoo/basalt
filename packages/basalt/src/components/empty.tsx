import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Empty({
	title = "No results",
	description,
	className,
	...props
}: HTMLAttributes<HTMLDivElement> & { title?: string; description?: string }) {
	return (
		<div className={cn("flex flex-col items-center gap-1 text-center", className)} {...props}>
			<p className="text-sm font-medium text-basalt-foreground">{title}</p>
			{description ? <p className="text-xs text-basalt-muted-foreground">{description}</p> : null}
		</div>
	);
}
