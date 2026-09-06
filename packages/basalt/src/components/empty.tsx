import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	/**
	 * Primary title text displayed in the empty state.
	 *
	 * Note: Overwrites standard children rendering.
	 *
	 * @default "No results"
	 */
	title?: string;

	/**
	 * Secondary supporting description text rendered below the title.
	 */
	description?: string;

	/**
	 * Visual icon element rendered above the title.
	 */
	icon?: ReactNode;
}

export function Empty({
	title = "No results",
	description,
	icon,
	className,
	...props
}: EmptyProps) {
	return (
		<div className={cn("flex flex-col items-center gap-2 text-center", className)} {...props}>
			{icon ? <div className="text-basalt-muted-foreground [&_svg]:size-8">{icon}</div> : null}
			<p className="text-sm font-medium text-basalt-foreground">{title}</p>
			{description ? <p className="text-xs text-basalt-muted-foreground">{description}</p> : null}
		</div>
	);
}
