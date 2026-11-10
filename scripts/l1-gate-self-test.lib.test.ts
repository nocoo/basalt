import { describe, expect, it } from "vitest";
import { evaluateProbe } from "./l1-gate-self-test.lib";

describe("evaluateProbe", () => {
	it("accepts a zero exit when pass is expected", () => {
		const result = evaluateProbe("healthy", "pass", {
			exitCode: 0,
			signal: null,
			durationMs: 1,
		});
		expect(result.passed).toBe(true);
	});

	it("rejects a zero exit when rejection is expected", () => {
		const result = evaluateProbe("lint-error", "reject", {
			exitCode: 0,
			signal: null,
			durationMs: 1,
		});
		expect(result.passed).toBe(false);
	});

	it("accepts SIGINT as rejection", () => {
		const result = evaluateProbe("interrupt", "reject", {
			exitCode: null,
			signal: "SIGINT",
			durationMs: 5,
		});
		expect(result.passed).toBe(true);
	});
});
