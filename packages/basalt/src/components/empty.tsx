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
	/**
	 * Vertical density and visual hierarchy scale.
	 *
	 * @default "default"
	 */
	size?: "default" | "sm";
}

export function Empty({
	title = "No results",
	description,
	icon,
	action,
	children,
	size = "default",
	className,
	...props
}: EmptyProps) {
	const isSm = size === "sm";
	return (
		<div
			className={cn(
				BASALT_UI_CLASS,
				"flex flex-col items-center text-center",
				isSm
					? "gap-basalt-space-sm px-basalt-card-sm py-basalt-card"
					: "gap-basalt-space-md px-basalt-card py-basalt-card-lg",
				className,
			)}
			{...props}
		>
			{icon ? (
				<div
					className={cn(
						"flex items-center justify-center bg-basalt-well text-basalt-muted-foreground shadow-basalt-well",
						isSm
							? "size-basalt-8 rounded-basalt-md [&_svg]:size-basalt-icon"
							: "size-basalt-10 rounded-basalt-lg [&_svg]:size-basalt-icon-lg",
					)}
				>
					{icon}
				</div>
			) : null}
			<p
				className={cn(
					"text-basalt-foreground",
					isSm ? "text-basalt-base font-medium" : "text-basalt-lg font-semibold",
				)}
			>
				{title}
			</p>
			{description ? (
				<p
					className={cn(
						"max-w-[42ch] text-basalt-muted-foreground",
						isSm ? "text-basalt-sm" : "text-basalt-base",
					)}
				>
					{description}
				</p>
			) : null}
			{children !== undefined && children !== null ? (
				<div className="text-basalt-sm text-basalt-muted-foreground">{children}</div>
			) : null}
			{action !== undefined && action !== null ? (
				<div className="mt-basalt-space-lg flex items-center justify-center gap-basalt-space-lg">
					{action}
				</div>
			) : null}
		</div>
	);
}
