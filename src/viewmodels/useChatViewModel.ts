import { useEffect, useRef, useState } from "react";

export const CHAT_THREADS = [
	{ id: "analytics", title: "Analytics", preview: "7-day error rate is 0.4%.", time: "2m" },
	{ id: "quality", title: "Quality", preview: "Crash-free sessions held.", time: "1h" },
];
export interface DemoChatMessage {
	id: string;
	variant: "user" | "assistant" | "system";
	text: string;
}
const INITIAL_MESSAGES: Record<string, DemoChatMessage[]> = {
	analytics: [
		{ id: "s1", variant: "system", text: "Today" },
		{ id: "u1", variant: "user", text: "What is the error rate?" },
		{ id: "a1", variant: "assistant", text: "The 7-day error rate is 0.4%." },
	],
	quality: [
		{ id: "s2", variant: "system", text: "Yesterday" },
		{ id: "u2", variant: "user", text: "Are sessions crash-free?" },
		{ id: "a2", variant: "assistant", text: "Crash-free sessions held at 99.8%." },
	],
};

export function useChatViewModel() {
	const [activeId, setActiveId] = useState("analytics");
	const [histories, setHistories] = useState(INITIAL_MESSAGES);
	const [status, setStatus] = useState<"idle" | "streaming" | "complete" | "stopped" | "error">(
		"idle",
	);
	const [failNext, setFailNext] = useState(false);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);
	const sequence = useRef(0);
	const last = useRef<{ thread: string; prompt: string; assistant: string } | null>(null);
	useEffect(
		() => () => {
			if (timer.current !== null) clearInterval(timer.current);
		},
		[],
	);

	function stop() {
		if (timer.current === null) return;
		clearInterval(timer.current);
		timer.current = null;
		setStatus("stopped");
	}
	function begin(prompt: string, retry = false) {
		const text = prompt.trim();
		if (!text || timer.current !== null) return;
		const thread = activeId;
		const id = `local-${++sequence.current}`;
		const previous = retry ? last.current?.assistant : undefined;
		const fail = !retry && failNext;
		last.current = { thread, prompt: text, assistant: id };
		setFailNext(false);
		setHistories((current) => ({
			...current,
			[thread]: [
				...current[thread].filter((message) => message.id !== previous),
				...(!retry ? [{ id: `${id}-user`, variant: "user" as const, text }] : []),
				{ id, variant: "assistant", text: "" },
			],
		}));
		setStatus("streaming");
		const answer =
			thread === "quality"
				? `For “${text}”: crash-free sessions remain at 99.8%. The latest release passed all quality checks. Monitor new sessions after rollout and review any change in the error budget. This response is generated locally for the demo.`
				: `For “${text}”: the 7-day error rate is 0.4%, with 12,840 requests processed. Traffic is strongest in the morning. Compare the previous period before changing capacity, and inspect the affected endpoints. This response is generated locally for the demo.`;
		let offset = 0;
		timer.current = setInterval(() => {
			offset += 24;
			setHistories((current) => ({
				...current,
				[thread]: current[thread].map((message) =>
					message.id === id ? { ...message, text: answer.slice(0, offset) } : message,
				),
			}));
			if ((fail && offset >= 48) || offset >= answer.length) {
				clearInterval(timer.current as ReturnType<typeof setInterval>);
				timer.current = null;
				setStatus(fail ? "error" : "complete");
			}
		}, 100);
	}
	return {
		activeId,
		threads: CHAT_THREADS,
		messages: histories[activeId],
		status,
		failNext,
		setFailNext,
		stop,
		thread: CHAT_THREADS[activeId === "quality" ? 1 : 0],
		send: (text: string) => begin(text),
		retry: () => {
			if (last.current?.thread === activeId) begin(last.current.prompt, true);
		},
		selectThread: (id: string) => {
			if (!CHAT_THREADS.some((thread) => thread.id === id) || id === activeId) return;
			stop();
			setActiveId(id);
			setStatus("idle");
		},
		clear: () => {
			stop();
			setHistories((current) => ({ ...current, [activeId]: [] }));
			last.current = null;
			setStatus("idle");
		},
	};
}
