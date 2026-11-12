import { describe, expect, it } from "vitest";
import { SLOTS } from "./slots";

describe("quality slot commands", () => {
	it("keeps a secret range as one shell argument", () => {
		const g1 = SLOTS.find((slot) => slot.id === "G1");
		const newRef = g1?.stepsFor?.({
			root: "/tmp/repo",
			gitRoot: "/tmp/repo",
			g1Range: "abc123",
		});
		const existingRef = g1?.stepsFor?.({
			root: "/tmp/repo",
			gitRoot: "/tmp/repo",
			g1Range: "def456..abc123",
		});

		expect(newRef?.[0]?.command).toContain("--range='abc123'");
		expect(existingRef?.[0]?.command).toContain("--range='def456..abc123'");
	});
});
