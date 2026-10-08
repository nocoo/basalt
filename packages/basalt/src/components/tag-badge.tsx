import type { ComponentProps } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

/** Stable identifiers, labels and opaque foreground/background pairs for both themes. */
export const TAG_COLORS = {
	slate: {
		label: "Slate",
		className:
			"border-basalt-tag-slate-border bg-basalt-tag-slate text-basalt-tag-slate-foreground",
	},
	blue: {
		label: "Blue",
		className: "border-basalt-tag-blue-border bg-basalt-tag-blue text-basalt-tag-blue-foreground",
	},
	violet: {
		label: "Violet",
		className:
			"border-basalt-tag-violet-border bg-basalt-tag-violet text-basalt-tag-violet-foreground",
	},
	teal: {
		label: "Teal",
		className: "border-basalt-tag-teal-border bg-basalt-tag-teal text-basalt-tag-teal-foreground",
	},
	amber: {
		label: "Amber",
		className:
			"border-basalt-tag-amber-border bg-basalt-tag-amber text-basalt-tag-amber-foreground",
	},
	rose: {
		label: "Rose",
		className: "border-basalt-tag-rose-border bg-basalt-tag-rose text-basalt-tag-rose-foreground",
	},
	success: {
		label: "Success",
		className:
			"border-basalt-tag-success-border bg-basalt-tag-success text-basalt-tag-success-foreground",
	},
	warning: {
		label: "Warning",
		className:
			"border-basalt-tag-warning-border bg-basalt-tag-warning text-basalt-tag-warning-foreground",
	},
	danger: {
		label: "Danger",
		className:
			"border-basalt-tag-danger-border bg-basalt-tag-danger text-basalt-tag-danger-foreground",
	},
	info: {
		label: "Info",
		className: "border-basalt-tag-info-border bg-basalt-tag-info text-basalt-tag-info-foreground",
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
				"inline-flex max-w-full items-center break-words rounded-basalt-full border font-medium",
				"basalt-inline",
				size === "sm" && "px-basalt-space-sm",
				TAG_COLORS[resolved].className,
				className,
			)}
		>
			{name}
		</span>
	);
}
