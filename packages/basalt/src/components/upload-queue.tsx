import { Check, FileText, RotateCcw, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button } from "./button";

export interface UploadFile {
	/** Stable queue identifier. */
	id: string;
	/** Display filename. */
	name: string;
	/** Optional size in bytes. */
	size?: number;
	/** Application-owned transport state. */
	status: "queued" | "uploading" | "success" | "error" | "cancelled";
	/** Progress percentage; omitted means indeterminate. */
	progress?: number;
	/** Application's error message. */
	error?: string;
	/** Optional image/icon. The caller creates and revokes any object URLs. */
	preview?: ReactNode;
}
export interface UploadLabels {
	queued?: string;
	uploading?: string;
	success?: string;
	error?: string;
	cancelled?: string;
	cancel?: string;
	retry?: string;
	remove?: string;
}
const DEFAULT_LABELS = {
	queued: "Queued",
	uploading: "Uploading",
	success: "Uploaded",
	error: "Upload failed",
	cancelled: "Cancelled",
	cancel: "Cancel",
	retry: "Retry",
	remove: "Remove",
};

export interface UploadItemProps {
	/** Current queue entry. The component does not start a network request. */
	file: UploadFile;
	/** Cancel a queued or uploading entry. */
	onCancel?: (id: string) => void;
	/** Retry a failed or cancelled entry. */
	onRetry?: (id: string) => void;
	/** Remove an entry that is not currently uploading. */
	onRemove?: (id: string) => void;
	/** Localized statuses and action labels. */
	labels?: UploadLabels;
	/** Additional root classes. */
	className?: string;
}

export function UploadItem({
	file,
	onCancel,
	onRetry,
	onRemove,
	labels,
	className,
}: UploadItemProps) {
	const text = { ...DEFAULT_LABELS, ...labels };
	const progress =
		typeof file.progress === "number" && Number.isFinite(file.progress)
			? Math.max(0, Math.min(100, file.progress))
			: undefined;
	const active = file.status === "queued" || file.status === "uploading";
	return (
		<div
			className={cn(
				BASALT_UI_CLASS,
				"flex min-w-0 items-start gap-3 rounded-basalt-lg border border-basalt-border bg-basalt-card p-3",
				className,
			)}
		>
			<span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-basalt-md bg-basalt-accent">
				{file.preview ?? (
					<FileText className="size-5 text-basalt-muted-foreground" aria-hidden="true" />
				)}
			</span>
			<div className="min-w-0 flex-1 space-y-1">
				<p className="break-words text-sm font-medium">{file.name}</p>
				<p className="text-xs text-basalt-muted-foreground">
					{file.size !== undefined && `${Math.ceil(file.size / 1024).toLocaleString()} KB · `}
					{text[file.status]}
				</p>
				{file.status === "uploading" && (
					<div
						role="progressbar"
						aria-label={file.name}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={progress}
						className="h-1.5 overflow-hidden rounded-full bg-basalt-accent"
					>
						<div
							style={{ width: progress === undefined ? "40%" : `${progress}%` }}
							className={cn(
								"h-full rounded-full bg-basalt-primary",
								progress === undefined && "animate-pulse motion-reduce:animate-none",
							)}
						/>
					</div>
				)}
				{file.status === "error" && file.error && (
					<p role="alert" className="break-words text-xs text-basalt-destructive">
						{file.error}
					</p>
				)}
			</div>
			<div className="flex shrink-0 items-center gap-1">
				{file.status === "success" && (
					<Check className="size-4 text-basalt-success" aria-hidden="true" />
				)}
				{active && onCancel && (
					<Button
						size="icon"
						variant="ghost"
						aria-label={`${text.cancel} ${file.name}`}
						onClick={() => onCancel(file.id)}
					>
						<X />
					</Button>
				)}
				{(file.status === "error" || file.status === "cancelled") && onRetry && (
					<Button
						size="icon"
						variant="ghost"
						aria-label={`${text.retry} ${file.name}`}
						onClick={() => onRetry(file.id)}
					>
						<RotateCcw />
					</Button>
				)}
				{file.status !== "uploading" && onRemove && (
					<Button
						size="icon"
						variant="ghost"
						aria-label={`${text.remove} ${file.name}`}
						onClick={() => onRemove(file.id)}
					>
						<Trash2 />
					</Button>
				)}
			</div>
		</div>
	);
}

export interface UploadQueueProps extends Omit<UploadItemProps, "file"> {
	/** Accessible queue name. */
	label: string;
	/** Application-owned queue entries. */
	files: readonly UploadFile[];
	/** Empty queue text. @default "No files selected." */
	emptyLabel?: string;
}

export function UploadQueue({
	label,
	files,
	emptyLabel = "No files selected.",
	className,
	...actions
}: UploadQueueProps) {
	return (
		<div className={cn(BASALT_UI_CLASS, "min-w-0 space-y-2", className)}>
			{files.length === 0 ? (
				<p role="status" className="text-sm text-basalt-muted-foreground">
					{emptyLabel}
				</p>
			) : (
				<ul aria-label={label} className="m-0 list-none space-y-2 p-0">
					{files.map((file) => (
						<li key={file.id}>
							<UploadItem file={file} {...actions} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
