import { ArrowUp, Square } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { InputArea } from "./input-area";

export interface ChatComposerProps {
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
	 * Called with trimmed text on send. Operates on internal draft state and does not wait for a Promise (caller manages asynchronous errors).
	 */
	onSend: (text: string) => void;
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
}: ChatComposerProps) {
	const [value, setValue] = useState("");
	const ref = useRef<HTMLTextAreaElement>(null);
	const composingRef = useRef(false);

	const resize = () => {
		const el = ref.current;
		if (!el) {
			return;
		}
		el.style.height = "0px";
		el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
	};

	const submit = () => {
		const text = value.trim();
		if (!text || disabled || streaming) {
			return;
		}
		onSend(text);
		setValue("");
		requestAnimationFrame(() => {
			resize();
			ref.current?.focus();
		});
	};

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		submit();
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (composingRef.current || event.nativeEvent.isComposing) {
			return;
		}
		if (event.key !== "Enter" || event.shiftKey) {
			return;
		}
		event.preventDefault();
		submit();
	};

	return (
		<form
			className={cn("border-t border-basalt-border/50 bg-basalt-card p-basalt-3", className)}
			onSubmit={onSubmit}
		>
			<div className="flex items-end gap-basalt-2 rounded-2xl bg-basalt-secondary p-basalt-2 ring-1 ring-basalt-border/50">
				<InputArea
					ref={ref}
					value={value}
					onChange={(event) => {
						setValue(event.target.value);
						requestAnimationFrame(resize);
					}}
					onCompositionStart={() => {
						composingRef.current = true;
					}}
					onCompositionEnd={() => {
						composingRef.current = false;
					}}
					onKeyDown={onKeyDown}
					rows={1}
					placeholder={placeholder}
					disabled={disabled}
					aria-label={label}
					className="max-h-basalt-40 min-h-basalt-control-lg flex-1 resize-none border-0 bg-transparent p-basalt-2 shadow-none ring-0"
				/>
				{streaming ? (
					<Button
						type="button"
						size="icon"
						variant="secondary"
						onClick={onCancel}
						disabled={!onCancel}
						aria-label={cancelLabel}
					>
						<Square className="h-basalt-3_5 w-basalt-3_5 fill-current" strokeWidth={0} />
					</Button>
				) : (
					<Button
						type="submit"
						size="icon"
						disabled={disabled || !value.trim()}
						aria-label={sendLabel}
					>
						<ArrowUp className="h-basalt-4 w-basalt-4" strokeWidth={2.25} />
					</Button>
				)}
			</div>
		</form>
	);
}
