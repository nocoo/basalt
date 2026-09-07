import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button } from "./button";

export interface FilterBarProps {
	/** Accessible group name. */
	label: string;
	/** Application-owned search, select, and date controls. */
	children: ReactNode;
	/** Active chips, shown on their own wrapping row. */
	chips?: ReactNode;
	/** Whether the clear action is available. @default false */
	active?: boolean;
	/** Requests clearing application-owned filters. */
	onClear?: () => void;
	/** Clear action text. @default "Clear filters" */
	clearLabel?: string;
	/** Additional root classes. */
	className?: string;
}

/** Layout only; URL serialization, query execution, and date presets belong to the caller. */
export function FilterBar({
	label,
	children,
	chips,
	active = false,
	onClear,
	clearLabel = "Clear filters",
	className,
}: FilterBarProps) {
	return (
		<div
			role="group"
			aria-label={label}
			className={cn(BASALT_UI_CLASS, "min-w-0 space-y-3", className)}
		>
			<div className="flex flex-wrap items-end gap-3 [&>*]:min-w-0">
				{children}
				{active && onClear && (
					<Button size="sm" variant="ghost" onClick={onClear}>
						{clearLabel}
					</Button>
				)}
			</div>
			{chips != null && <div className="flex flex-wrap items-center gap-2">{chips}</div>}
		</div>
	);
}

export interface FilterChipProps {
	/** Filter dimension, e.g. Status. */
	label: string;
	/** Display value. */
	value: ReactNode;
	/** Requests removal from the application's filter state. */
	onRemove: () => void;
	/** Full accessible removal label; defaults to Remove plus the dimension label. */
	removeLabel?: string;
	/** Disable removal. @default false */
	disabled?: boolean;
	/** Additional root classes. */
	className?: string;
}

export function FilterChip({
	label,
	value,
	onRemove,
	removeLabel,
	disabled = false,
	className,
}: FilterChipProps) {
	return (
		<span
			className={cn(
				BASALT_UI_CLASS,
				"inline-flex max-w-full items-center gap-1 rounded-full border border-basalt-border bg-basalt-accent py-1 pl-3 pr-1 text-xs",
				className,
			)}
		>
			<span className="min-w-0 break-words">
				<span className="text-basalt-muted-foreground">{label}: </span>
				{value}
			</span>
			<button
				type="button"
				disabled={disabled}
				aria-label={removeLabel ?? `Remove ${label}`}
				onClick={onRemove}
				className="shrink-0 rounded-full p-1 focus-visible:outline-2 focus-visible:outline-basalt-ring disabled:opacity-50"
			>
				<X className="size-3" aria-hidden="true" />
			</button>
		</span>
	);
}
