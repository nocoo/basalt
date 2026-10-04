import { useEffect, useRef, useState } from "react";

export function useLoaderViewModel(showElapsed: boolean, elapsedDelayMs: number) {
	const started = useRef(performance.now());
	const [elapsed, setElapsed] = useState(0);
	useEffect(() => {
		if (!showElapsed) return;
		const update = () => setElapsed(Math.max(0, performance.now() - started.current));
		update();
		const timer = setInterval(update, 100);
		return () => clearInterval(timer);
	}, [showElapsed]);
	const delay = Number.isFinite(elapsedDelayMs) ? Math.max(0, elapsedDelayMs) : 5000;
	const seconds = Math.floor(elapsed / 100) / 10;
	return {
		visible: showElapsed && elapsed >= delay,
		text:
			seconds < 60
				? `${seconds.toFixed(1)}s`
				: `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`,
	};
}
