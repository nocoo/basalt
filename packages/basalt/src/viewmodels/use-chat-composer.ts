import { useEffect, useRef, useState } from "react";

export function useChatComposer({
	value,
	defaultValue = "",
	onValueChange,
	onSend,
	disabled,
	streaming,
	hasAttachments,
}: {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	onSend: (text: string) => void | Promise<void>;
	disabled: boolean;
	streaming: boolean;
	hasAttachments: boolean;
}) {
	const [draft, setDraft] = useState(defaultValue);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	const locked = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const text = value ?? draft;
	const update = (next: string) => {
		if (locked.current || disabled) return;
		if (value === undefined) setDraft(next);
		onValueChange?.(next);
		setError("");
	};
	return {
		value: text,
		update,
		pending,
		error,
		canSend: !disabled && !streaming && !pending && (Boolean(text.trim()) || hasAttachments),
		async send() {
			if (locked.current || disabled || streaming || (!text.trim() && !hasAttachments))
				return false;
			locked.current = true;
			setPending(true);
			setError("");
			try {
				await onSend(text.trim());
				if (mounted.current) {
					if (value === undefined) setDraft("");
					onValueChange?.("");
				}
				return true;
			} catch (reason) {
				if (mounted.current)
					setError(reason instanceof Error ? reason.message : "Could not send message. Try again.");
				return false;
			} finally {
				locked.current = false;
				if (mounted.current) setPending(false);
			}
		},
	};
}
