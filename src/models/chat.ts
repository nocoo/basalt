export const CHAT_MODELS = [
	{ id: "balanced", label: "Basalt Balanced" },
	{ id: "fast", label: "Basalt Fast" },
];
export type ChatPhase =
	| "thinking"
	| "tools"
	| "approval"
	| "answer"
	| "complete"
	| "stopped"
	| "error";
export type ChatFile = { id: string; name: string };
export type ChatMessage = {
	id: string;
	variant: "user" | "assistant";
	text: string;
	files?: ChatFile[];
	phase?: ChatPhase;
	feedback?: "up" | "down";
	reasoning?: boolean;
	search?: boolean;
	proposal?: boolean;
	decision?: "apply" | "skip";
	model?: string;
	elapsed?: number;
};
export type ChatThread = {
	id: string;
	title: string;
	draft: string;
	model: string;
	reasoning: boolean;
	search: boolean;
	files: ChatFile[];
	messages: ChatMessage[];
};
export type ChatState = {
	threads: ChatThread[];
	activeId: string;
	sequence: number;
	failNext: boolean;
	error: string;
	run: { thread: string; message: string; answer: string; ticks: number; fail: boolean } | null;
	editing: { id: string; text: string } | null;
};
export type ChatAction =
	| { type: "new" | "stop" | "tick" | "clear" | "cancelEdit" }
	| { type: "select" | "delete" | "edit" | "regenerate"; id: string }
	| { type: "rename"; title: string }
	| { type: "draft" | "editText"; text: string }
	| { type: "send"; text: string; edit?: boolean }
	| { type: "options"; model?: string; reasoning?: boolean; search?: boolean }
	| { type: "files"; files: readonly { name: string; size: number; type: string }[] }
	| { type: "removeFile"; id: string }
	| { type: "feedback"; id: string; value: "up" | "down" }
	| { type: "approve"; decision: "apply" | "skip" }
	| { type: "fail"; value: boolean };

function thread(id: string, title = "New conversation"): ChatThread {
	return {
		id,
		title,
		draft: "",
		model: "balanced",
		reasoning: true,
		search: true,
		files: [],
		messages: [],
	};
}
export function initialChatState(): ChatState {
	return {
		threads: [thread("chat-0")],
		activeId: "chat-0",
		sequence: 0,
		failNext: false,
		error: "",
		run: null,
		editing: null,
	};
}
export function activeThread(state: ChatState) {
	return state.threads.find((item) => item.id === state.activeId) as ChatThread;
}
function changeThread(state: ChatState, update: (item: ChatThread) => ChatThread): ChatState {
	return {
		...state,
		threads: state.threads.map((item) => (item.id === state.activeId ? update(item) : item)),
	};
}
function stop(state: ChatState): ChatState {
	if (!state.run) return state;
	const id = state.run.message;
	return {
		...changeThread(state, (item) => ({
			...item,
			messages: item.messages.map((message) =>
				message.id === id ? { ...message, phase: "stopped" } : message,
			),
		})),
		run: null,
	};
}
function answerFor(prompt: string, proposal: boolean, files: ChatFile[]): string {
	const note = files.length
		? `\n\n**Attachments:** ${files.map((file) => file.name).join(", ")}. This demo stores names only; file contents were not read or uploaded.`
		: "";
	return proposal
		? `## Proposed follow-up update\n\nKeep your appointment questions and weekly wellness notes together.\n\n| Care item | Preview |\n| --- | --- |\n| Follow-up | Prepare questions for the care team |\n| Activity | Bring the weekly activity summary |\n| Sleep | Bring the sleep report |\n\n> Preview only. No appointments or patient records have been changed. This simulated assistant does not provide medical advice.${note}`
		: `## A focused plan\n\nFor **${prompt.replace(/[[\]*_<>\n\r]/g, "").slice(0, 140)}**, organize the information you want to discuss with your care team.\n\n| Area | Preparation |\n| --- | --- |\n| Activity | Review your weekly activity report |\n| Sleep | Collect your sleep notes |\n| Appointment | Write down questions for your clinician |\n| Records | Confirm which reports you want to share |\n\n### Check-in checklist\n\n1. Review the dates and sources of your wellness records.\n2. Note questions and preferences for your next appointment.\n3. Confirm any proposed changes with your care team.\n\n**Next step:** review the recommendation below. This is a deterministic local example, not medical advice or a live model response.${note}`;
}
function begin(
	state: ChatState,
	text: string,
	history: ChatMessage[],
	files: ChatFile[],
	resetDraft = true,
): ChatState {
	const current = activeThread(state);
	const sequence = state.sequence + 1;
	const id = `message-${sequence}`;
	const proposal = /code|css|implement|update|change|修改|代码|输入框/i.test(text);
	const assistant: ChatMessage = {
		id,
		variant: "assistant",
		text: "",
		phase: current.reasoning ? "thinking" : "tools",
		reasoning: current.reasoning,
		search: current.search,
		proposal,
		model: current.model,
		elapsed: 0,
	};
	return {
		...changeThread(state, (item) => ({
			...item,
			title: item.title === "New conversation" ? text.slice(0, 40) : item.title,
			draft: resetDraft ? "" : item.draft,
			files: resetDraft ? [] : item.files,
			messages: [...history, { id: `${id}-user`, variant: "user", text, files }, assistant],
		})),
		sequence,
		editing: null,
		error: "",
		failNext: false,
		run: {
			thread: current.id,
			message: id,
			answer: answerFor(text, proposal, files),
			ticks: 0,
			fail: state.failNext,
		},
	};
}
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
	const current = activeThread(state);
	switch (action.type) {
		case "draft":
			return changeThread(state, (item) => ({ ...item, draft: action.text }));
		case "fail":
			return { ...state, failNext: action.value };
		case "options":
			if (state.run) return state;
			return changeThread(state, (item) => ({
				...item,
				model: CHAT_MODELS.some((model) => model.id === action.model)
					? (action.model as string)
					: item.model,
				reasoning: action.reasoning ?? item.reasoning,
				search: action.search ?? item.search,
			}));
		case "send": {
			if (state.run) return state;
			const text = action.text.trim();
			if (!text && (action.edit || !current.files.length)) return state;
			const index = action.edit
				? current.messages.findIndex(
						(message) => message.id === state.editing?.id && message.variant === "user",
					)
				: -1;
			if (action.edit && index < 0) return state;
			return begin(
				state,
				text || "Review these attachments",
				action.edit ? current.messages.slice(0, index) : current.messages,
				action.edit ? (current.messages[index].files ?? []) : current.files,
				!action.edit,
			);
		}
		case "tick": {
			if (!state.run) return state;
			const run = state.run;
			const message = current.messages.find((item) => item.id === run.message) as ChatMessage;
			if (message.phase === "approval") return state;
			const ticks = run.ticks + 1;
			let phase: ChatPhase | undefined = message.phase as ChatPhase;
			let text = message.text;
			if (run.fail && ticks >= 5) phase = "error";
			else if (phase === "thinking" && ticks >= 8) phase = "tools";
			else if (phase === "tools" && ticks >= (message.reasoning ? 14 : 6))
				phase = message.proposal ? "approval" : "answer";
			else if (phase === "answer") {
				text = run.answer.slice(0, text.length + (message.model === "fast" ? 90 : 42));
				if (text.length >= run.answer.length) phase = "complete";
			}
			return {
				...changeThread(state, (item) => ({
					...item,
					messages: item.messages.map((item) =>
						item.id === message.id ? { ...item, phase, text, elapsed: ticks / 10 } : item,
					),
				})),
				run: phase === "complete" || phase === "error" ? null : { ...run, ticks },
			};
		}
		case "approve":
			if (!state.run || current.messages.slice(-1)[0]?.phase !== "approval") return state;
			return changeThread(
				{
					...state,
					run: {
						...state.run,
						answer: `${action.decision === "apply" ? "**Preview approved.**" : "**Execution declined; showing a read-only explanation.**"}\n\n${state.run.answer}`,
					},
				},
				(item) => ({
					...item,
					messages: item.messages.map((message) =>
						message.id === state.run?.message
							? { ...message, phase: "answer", decision: action.decision }
							: message,
					),
				}),
			);
		case "stop":
			return stop(state);
		case "select":
			return action.id === state.activeId || !state.threads.some((item) => item.id === action.id)
				? state
				: { ...stop(state), activeId: action.id, editing: null, error: "" };
		case "new": {
			const stopped = stop(state);
			const id = `chat-${state.sequence + 1}`;
			return {
				...stopped,
				sequence: state.sequence + 1,
				activeId: id,
				editing: null,
				error: "",
				threads: [thread(id), ...stopped.threads],
			};
		}
		case "delete": {
			if (!state.threads.some((item) => item.id === action.id)) return state;
			const next = action.id === state.activeId ? stop(state) : state;
			const threads = next.threads.filter((item) => item.id !== action.id);
			if (!threads.length) return { ...initialChatState(), sequence: state.sequence };
			return {
				...next,
				threads,
				activeId: action.id === state.activeId ? threads[0].id : state.activeId,
				editing: null,
				error: "",
			};
		}
		case "rename":
			return action.title.trim()
				? changeThread(state, (item) => ({ ...item, title: action.title.trim().slice(0, 80) }))
				: state;
		case "clear":
			return {
				...changeThread(stop(state), (item) => ({ ...item, messages: [] })),
				editing: null,
				error: "",
			};
		case "regenerate": {
			if (state.run) return state;
			const index = current.messages.findIndex(
				(message) => message.id === action.id && message.variant === "assistant",
			);
			const prompt = current.messages[index - 1];
			return !prompt
				? state
				: begin(
						{ ...state, failNext: false },
						prompt.text,
						current.messages.slice(0, index - 1),
						prompt.files ?? [],
						false,
					);
		}
		case "edit": {
			const message = current.messages.find(
				(item) => item.id === action.id && item.variant === "user",
			);
			return !message || state.run
				? state
				: { ...state, editing: { id: message.id, text: message.text } };
		}
		case "editText":
			return state.editing ? { ...state, editing: { ...state.editing, text: action.text } } : state;
		case "cancelEdit":
			return { ...state, editing: null };
		case "feedback":
			return changeThread(state, (item) => ({
				...item,
				messages: item.messages.map((message) =>
					message.id === action.id && message.variant === "assistant"
						? { ...message, feedback: message.feedback === action.value ? undefined : action.value }
						: message,
				),
			}));
		case "files": {
			if (state.run) return state;
			if (
				current.files.length + action.files.length > 3 ||
				action.files.some(
					(file) =>
						file.size > 10 * 1024 * 1024 || !/^(text\/|image\/|application\/pdf$)/.test(file.type),
				)
			)
				return {
					...state,
					error:
						"Choose up to 3 images, text files or PDFs, at most 10 MB each. Nothing is uploaded.",
				};
			return {
				...changeThread(state, (item) => ({
					...item,
					files: [
						...item.files,
						...action.files.map((file, i) => ({
							id: `file-${state.sequence + i + 1}`,
							name: file.name,
						})),
					],
				})),
				sequence: state.sequence + action.files.length,
				error: "",
			};
		}
		case "removeFile":
			return state.run
				? state
				: changeThread(state, (item) => ({
						...item,
						files: item.files.filter((file) => file.id !== action.id),
					}));
	}
}

export function chatTrace(message: ChatMessage) {
	const failed = message.phase === "error";
	const interrupted = message.phase === "stopped";
	const thinking = message.phase === "thinking";
	const tools = message.phase === "tools";
	const status = failed ? "error" : interrupted ? "pending" : thinking ? "running" : "complete";
	return {
		thinking: [
			{
				id: "plan",
				label: "Plan the response",
				detail: "Public progress summary from the local demo, not private model reasoning.",
				status,
			},
		] as const,
		tools: [
			{
				id: "context",
				kind: "read",
				label: message.search ? "Search reference context" : "Read conversation",
				target: message.search ? "Care-team preparation guide" : "Current thread",
				detail:
					"Simulated tool output: organize wellness records and appointment questions; request explicit approval before updating the preview. No network request was made.",
				status: failed
					? "error"
					: interrupted || thinking
						? "pending"
						: tools
							? "running"
							: "complete",
			},
		] as const,
	};
}
