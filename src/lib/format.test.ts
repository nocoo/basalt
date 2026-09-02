import { describe, expect, it } from "vitest";
import { formatPercent, formatUsd } from "./format";

describe("formatUsd", () => {
	it("formats whole dollars", () => {
		expect(formatUsd(8800)).toBe("$8,800");
		expect(formatUsd(0)).toBe("$0");
	});
});

describe("formatPercent", () => {
	it("rounds to a whole percent", () => {
		expect(formatPercent(78.4)).toBe("78%");
		expect(formatPercent(12)).toBe("12%");
	});
});
