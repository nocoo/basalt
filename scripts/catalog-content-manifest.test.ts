import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	deriveCatalogContentFamily,
	familyIdFromFile,
	GENERATE_COMMAND,
	listCatalogFamilyFiles,
	renderCatalogContentFamilyModule,
} from "./catalog-content-manifest";

describe("catalog content family manifest", () => {
	it("discovers family files from disk without a handwritten family allowlist", () => {
		expect(listCatalogFamilyFiles(process.cwd())).toEqual([
			"feedback.tsx",
			"forms.tsx",
			"foundation.tsx",
			"overlay.tsx",
		]);
		expect(familyIdFromFile("foundation.tsx")).toBe("foundation");
		expect(GENERATE_COMMAND).toBe("bun run catalog-content:generate");
	});

	it("derives slug owners from actual family record keys", () => {
		const entries = deriveCatalogContentFamily([
			{
				family: "foundation",
				record: {
					button: { docs: {}, examples: [{ id: "button-variants" }] },
					link: { docs: {}, examples: [{ id: "link-default" }] },
				},
			},
		]);
		expect(entries).toEqual([
			["button", "foundation"],
			["link", "foundation"],
		]);
		expect(renderCatalogContentFamilyModule(entries)).toContain('\tbutton: "foundation",');
		expect(renderCatalogContentFamilyModule(entries)).not.toContain("ready");
		expect(renderCatalogContentFamilyModule(entries)).not.toContain("planned");
	});

	it("fails on duplicate keys, missing docs, empty examples, and bad scenario ids", () => {
		expect(() =>
			deriveCatalogContentFamily([
				{
					family: "foundation",
					record: { button: { docs: {}, examples: [{ id: "button-a" }] } },
				},
				{
					family: "forms",
					record: { button: { docs: {}, examples: [{ id: "button-b" }] } },
				},
			]),
		).toThrow('Duplicate catalog content slug "button" in foundation and forms');
		expect(() =>
			deriveCatalogContentFamily([
				{
					family: "foundation",
					record: { button: { examples: [{ id: "button-a" }] } },
				},
			]),
		).toThrow('Catalog content family "foundation" is missing docs for "button"');
		expect(() =>
			deriveCatalogContentFamily([
				{
					family: "foundation",
					record: { button: { docs: {}, examples: [] } },
				},
			]),
		).toThrow('Catalog content family "foundation" is missing examples for "button"');
		expect(() =>
			deriveCatalogContentFamily([
				{
					family: "foundation",
					record: { button: { docs: {}, examples: [{ id: "variants" }] } },
				},
			]),
		).toThrow(
			'Catalog content family "foundation" has invalid scenario id "variants" for "button"',
		);
	});

	it("lists family files from the families directory rather than a slug allowlist", () => {
		const root = mkdtempSync(path.join(tmpdir(), "catalog-content-"));
		const dir = path.join(root, "src/pages/ui/catalog-content/families");
		mkdirSync(dir, { recursive: true });
		writeFileSync(path.join(dir, "overlay.tsx"), "export default {}");
		writeFileSync(path.join(dir, "foundation.tsx"), "export default {}");
		expect(listCatalogFamilyFiles(root)).toEqual(["foundation.tsx", "overlay.tsx"]);
	});
});
