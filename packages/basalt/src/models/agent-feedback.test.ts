import { describe, expect, it } from "vitest";
import {
	type ApprovalQuestion,
	approvalSnapshot,
	summarizeSteps,
	validApprovalAnswer,
} from "./agent-feedback";

const question: ApprovalQuestion = {
	id: "q",
	label: "Plan",
	type: "single",
	allowCustom: true,
	options: [
		{ id: "a", label: "A" },
		{ id: "b", label: "B", disabled: true },
	],
};
describe("agent feedback models", () => {
	it("summarizes empty, pending, running, complete and error traces", () => {
		expect(summarizeSteps([])).toEqual({ completed: 0, total: 0, status: "pending" });
		for (const status of ["pending", "running", "complete", "error"] as const)
			expect(summarizeSteps([{ id: "a", label: "A", status }]).status).toBe(status);
		expect(
			summarizeSteps([
				{ id: "a", label: "A", status: "running" },
				{ id: "b", label: "B", status: "error" },
			]).status,
		).toBe("error");
	});
	it("validates only enabled options and allowed custom answers", () => {
		expect(validApprovalAnswer(question, undefined)).toBe(false);
		expect(validApprovalAnswer(question, { selected: ["b"] })).toBe(false);
		expect(validApprovalAnswer(question, { selected: ["bogus"] })).toBe(false);
		expect(validApprovalAnswer(question, { selected: ["a"] })).toBe(true);
		expect(validApprovalAnswer(question, { selected: [], custom: "  other " })).toBe(true);
		expect(
			validApprovalAnswer({ ...question, allowCustom: false }, { selected: [], custom: "other" }),
		).toBe(false);
		expect(
			validApprovalAnswer({ ...question, required: false }, { selected: [], skipped: true }),
		).toBe(true);
		expect(validApprovalAnswer(question, { selected: [], skipped: true })).toBe(false);
		expect(
			validApprovalAnswer(
				{ ...question, options: [...question.options, { id: "c", label: "C" }] },
				{ selected: ["a", "c"] },
			),
		).toBe(false);
		expect(
			validApprovalAnswer(
				{ ...question, type: "multiple", options: [...question.options, { id: "c", label: "C" }] },
				{ selected: ["a", "c"] },
			),
		).toBe(true);
	});
	it("takes a sanitized independent submission snapshot", () => {
		const input = { q: { selected: ["a", "b", "unknown"], custom: "  other " } };
		const result = approvalSnapshot([question], input);
		expect(result).toEqual({ q: { selected: ["a"], custom: "other" } });
		result.q.selected.push("changed");
		expect(input.q.selected).toHaveLength(3);
		expect(approvalSnapshot([{ ...question, type: "multiple", allowCustom: false }], {})).toEqual({
			q: { selected: [] },
		});
		expect(approvalSnapshot([question], { q: { selected: [], skipped: true } }).q.skipped).toBe(
			true,
		);
	});
});
