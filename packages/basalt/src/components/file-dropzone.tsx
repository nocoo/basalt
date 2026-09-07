import { Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export interface FileRejection {
	/** Original File; the component never creates preview URLs. */
	file: File;
	/** Machine-readable reason for application handling. */
	code: "file-invalid-type" | "file-too-large" | "too-many-files";
}

export interface FileDropzoneProps {
	/** Visible and accessible upload field name. */
	label: string;
	/** Optional file requirements shown under the label. */
	description?: string;
	/** Accepted extensions/MIME types using native accept syntax, e.g. .pdf,image/*. */
	accept?: string;
	/** Allow multiple files. @default true */
	multiple?: boolean;
	/** Maximum accepted file count including fileCount. @default Infinity */
	maxFiles?: number;
	/** Number already held by the application. @default 0 */
	fileCount?: number;
	/** Maximum size of an individual file in bytes. @default Infinity */
	maxSize?: number;
	/** Prevent both file browsing and drops. @default false */
	disabled?: boolean;
	/** Accepted files from this gesture; transport and queue ownership belong to the caller. */
	onFilesAccepted: (files: File[]) => void;
	/** Rejected files from this gesture, with one primary reason per file. */
	onFilesRejected?: (rejections: FileRejection[]) => void;
	/** Browse action text. @default "Browse files" */
	browseLabel?: string;
	/** Text while a file is dragged over the field. @default "Drop files here" */
	dropLabel?: string;
	/** Localized rejection message; defaults to a name and reason. */
	formatRejection?: (rejection: FileRejection) => string;
	/** Additional root classes. */
	className?: string;
}

function accepts(file: File, accept: string) {
	const rules = accept
		.split(",")
		.map((rule) => rule.trim().toLowerCase())
		.filter(Boolean);
	return (
		rules.length === 0 ||
		rules.some((rule) =>
			rule.startsWith(".")
				? file.name.toLowerCase().endsWith(rule)
				: rule.endsWith("/*")
					? file.type.toLowerCase().startsWith(rule.slice(0, -1))
					: file.type.toLowerCase() === rule,
		)
	);
}

const REASONS = {
	"file-invalid-type": "File type is not accepted.",
	"file-too-large": "File exceeds the size limit.",
	"too-many-files": "File count limit reached.",
};

export function FileDropzone({
	label,
	description,
	accept = "",
	multiple = true,
	maxFiles = Infinity,
	fileCount = 0,
	maxSize = Infinity,
	disabled = false,
	onFilesAccepted,
	onFilesRejected,
	browseLabel = "Browse files",
	dropLabel = "Drop files here",
	formatRejection,
	className,
}: FileDropzoneProps) {
	const input = useRef<HTMLInputElement>(null);
	const depth = useRef(0);
	const [dragging, setDragging] = useState(false);
	const [rejections, setRejections] = useState<FileRejection[]>([]);
	const id = useId();
	function receive(files: File[]) {
		if (disabled) return;
		const accepted: File[] = [];
		const rejected: FileRejection[] = [];
		const limit = Math.max(0, multiple ? maxFiles : Math.min(1, maxFiles));
		for (const file of files) {
			const code = !accepts(file, accept)
				? "file-invalid-type"
				: file.size > maxSize
					? "file-too-large"
					: accepted.length + fileCount >= limit
						? "too-many-files"
						: null;
			if (code) rejected.push({ file, code });
			else accepted.push(file);
		}
		setRejections(rejected);
		if (accepted.length) onFilesAccepted(accepted);
		if (rejected.length) onFilesRejected?.(rejected);
	}
	return (
		<div
			role="group"
			aria-label={label}
			className={cn(BASALT_UI_CLASS, "min-w-0 space-y-2", className)}
		>
			<input
				ref={input}
				type="file"
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				tabIndex={-1}
				aria-label={label}
				className="hidden"
				onChange={(event) => {
					receive(Array.from(event.currentTarget.files ?? []));
					event.currentTarget.value = "";
				}}
			/>
			<button
				type="button"
				disabled={disabled}
				aria-label={`${browseLabel}: ${label}`}
				aria-describedby={description ? `${id}-description` : undefined}
				data-drag-active={dragging && !disabled}
				onClick={() => input.current?.click()}
				onDragEnter={(event) => {
					event.preventDefault();
					depth.current += 1;
					if (!disabled) setDragging(true);
				}}
				onDragOver={(event) => {
					event.preventDefault();
					if (!disabled) event.dataTransfer.dropEffect = "copy";
				}}
				onDragLeave={(event) => {
					event.preventDefault();
					depth.current = Math.max(0, depth.current - 1);
					if (depth.current === 0) setDragging(false);
				}}
				onDrop={(event) => {
					event.preventDefault();
					event.stopPropagation();
					depth.current = 0;
					setDragging(false);
					receive(Array.from(event.dataTransfer.files));
				}}
				className={cn(
					"flex w-full min-w-0 flex-col items-center gap-2 rounded-basalt-lg border-2 border-dashed px-4 py-7 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basalt-ring disabled:cursor-not-allowed disabled:opacity-50",
					dragging && !disabled
						? "border-basalt-primary bg-basalt-accent"
						: "border-basalt-border bg-basalt-card hover:bg-basalt-accent",
				)}
			>
				<Upload className="size-6 text-basalt-muted-foreground" aria-hidden="true" />
				<span className="text-sm font-medium">{dragging && !disabled ? dropLabel : label}</span>
				{description && (
					<span id={`${id}-description`} className="text-xs text-basalt-muted-foreground">
						{description}
					</span>
				)}
				<span className="rounded-basalt-md border border-basalt-border px-3 py-1 text-xs">
					{browseLabel}
				</span>
			</button>
			{rejections.length > 0 && (
				<ul role="alert" className="space-y-1 text-xs text-basalt-destructive">
					{rejections.map((item, index) => (
						<li key={`${item.file.name}-${index}`} className="break-words">
							{formatRejection ? formatRejection(item) : `${item.file.name}: ${REASONS[item.code]}`}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
