import type { ComponentProps } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

/** Stable identifiers, labels and opaque foreground/background pairs for both themes. */
export const TAG_COLORS = {
	slate: {
		label: "Slate",
		className:
			"border-slate-300 bg-slate-100 text-slate-800 basalt-dark:border-slate-600 basalt-dark:bg-slate-800 basalt-dark:text-slate-100",
	},
	blue: {
		label: "Blue",
		className:
			"border-blue-300 bg-blue-50 text-blue-800 basalt-dark:border-blue-700 basalt-dark:bg-blue-950 basalt-dark:text-blue-200",
	},
	violet: {
		label: "Violet",
		className:
			"border-violet-300 bg-violet-50 text-violet-800 basalt-dark:border-violet-700 basalt-dark:bg-violet-950 basalt-dark:text-violet-200",
	},
	teal: {
		label: "Teal",
		className:
			"border-teal-300 bg-teal-50 text-teal-800 basalt-dark:border-teal-700 basalt-dark:bg-teal-950 basalt-dark:text-teal-200",
	},
	amber: {
		label: "Amber",
		className:
			"border-amber-300 bg-amber-50 text-amber-900 basalt-dark:border-amber-700 basalt-dark:bg-amber-950 basalt-dark:text-amber-200",
	},
	rose: {
		label: "Rose",
		className:
			"border-rose-300 bg-rose-50 text-rose-800 basalt-dark:border-rose-700 basalt-dark:bg-rose-950 basalt-dark:text-rose-200",
	},
	success: {
		label: "Success",
		className:
			"border-emerald-300 bg-emerald-50 text-emerald-800 basalt-dark:border-emerald-700 basalt-dark:bg-emerald-950 basalt-dark:text-emerald-200",
	},
	warning: {
		label: "Warning",
		className:
			"border-amber-300 bg-amber-50 text-amber-900 basalt-dark:border-amber-700 basalt-dark:bg-amber-950 basalt-dark:text-amber-200",
	},
	danger: {
		label: "Danger",
		className:
			"border-red-300 bg-red-50 text-red-800 basalt-dark:border-red-700 basalt-dark:bg-red-950 basalt-dark:text-red-200",
	},
	info: {
		label: "Info",
		className:
			"border-sky-300 bg-sky-50 text-sky-800 basalt-dark:border-sky-700 basalt-dark:bg-sky-950 basalt-dark:text-sky-200",
	},
} as const;
export type TagColor = keyof typeof TAG_COLORS;
const HASH_COLORS = ["slate", "blue", "violet", "teal", "amber", "rose"] as const;
/** Stable FNV-1a assignment to six non-semantic colors; does not infer business meaning. */
export function tagColorFor(key: string): TagColor {
	let hash = 2166136261;
	for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
	return HASH_COLORS[(hash >>> 0) % HASH_COLORS.length];
}
export interface TagBadgeProps extends Omit<ComponentProps<"span">, "children" | "color"> {
	/** Visible tag name; color is always accompanied by text. */
	name: string;
	/** Stable hash input, defaults to name. Use an entity ID to retain color after renaming. */
	colorKey?: string;
	/** Explicit hue or semantic color, overriding the deterministic assignment. */
	color?: TagColor;
	/** Badge size. @default "md" */
	size?: "sm" | "md";
}
export function TagBadge({
	name,
	colorKey,
	color,
	size = "md",
	className,
	...props
}: TagBadgeProps) {
	const resolved = color ?? tagColorFor(colorKey ?? name);
	return (
		<span
			{...props}
			data-tag-color={resolved}
			className={cn(
				BASALT_UI_CLASS,
				"inline-flex max-w-full items-center break-words rounded-full border font-medium",
				size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
				TAG_COLORS[resolved].className,
				className,
			)}
		>
			{name}
		</span>
	);
}
