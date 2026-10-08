import { Folder, Pencil } from "lucide-react";
import { type ReactNode, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { NAV_ROW_CLASS } from "../utils/navigation";
import { Button } from "./button";
import { InlineEditable } from "./inline-editable";
import { Link } from "./link";
import { FOCUS_INSET } from "./overlay";

export interface EditableNavItemProps {
	/** Current display name. */
	label: string;
	/** Application route, interpreted by LinkProvider. */
	href?: string;
	/** Navigation/selection request. */
	onSelect?: () => void;
	/** Selected location. @default false */
	selected?: boolean;
	/** Caller-owned leading icon. */
	icon?: ReactNode;
	/** Caller-formatted count or status. */
	count?: ReactNode;
	/** Separate row actions, never nested inside the navigation button/link. */
	actions?: ReactNode;
	/** Enable renaming; rejected promises keep the editor and draft available. */
	onRename?: (name: string) => void | Promise<void>;
	/** Disable navigation and renaming. Application action slots retain their own permissions. @default false */
	disabled?: boolean;
	/** Rename action prefix. @default "Rename" */
	renameLabel?: string;
	/** Accessible save action. @default "Save" */
	saveLabel?: string;
	/** Accessible cancel action. @default "Cancel" */
	cancelLabel?: string;
	/** Additional root classes. */
	className?: string;
}
export function EditableNavItem({
	label,
	href,
	onSelect,
	selected = false,
	icon,
	count,
	actions,
	onRename,
	disabled = false,
	renameLabel = "Rename",
	saveLabel = "Save",
	cancelLabel = "Cancel",
	className,
}: EditableNavItemProps) {
	const [editing, setEditing] = useState(false);
	const countId = useId();
	const rename = useRef<HTMLButtonElement>(null);
	const restore = useRef(false);
	useLayoutEffect(() => {
		if (!editing && restore.current) {
			restore.current = false;
			rename.current?.focus();
		}
	}, [editing]);
	const content = (
		<>
			{icon && (
				<span
					className="flex size-basalt-icon-lg shrink-0 items-center justify-center [&>svg]:size-basalt-icon-lg"
					aria-hidden="true"
				>
					{icon}
				</span>
			)}
			<span className="min-w-0 flex-1 truncate text-left">{label}</span>
			{count != null && (
				<span
					id={countId}
					className="shrink-0 text-basalt-sm tabular-nums text-basalt-muted-foreground"
				>
					{" "}
					{count}
				</span>
			)}
		</>
	);
	return (
		<div
			data-basalt-hover-item={editing ? undefined : ""}
			data-hover-selected={selected && !editing}
			data-disabled={disabled ? "" : undefined}
			className={cn(
				BASALT_UI_CLASS,
				"basalt-nav-item min-w-0 shrink-0 rounded-basalt-md data-disabled:cursor-default data-disabled:hover:bg-transparent",
				className,
			)}
		>
			{editing && onRename ? (
				<InlineEditable
					className="p-basalt-space-lg"
					label={`${renameLabel} ${label}`}
					value={label}
					editing
					onSave={onRename}
					saveLabel={saveLabel}
					cancelLabel={cancelLabel}
					disabled={disabled}
					onEditingChange={(next, reason) => {
						restore.current = !next && reason !== "blur";
						setEditing(next);
					}}
				/>
			) : (
				<div className="flex min-w-0 items-center gap-basalt-nav-gap">
					<Button
						asChild={!!href}
						variant="ghost"
						disabled={disabled}
						className={cn(
							NAV_ROW_CLASS,
							FOCUS_INSET,
							"h-auto flex-1 justify-start hover:bg-transparent hover:border-transparent focus-visible:ring-offset-0",
						)}
						aria-current={selected ? "page" : undefined}
						aria-label={label}
						aria-describedby={count != null ? countId : undefined}
						onClick={onSelect}
					>
						{href ? (
							<Link href={href} className="text-inherit no-underline hover:no-underline">
								{content}
							</Link>
						) : (
							content
						)}
					</Button>
					{onRename && (
						<Button
							ref={rename}
							size="icon"
							variant="ghost"
							disabled={disabled}
							aria-label={`${renameLabel} ${label}`}
							onClick={() => setEditing(true)}
						>
							<Pencil />
						</Button>
					)}
					{actions && (
						<div className="flex shrink-0 items-center gap-basalt-space-sm">{actions}</div>
					)}
				</div>
			)}
		</div>
	);
}

export type FolderNavItemProps = EditableNavItemProps;
/** Folder presentation with an overridable icon; no tree, router or permission model. */
export function FolderNavItem({
	icon = <Folder className="size-basalt-icon-lg" />,
	...props
}: FolderNavItemProps) {
	return <EditableNavItem icon={icon} {...props} />;
}
