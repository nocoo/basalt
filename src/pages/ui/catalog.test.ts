import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";

describe("catalog entries", () => {
	it("does not carry a maturity field on catalog entries", () => {
		expect(CATALOG.filter((entry) => entry.category === "component")).toHaveLength(65);
		expect(CATALOG.every((entry) => !("maturity" in entry))).toBe(true);
	});
});
