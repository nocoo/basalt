import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
	/**
	 * Primary title text displayed in the empty state.
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

	/**
	 * Interactive call-to-action element (e.g. Button or Link) rendered below content.
	 */
	action?: ReactNode;

	/**
	 * Custom supporting content or custom layout rendered between description and action.
	 */
	children?: ReactNode;
}

export function Empty({
	title = "No results",
	description,
	icon,
	action,
	children,
	className,
	...props
}: EmptyProps) {
	return (
		<div
			className={cn(BASALT_UI_CLASS, "flex flex-col items-center gap-2 text-center", className)}
			{...props}
		>
			{icon ? <div className="text-basalt-muted-foreground [&_svg]:size-8">{icon}</div> : null}
			<p className="text-sm font-medium text-basalt-foreground">{title}</p>
			{description ? <p className="text-xs text-basalt-muted-foreground">{description}</p> : null}
			{children !== undefined && children !== null ? (
				<div className="text-xs text-basalt-muted-foreground">{children}</div>
			) : null}
			{action !== undefined && action !== null ? (
				<div className="mt-2 flex items-center justify-center gap-2">{action}</div>
			) : null}
		</div>
	);
}
