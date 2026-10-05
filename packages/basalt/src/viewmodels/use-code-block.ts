import { useEffect, useMemo, useRef, useState } from "react";
import { codeLines } from "../models/code";

export function useCodeBlock(code: string, highlighted: boolean) {
	const lines = useMemo(() => codeLines(code, highlighted), [code, highlighted]);
	const [feedback, setFeedback] = useState<{
		code: string;
		status: "pending" | "copied" | "error";
	} | null>(null);
	const locked = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	return {
		lines,
		status: feedback?.code === code ? feedback.status : "idle",
		async copy(write: (text: string) => Promise<void>) {
			if (locked.current) return;
			locked.current = true;
			setFeedback({ code, status: "pending" });
			try {
				await write(code);
				if (mounted.current) setFeedback({ code, status: "copied" });
			} catch {
				if (mounted.current) setFeedback({ code, status: "error" });
			} finally {
				locked.current = false;
			}
		},
	};
}
