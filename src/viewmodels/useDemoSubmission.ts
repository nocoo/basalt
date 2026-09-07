import { useEffect, useRef, useState } from "react";

/** A cancellable local service simulation. No network, storage, or DOM ownership. */
export function useDemoSubmission<T>() {
	const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
	const [result, setResult] = useState<T | null>(null);
	const [failNext, setFailNext] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const last = useRef<{ value: T } | null>(null);

	useEffect(
		() => () => {
			if (timer.current !== null) clearTimeout(timer.current);
		},
		[],
	);

	function submit(value: T, fail = failNext) {
		if (timer.current !== null) return false;
		last.current = { value };
		setStatus("pending");
		setFailNext(false);
		timer.current = setTimeout(() => {
			timer.current = null;
			if (fail) {
				setStatus("error");
			} else {
				setResult(value);
				setStatus("success");
			}
		}, 500);
		return true;
	}

	function cancel() {
		if (timer.current !== null) clearTimeout(timer.current);
		timer.current = null;
		setStatus("idle");
	}

	return {
		status,
		result,
		failNext,
		setFailNext,
		submit,
		cancel,
		retry: () => {
			if (last.current) submit(last.current.value, false);
		},
	};
}
