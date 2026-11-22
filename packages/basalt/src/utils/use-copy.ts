import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCopyResult {
	copied: boolean;
	copy: (text: string) => Promise<boolean>;
}

/**
 * Manages transient clipboard copy feedback with timer reset and unmount cleanup.
 */
export function useCopy(timeout = 2000): UseCopyResult {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, []);

	const copy = useCallback(
		async (text: string): Promise<boolean> => {
			try {
				await navigator.clipboard.writeText(text);
			} catch {
				return false;
			}
			if (!mountedRef.current) {
				return true;
			}
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
			}
			setCopied(true);
			timerRef.current = setTimeout(() => {
				if (mountedRef.current) {
					setCopied(false);
				}
				timerRef.current = null;
			}, timeout);
			return true;
		},
		[timeout],
	);

	return { copied, copy };
}
