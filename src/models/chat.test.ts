import { describe, expect, it } from "vitest";
import {
	activeThread,
	type ChatState,
	chatTrace,
	initialChatState,
	chatReducer as reduce,
} from "./chat";

function ticks(state: ChatState, count = 100) {
	for (let i = 0; i < count; i++) state = reduce(state, { type: "tick" });
	return state;
}
const send = (state = initialChatState(), text = "Plan a chat") =>
	reduce(state, { type: "send", text });
function last(state: ChatState) {
	const message = activeThread(state).messages.slice(-1)[0];
	if (!message) throw new Error("Expected a response");
	return message;
}

describe("local conversation state", () => {
	it("streams a single response, refuses duplicates, and retains a draft during streaming", () => {
		let state = send();
		expect(reduce(state, { type: "send", text: "duplicate" })).toBe(state);
		expect(reduce(state, { type: "options", model: "fast" })).toBe(state);
		expect(last(state)?.phase).toBe("thinking");
		expect(chatTrace(last(state)).thinking[0].status).toBe("running");
		state = ticks(state, 8);
		expect(chatTrace(last(state)).tools[0].status).toBe("running");
		state = reduce(state, { type: "draft", text: "Next question" });
		state = ticks(state);
		expect(last(state)?.phase).toBe("complete");
		expect(last(state)?.text).toContain("A focused plan");
		expect(activeThread(state).draft).toBe("Next question");
		expect(state.run).toBeNull();
		expect(chatTrace(last(state)).tools[0].status).toBe("complete");
	});
	it("pauses for approval and never advances before explicit approval or rejection", () => {
		let state = ticks(send(initialChatState(), "Update CSS"));
		expect(last(state)?.phase).toBe("approval");
		expect(ticks(state)).toBe(state);
		for (const decision of ["apply", "skip"] as const) {
			const done = ticks(reduce(state, { type: "approve", decision }));
			expect(last(done)?.decision).toBe(decision);
			expect(last(done)?.text).toContain(
				decision === "apply" ? "Preview approved" : "Execution declined",
			);
			expect(last(done)?.text).toContain("field-sizing: content");
			expect(last(done)?.phase).toBe("complete");
		}
		state = reduce(state, { type: "stop" });
		expect(last(state)?.phase).toBe("stopped");
		expect(chatTrace(last(state)).thinking[0].status).toBe("pending");
		expect(chatTrace(last(state)).tools[0].status).toBe("pending");
	});
	it("keeps partial output on stop and retries without duplicated user messages", () => {
		let state = ticks(send(), 18);
		const partial = last(state)?.text;
		expect(partial?.length).toBeGreaterThan(0);
		state = reduce(state, { type: "stop" });
		expect(last(state)?.text).toBe(partial);
		state = reduce(state, { type: "draft", text: "Keep this draft" });
		state = reduce(state, { type: "regenerate", id: last(state).id });
		expect(activeThread(state).draft).toBe("Keep this draft");
		state = ticks(state);
		expect(activeThread(state).messages).toHaveLength(2);
		expect(last(state)?.phase).toBe("complete");
		state = reduce(state, { type: "fail", value: true });
		state = ticks(send(state, "Failure"));
		expect(last(state)?.phase).toBe("error");
		expect(chatTrace(last(state)).thinking[0].status).toBe("error");
		expect(chatTrace(last(state)).tools[0].status).toBe("error");
		state = ticks(reduce(state, { type: "regenerate", id: last(state).id }));
		expect(last(state)?.phase).toBe("complete");
		expect(activeThread(state).messages).toHaveLength(4);
	});
	it("isolates thread histories, options and drafts and stops on navigation", () => {
		let state = reduce(initialChatState(), { type: "draft", text: "Remember me" });
		state = reduce(state, { type: "options", reasoning: false, search: false, model: "fast" });
		state = reduce(state, { type: "new" });
		expect(activeThread(state).draft).toBe("");
		state = send(state, "New thread");
		const second = state.activeId;
		state = reduce(state, { type: "select", id: "chat-0" });
		expect(state.run).toBeNull();
		expect(activeThread(state).draft).toBe("Remember me");
		expect(activeThread(state).model).toBe("fast");
		state = ticks(send(state));
		expect(last(state)?.reasoning).toBe(false);
		expect(chatTrace(last(state)).tools[0].label).toBe("Read conversation");
		state = reduce(state, { type: "select", id: second });
		expect(last(state)?.phase).toBe("stopped");
		state = reduce(state, { type: "rename", title: "  Renamed  " });
		expect(activeThread(state).title).toBe("Renamed");
		state = ticks(reduce(state, { type: "regenerate", id: last(state).id }));
		expect(activeThread(state).title).toBe("Renamed");
		state = reduce(state, { type: "delete", id: "chat-0" });
		expect(state.activeId).toBe(second);
		state = reduce(state, { type: "new" });
		state = reduce(state, { type: "delete", id: state.activeId });
		expect(state.activeId).toBe(second);
		state = reduce(state, { type: "delete", id: second });
		expect(state.threads).toHaveLength(1);
		expect(activeThread(state).messages).toEqual([]);
	});
	it("edits and resends an earlier prompt and truncates the following history", () => {
		let state = ticks(send());
		const id = activeThread(state).messages[0].id;
		state = ticks(send(state, "Second question"));
		state = reduce(state, { type: "edit", id });
		state = reduce(state, { type: "editText", text: "Edited" });
		expect(state.editing?.text).toBe("Edited");
		state = reduce(state, { type: "send", text: "Edited", edit: true });
		expect(state.editing).toBeNull();
		expect(activeThread(state).messages).toHaveLength(2);
		expect(activeThread(state).messages[0].text).toBe("Edited");
		state = ticks(state);
		state = reduce(state, { type: "feedback", id: last(state).id, value: "up" });
		expect(last(state)?.feedback).toBe("up");
		state = reduce(state, { type: "feedback", id: last(state).id, value: "up" });
		expect(last(state)?.feedback).toBeUndefined();
		state = reduce(state, { type: "edit", id: activeThread(state).messages[0].id });
		state = reduce(state, { type: "cancelEdit" });
		expect(state.editing).toBeNull();
		state = reduce(send(state), { type: "clear" });
		expect(activeThread(state).messages).toEqual([]);
		expect(state.run).toBeNull();
	});
	it("validates file metadata without reading bytes, supports attachment-only send and retry", () => {
		let state = initialChatState();
		for (const files of [
			[{ name: "huge.pdf", size: 11e6, type: "application/pdf" }],
			[{ name: "app", size: 2, type: "application/executable" }],
			Array.from({ length: 4 }, () => ({ name: "text", size: 1, type: "text/plain" })),
		]) {
			state = reduce(state, { type: "files", files });
			expect(state.error).toContain("up to 3");
			expect(activeThread(state).files).toEqual([]);
		}
		state = reduce(state, {
			type: "files",
			files: [
				{ name: "notes.txt", size: 3, type: "text/plain" },
				{ name: "photo.png", size: 10, type: "image/png" },
			],
		});
		expect(state.error).toBe("");
		state = reduce(state, { type: "removeFile", id: activeThread(state).files[1].id });
		state = send(state, "");
		expect(activeThread(state).files).toEqual([]);
		expect(reduce(state, { type: "files", files: [] })).toBe(state);
		expect(reduce(state, { type: "removeFile", id: "x" })).toBe(state);
		state = ticks(state);
		expect(last(state)?.text).toContain("notes.txt");
		state = ticks(reduce(state, { type: "regenerate", id: last(state).id }));
		expect(last(state)?.text).toContain("notes.txt");
		state = reduce(state, { type: "edit", id: activeThread(state).messages[0].id });
		state = ticks(reduce(state, { type: "send", text: "Reconsider", edit: true }));
		expect(last(state)?.text).toContain("notes.txt");
	});
	it("ignores invalid actions and prevents editing or retrying during a run", () => {
		const state = initialChatState();
		for (const action of [
			{ type: "send", text: " " },
			{ type: "send", text: "x", edit: true },
			{ type: "send", text: "", edit: true },
			{ type: "tick" },
			{ type: "stop" },
			{ type: "select", id: "missing" },
			{ type: "select", id: state.activeId },
			{ type: "delete", id: "missing" },
			{ type: "rename", title: " " },
			{ type: "regenerate", id: "missing" },
			{ type: "edit", id: "missing" },
			{ type: "editText", text: "x" },
			{ type: "approve", decision: "apply" },
		] as const)
			expect(reduce(state, action)).toBe(state);
		const running = send(state);
		for (const action of [
			{ type: "edit", id: activeThread(running).messages[0].id },
			{ type: "regenerate", id: last(running).id },
			{ type: "approve", decision: "skip" },
		] as const)
			expect(reduce(running, action)).toBe(running);
		const unchanged = reduce(state, { type: "options", model: "missing" });
		expect(activeThread(unchanged).model).toBe("balanced");
	});
});
