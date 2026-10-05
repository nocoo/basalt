import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import { type FormEvent, type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { cn } from "../utils/cn";
import { useChatComposer } from "../viewmodels/use-chat-composer";
import { Button } from "./button";
import { InputArea } from "./input-area";

export interface ChatComposerProps {
	/** Controlled draft; keep one draft per conversation in the application. */
	value?: string;
	/** Initial draft when uncontrolled. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Model, tool and context controls arranged before Send. */
	toolbar?: ReactNode;
	/** Caller-owned attachments; this component never uploads files. */
	attachments?: readonly ChatComposerAttachment[];
	onRemoveAttachment?: (id: string) => void;
	/** Local file selection callback. File validation/upload belong to the application. */
	onFilesSelect?: (files: File[]) => void;
	accept?: string;
	/**
	 * Disable the field and send.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Replace send with stop. When streaming is true, the stop button renders and triggers onCancel.
	 * @default false
	 */
	streaming?: boolean;
	/**
	 * Field accessible name.
	 * @default "Message"
	 */
	label?: string;
	/**
	 * Placeholder when empty.
	 */
	placeholder?: string;
	/**
	 * Called with trimmed text. Async failure preserves draft and attachments for retry.
	 */
	onSend: (text: string) => void | Promise<void>;
	/**
	 * Called when the stop control is pressed while streaming is active.
	 */
	onCancel?: () => void;
	/**
	 * Send control accessible name.
	 * @default "Send message"
	 */
	sendLabel?: string;
	/**
	 * Stop control accessible name.
	 * @default "Stop generating"
	 */
	cancelLabel?: string;
	/**
	 * Optional class name applied to the form container.
	 * Component manages internal draft/height state and does not forward native form rest attributes or ref.
	 */
	className?: string;
}

export type ChatComposerAttachment = { id: string; name: string };

export function ChatComposer({
	disabled = false,
	streaming = false,
	label = "Message",
	placeholder,
	onSend,
	onCancel,
	sendLabel = "Send message",
	cancelLabel = "Stop generating",
	className,
	value,
	defaultValue,
	onValueChange,
	toolbar,
	attachments = [],
	onRemoveAttachment,
	onFilesSelect,
	accept,
}: ChatComposerProps) {
	const vm = useChatComposer({
		value,
		defaultValue,
		onValueChange,
		onSend,
		disabled,
		streaming,
		hasAttachments: attachments.length > 0,
	});
	const ref = useRef<HTMLTextAreaElement>(null);
	const fileInput = useRef<HTMLInputElement>(null);
	const errorId = useId();
	const composingRef = useRef(false);
	const submit = async () => {
		if (await vm.send()) ref.current?.focus();
	};

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		void submit();
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) {
			return;
		}
		if (event.key !== "Enter" || event.shiftKey) {
			return;
		}
		event.preventDefault();
		void submit();
	};

	return (
		<form
			className={cn("basalt-ui shrink-0 bg-basalt-card p-basalt-card-sm", className)}
			onSubmit={onSubmit}
		>
			<div className="rounded-basalt-lg bg-basalt-control p-basalt-2 ring-1 ring-basalt-border focus-within:ring-basalt-ring">
				{attachments.length > 0 && (
					<ul aria-label="Attachments" className="mb-basalt-2 flex flex-wrap gap-basalt-1_5">
						{attachments.map((file) => (
							<li
								key={file.id}
								className="flex min-w-0 max-w-full items-center gap-basalt-1 rounded-basalt-md bg-basalt-secondary py-basalt-1 pl-basalt-2 pr-basalt-1 text-xs"
							>
								<Paperclip aria-hidden="true" className="size-basalt-icon shrink-0" />
								<span className="truncate">{file.name}</span>
								{onRemoveAttachment && (
									<Button
										type="button"
										size="icon"
										variant="ghost"
										disabled={disabled || vm.pending || streaming}
										className="size-basalt-5"
										aria-label={`Remove ${file.name}`}
										onClick={() => onRemoveAttachment(file.id)}
									>
										<X />
									</Button>
								)}
							</li>
						))}
					</ul>
				)}
				<InputArea
					ref={ref}
					value={vm.value}
					onChange={(event) => vm.update(event.target.value)}
					onCompositionStart={() => {
						composingRef.current = true;
					}}
					onCompositionEnd={() => {
						composingRef.current = false;
					}}
					onKeyDown={onKeyDown}
					rows={1}
					placeholder={placeholder}
					disabled={disabled || vm.pending}
					aria-label={label}
					aria-describedby={vm.error ? errorId : undefined}
					aria-description="Enter to send, Shift+Enter for a new line"
					className="basalt-chat-input min-h-[calc(1lh+var(--basalt-space-2))] resize-none overflow-y-auto border-0 bg-transparent px-basalt-1 py-basalt-1 text-sm leading-[var(--basalt-line-body)] shadow-none ring-0 outline-none"
				/>
				<div className="mt-basalt-2 flex items-center justify-between gap-basalt-2">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-basalt-1">
						{onFilesSelect && (
							<>
								<input
									ref={fileInput}
									type="file"
									multiple
									accept={accept}
									hidden
									onChange={(event) => {
										onFilesSelect(Array.from(event.target.files ?? []));
										event.target.value = "";
									}}
								/>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									aria-label="Attach files"
									disabled={disabled || vm.pending || streaming}
									onClick={() => fileInput.current?.click()}
								>
									<Paperclip />
								</Button>
							</>
						)}
						<fieldset disabled={disabled || streaming || vm.pending} className="contents">
							{toolbar}
						</fieldset>
					</div>
					{streaming ? (
						<Button
							type="button"
							size="icon"
							variant="secondary"
							onClick={onCancel}
							disabled={disabled || !onCancel}
							aria-label={cancelLabel}
						>
							<Square className="h-basalt-3_5 w-basalt-3_5 fill-current" strokeWidth={0} />
						</Button>
					) : (
						<Button
							type="submit"
							size="icon"
							disabled={!vm.canSend}
							loading={vm.pending}
							aria-label={sendLabel}
						>
							<ArrowUp className="h-basalt-4 w-basalt-4" strokeWidth={2.25} />
						</Button>
					)}
				</div>
			</div>
			{vm.error && (
				<p id={errorId} role="alert" className="mt-basalt-2 text-xs text-basalt-danger">
					{vm.error}
				</p>
			)}
		</form>
	);
}
