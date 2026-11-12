import { describe, expect, it } from "vitest";
import { SLOTS } from "./slots";

describe("quality slot commands", () => {
	it("keeps a new-branch secret range as one shell argument", () => {
		const g1 = SLOTS.find((slot) => slot.id === "G1");
		const steps = g1?.stepsFor?.({
			root: "/tmp/repo",
			gitRoot: "/tmp/repo",
			g1Range: "abc123 --not --remotes",
		});

		expect(steps?.[0]?.command).toContain("--range='abc123 --not --remotes'");
	});
});
