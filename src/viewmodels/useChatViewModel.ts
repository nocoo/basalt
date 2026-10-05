import { useEffect, useReducer } from "react";
import { activeThread, chatReducer, initialChatState } from "@/models/chat";

export function useChatViewModel() {
	const [state, dispatch] = useReducer(chatReducer, undefined, initialChatState);
	const thread = activeThread(state);
	const waiting = thread.messages.slice(-1)[0]?.phase === "approval";
	const running = Boolean(state.run);
	useEffect(() => {
		if (!running || waiting) return;
		const timer = setInterval(() => dispatch({ type: "tick" }), 100);
		return () => clearInterval(timer);
	}, [running, waiting]);
	return { ...state, thread, running, waiting, dispatch };
}
