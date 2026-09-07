import { Pencil } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button } from "./button";
import { Input } from "./input";

export type InlineEditableChangeReason = "edit" | "save" | "blur" | "cancel";
export interface InlineEditableProps {
	/** Accessible name of the edited field. */
	label: string;
	/** Committed value, owned by the application. */
	value: string;
	/** Persist the draft. Return a promise to keep the editor pending; rejection preserves the draft. */
	onSave: (value: string) => void | Promise<void>;
	/** Controlled edit mode. */
	editing?: boolean;
	/** Initial uncontrolled edit mode. @default false */
	defaultEditing?: boolean;
	/** Edit-mode requests with their cause, including blur that must not steal focus. */
	onEditingChange?: (editing: boolean, reason: InlineEditableChangeReason) => void;
	/** External pending state. @default false */
	pending?: boolean;
	/** Application-owned error message. */
	error?: string;
	/** Disable editing and saving. @default false */
	disabled?: boolean;
	/** Reject an empty draft. @default true */
	required?: boolean;
	/** Trim whitespace before validation and save. @default true */
	trim?: boolean;
	/** Commit when focus leaves the whole editor, including its actions. @default true */
	saveOnBlur?: boolean;
	/** Return a validation message to retain the draft without invoking onSave. */
	validate?: (value: string) => string | undefined;
	/** Empty committed-value prompt. @default "Untitled" */
	placeholder?: string;
	/** Edit action label prefix. @default "Edit" */
	editLabel?: string;
	/** Save action text. @default "Save" */
	saveLabel?: string;
	/** Cancel action text. @default "Cancel" */
	cancelLabel?: string;
	/** Pending announcement. @default "Saving…" */
	pendingLabel?: string;
	/** Empty-value validation message. @default "Enter a value." */
	requiredLabel?: string;
	/** Fallback for non-Error rejections. @default "Could not save changes." */
	errorLabel?: string;
	/** Additional root classes. */
	className?: string;
}

export function InlineEditable({
	label,
	value,
	onSave,
	editing,
	defaultEditing = false,
	onEditingChange,
	pending = false,
	error,
	disabled = false,
	required = true,
	trim = true,
	saveOnBlur = true,
	validate,
	placeholder = "Untitled",
	editLabel = "Edit",
	saveLabel = "Save",
	cancelLabel = "Cancel",
	pendingLabel = "Saving…",
	requiredLabel = "Enter a value.",
	errorLabel = "Could not save changes.",
	className,
}: InlineEditableProps) {
	const [localEditing, setLocalEditing] = useState(defaultEditing);
	const [draft, setDraft] = useState(value);
	const [saving, setSaving] = useState(false);
	const [failure, setFailure] = useState<string>();
	const input = useRef<HTMLInputElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const mounted = useRef(true);
	const operation = useRef(0);
	const locked = useRef(false);
	const restore = useRef(false);
	const id = useId();
	const isEditing = editing ?? localEditing;
	const busy = pending || saving;
	const message = error ?? failure;
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			operation.current += 1;
		};
	}, []);
	useLayoutEffect(() => {
		if (isEditing && !disabled) {
			input.current?.focus();
			input.current?.select();
		} else if (!isEditing && restore.current) {
			restore.current = false;
			trigger.current?.focus();
		}
	}, [isEditing, disabled]);
	useEffect(() => {
		if (!isEditing) {
			operation.current += 1;
			locked.current = false;
			setSaving(false);
			setDraft(value);
			setFailure(undefined);
		}
	}, [isEditing, value]);
	function changeEditing(next: boolean, reason: InlineEditableChangeReason) {
		if (editing === undefined) setLocalEditing(next);
		onEditingChange?.(next, reason);
	}
	function finish(reason: InlineEditableChangeReason) {
		restore.current = reason !== "blur";
		changeEditing(false, reason);
	}
	async function save(reason: "save" | "blur") {
		if (!isEditing || disabled || busy || locked.current) return;
		const next = trim ? draft.trim() : draft;
		const invalid = required && !next ? requiredLabel : validate?.(next);
		if (invalid) {
			setFailure(invalid);
			return;
		}
		if (next === value) {
			finish(reason);
			return;
		}
		locked.current = true;
		setSaving(true);
		setFailure(undefined);
		const ticket = ++operation.current;
		try {
			await onSave(next);
			if (mounted.current && ticket === operation.current) finish(reason);
		} catch (cause) {
			if (mounted.current && ticket === operation.current)
				setFailure(cause instanceof Error && cause.message ? cause.message : errorLabel);
		} finally {
			if (mounted.current && ticket === operation.current) {
				locked.current = false;
				setSaving(false);
			}
		}
	}
	return (
		<div
			role="group"
			aria-label={label}
			aria-busy={busy}
			className={cn(BASALT_UI_CLASS, "min-w-0 space-y-2", className)}
			onBlur={(event) => {
				if (saveOnBlur && !event.currentTarget.contains(event.relatedTarget)) void save("blur");
			}}
		>
			{isEditing ? (
				<div className="flex flex-wrap items-center gap-2">
					<Input
						ref={input}
						aria-label={label}
						className="min-w-0 flex-1 basis-32"
						value={draft}
						disabled={disabled}
						readOnly={busy}
						aria-invalid={!!message}
						aria-describedby={message ? `${id}-error` : undefined}
						onChange={(event) => {
							setDraft(event.target.value);
							setFailure(undefined);
						}}
						onKeyDown={(event) => {
							if (event.nativeEvent.isComposing) return;
							if (event.key === "Enter") {
								event.preventDefault();
								void save("save");
							}
							if (event.key === "Escape" && !busy) {
								event.preventDefault();
								event.stopPropagation();
								setDraft(value);
								setFailure(undefined);
								finish("cancel");
							}
						}}
					/>
					<Button size="sm" disabled={disabled || busy} onClick={() => void save("save")}>
						{saveLabel}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						disabled={busy}
						onClick={() => {
							setDraft(value);
							setFailure(undefined);
							finish("cancel");
						}}
					>
						{cancelLabel}
					</Button>
				</div>
			) : (
				<button
					ref={trigger}
					type="button"
					disabled={disabled || pending}
					aria-label={`${editLabel} ${label}`}
					className="group flex max-w-full items-center gap-2 rounded-basalt-md px-1 py-1 text-left text-sm hover:bg-basalt-accent focus-visible:outline-2 focus-visible:outline-basalt-ring disabled:opacity-50"
					onClick={() => {
						setDraft(value);
						setFailure(undefined);
						changeEditing(true, "edit");
					}}
				>
					<span className={cn("min-w-0 break-words", !value && "text-basalt-muted-foreground")}>
						{value || placeholder}
					</span>
					<Pencil className="size-3.5 shrink-0 text-basalt-muted-foreground" aria-hidden="true" />
				</button>
			)}
			{busy && (
				<p role="status" className="text-xs text-basalt-muted-foreground">
					{pendingLabel}
				</p>
			)}
			{message && (
				<p id={`${id}-error`} role="alert" className="text-xs text-basalt-destructive">
					{message}
				</p>
			)}
		</div>
	);
}
