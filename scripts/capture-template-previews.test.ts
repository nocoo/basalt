import { describe, expect, it } from "vitest";
import { verifyCaptureVersion } from "./capture-template-previews";

describe("template capture version", () => {
	it("records the version observed in the rendered catalog", () => {
		expect(verifyCaptureVersion("v3.2.3", "3.2.3")).toBe("3.2.3");
	});

	it.each(["v2.2.0", "v3.2.4", ""])("rejects a stale or missing served version: %s", (version) => {
		expect(() => verifyCaptureVersion(version, "3.2.3")).toThrow(
			"The served catalog must match the checkout version",
		);
	});
});
