import { useEffect, useMemo, useRef, useState } from "react";
import { codeLines } from "../models/code";

export function useCodeBlock(code: string, highlighted: boolean) {
	const lines = useMemo(() => codeLines(code, highlighted), [code, highlighted]);
	const [feedback, setFeedback] = useState<{
		code: string;
		status: "pending" | "copied" | "error";
		count: number;
	} | null>(null);
	const locked = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const scoped = feedback?.code === code ? feedback : null;
	return {
		lines,
		status: scoped ? scoped.status : "idle",
		announcementCount: scoped ? scoped.count : 0,
		async copy(write: (text: string) => Promise<void>) {
			if (locked.current) return;
			locked.current = true;
			setFeedback((current) => ({
				code,
				status: "pending",
				count: current?.code === code ? current.count : 0,
			}));
			try {
				await write(code);
				if (mounted.current) {
					setFeedback((current) => ({
						code,
						status: "copied",
						count: (current?.code === code ? current.count : 0) + 1,
					}));
				}
			} catch {
				if (mounted.current) {
					setFeedback((current) => ({
						code,
						status: "error",
						count: (current?.code === code ? current.count : 0) + 1,
					}));
				}
			} finally {
				locked.current = false;
			}
		},
	};
}
