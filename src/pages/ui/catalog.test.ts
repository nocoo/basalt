import { describe, expect, it } from "vitest";
import { CATALOG, type CatalogEntry } from "./catalog";

function acceptMaturity(_maturity: CatalogEntry["maturity"]) {}

describe("catalog maturity", () => {
	const components = CATALOG.filter((entry) => entry.category === "component");
	const complete = components.filter((entry) => entry.maturity === "mvp-complete");
	const pending = components.filter((entry) => entry.maturity !== "mvp-complete");

	it("keeps component maturity on catalog entries only", () => {
		expect(components).toHaveLength(65);
		expect(complete).toHaveLength(8);
		expect(pending).toHaveLength(57);
		expect(
			CATALOG.filter((entry) => entry.category !== "component").every(
				(entry) => entry.maturity === undefined,
			),
		).toBe(true);
		for (const entry of CATALOG) {
			if (entry.maturity !== undefined) {
				expect(entry.maturity).toBe("mvp-complete");
			}
		}
	});

	it("accepts only mvp-complete as catalog maturity", () => {
		acceptMaturity("mvp-complete");
		acceptMaturity(undefined);
		// @ts-expect-error maturity is only mvp-complete
		acceptMaturity("pending");
		// @ts-expect-error maturity is only mvp-complete
		acceptMaturity("complete");
	});
});
