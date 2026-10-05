import { useEffect, useRef, useState } from "react";
import type { RecommendationOption } from "../models/recommendation";

export function useRecommendationCardViewModel({
	options,
	onAccept,
	disabled = false,
}: {
	options: readonly RecommendationOption[];
	onAccept: (option: RecommendationOption) => void | Promise<void>;
	disabled?: boolean;
}) {
	const [selected, setSelected] = useState<string>();
	const [open, setOpen] = useState(false);
	const [pending, setPending] = useState(false);
	const [accepted, setAccepted] = useState<string>();
	const [error, setError] = useState("");
	const lock = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const active =
		options.find((option) => option.id === selected) ??
		options.find((option) => !option.disabled) ??
		options[0];
	const others = options.filter((option) => option.id !== active?.id);
	return {
		active,
		others,
		open,
		pending,
		error,
		accepted: Boolean(active && accepted === active.id),
		blocked: disabled || pending,
		setOpen(next: boolean) {
			if (!disabled && !lock.current) setOpen(next);
		},
		select(id: string) {
			if (
				disabled ||
				lock.current ||
				!options.some((option) => option.id === id && !option.disabled)
			)
				return;
			setSelected(id);
			setAccepted(undefined);
			setError("");
		},
		async accept() {
			if (!active || disabled || active.disabled || lock.current || accepted === active.id) return;
			lock.current = true;
			setPending(true);
			setError("");
			try {
				await onAccept({ ...active });
				if (mounted.current) setAccepted(active.id);
			} catch (reason) {
				if (mounted.current)
					setError(
						reason instanceof Error
							? reason.message
							: "Could not accept recommendation. Try again.",
					);
			} finally {
				lock.current = false;
				if (mounted.current) setPending(false);
			}
		},
	};
}
