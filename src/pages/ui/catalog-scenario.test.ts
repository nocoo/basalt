import { describe, expect, it } from "vitest";
import { catalogScenarioId, catalogScenarioMatchesSlug } from "./catalog-scenario";

describe("catalog scenario ids", () => {
	it("joins an explicit slug and semantic key", () => {
		expect(catalogScenarioId("button", "variants")).toBe("button-variants");
		expect(catalogScenarioId("clipboard-text", "api-key")).toBe("clipboard-text-api-key");
	});

	it("does not encode array indexes", () => {
		expect(catalogScenarioId("text", "semantic-html")).not.toMatch(/-\d+$/);
	});

	it("matches ids to the owning slug prefix", () => {
		expect(catalogScenarioMatchesSlug("code-typescript", "code")).toBe(true);
		expect(catalogScenarioMatchesSlug("code-block-line-numbers", "code-block")).toBe(true);
		expect(catalogScenarioMatchesSlug("code", "code")).toBe(false);
		expect(catalogScenarioMatchesSlug("button-variants", "badge")).toBe(false);
	});
});
