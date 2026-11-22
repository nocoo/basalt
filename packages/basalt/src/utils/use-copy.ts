import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "error";

export interface UseCopyResult {
	copied: boolean;
	status: CopyStatus;
	announcementCount: number;
	copy: (text: string) => Promise<boolean>;
}

/**
 * Manages transient clipboard copy feedback with timer reset and unmount cleanup.
 */
export function useCopy(timeout = 2000): UseCopyResult {
	const [state, setState] = useState<{ status: CopyStatus; announcementCount: number }>({
		status: "idle",
		announcementCount: 0,
	});
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

	const scheduleReset = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
		}
		timerRef.current = setTimeout(() => {
			if (mountedRef.current) {
				setState((current) => ({ ...current, status: "idle" }));
			}
			timerRef.current = null;
		}, timeout);
	}, [timeout]);

	const copy = useCallback(
		async (text: string): Promise<boolean> => {
			try {
				await navigator.clipboard.writeText(text);
			} catch {
				if (mountedRef.current) {
					setState((current) => ({
						status: "error",
						announcementCount: current.announcementCount + 1,
					}));
					scheduleReset();
				}
				return false;
			}
			if (!mountedRef.current) {
				return true;
			}
			setState((current) => ({
				status: "copied",
				announcementCount: current.announcementCount + 1,
			}));
			scheduleReset();
			return true;
		},
		[scheduleReset],
	);

	return {
		copied: state.status === "copied",
		status: state.status,
		announcementCount: state.announcementCount,
		copy,
	};
}
