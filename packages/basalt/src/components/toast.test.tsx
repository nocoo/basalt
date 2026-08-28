import { describe, expect, it } from "vitest";
import { toast } from "./toast";

describe("toast", () => {
	it("exports a callable toast function", () => {
		expect(typeof toast).toBe("function");
	});
});
