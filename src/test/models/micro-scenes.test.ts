import { describe, expect, it } from "vitest";
import {
	ALLOCATIONS,
	AVAILABLE_ATTACHMENTS,
	DECISIONS,
	filterAttachments,
	filterLedger,
	INITIAL_ATTACHMENTS,
	LEDGER,
	METRICS,
	removeAttachment,
	selectDecision,
	selectWorkspaceItem,
	TOKEN_BUDGET,
	TRACE_STEPS,
	toggleAttachment,
	WORKSPACE_ITEMS,
} from "@/models/micro-scenes";

describe("micro-scene data", () => {
	it("adds, toggles, removes and searches attachments without mutation", () => {
		const original = [...INITIAL_ATTACHMENTS];
		expect(toggleAttachment(original, "tokens.diff")).toEqual(["sidebar-audit.json"]);
		expect(toggleAttachment(original, "contrast-report.csv")).toEqual([
			...original,
			"contrast-report.csv",
		]);
		expect(removeAttachment(original, "unknown")).toEqual(original);
		expect(removeAttachment(original, "sidebar-audit.json")).toEqual(["tokens.diff"]);
		expect(original).toEqual(INITIAL_ATTACHMENTS);
		expect(filterAttachments("")).toEqual(AVAILABLE_ATTACHMENTS);
		expect(filterAttachments("  SIDEBAR ")).toEqual(["sidebar-audit.json"]);
		expect(filterAttachments("missing")).toEqual([]);
	});
	it("selects only known navigation and decision values", () => {
		expect(WORKSPACE_ITEMS).toHaveLength(5);
		expect(WORKSPACE_ITEMS.find((item) => item.id === "inbox")).toMatchObject({ count: 12 });
		expect(selectWorkspaceItem("overview", "billing")).toBe("billing");
		expect(selectWorkspaceItem("overview", "unknown")).toBe("overview");
		expect(DECISIONS).toHaveLength(3);
		expect(selectDecision(null, "canary")).toBe("canary");
		expect(selectDecision(null, "unknown")).toBeNull();
		expect(selectDecision("draft", "unknown")).toBe("draft");
	});
	it("keeps trace, metrics, allocation and ledger deterministic", () => {
		expect(TRACE_STEPS.map((step) => step.status)).toEqual(["complete", "complete", "running"]);
		expect(TOKEN_BUDGET).toEqual({ value: 68, reading: "1,360 / 2,000 tok" });
		expect(METRICS.map((metric) => metric.value)).toEqual(["42", "0.4%"]);
		expect(ALLOCATIONS.map((item) => item.id)).toEqual(["compute", "storage", "bandwidth"]);
		expect(filterLedger("all")).toEqual(LEDGER);
		expect(filterLedger("paid")).toHaveLength(2);
		expect(filterLedger("pending")).toHaveLength(1);
		expect(filterLedger("failed")).toHaveLength(1);
	});
});
