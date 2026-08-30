import { describe, expect, it } from "vitest";
import { UI_EXAMPLES } from "@/pages/ui/demos";
import { CATALOG_DOCS } from "@/pages/ui/docs";

function scenario(slug: string, id: string) {
	const match = UI_EXAMPLES[slug]?.find((item) => item.id === id);
	expect(match, id).toBeDefined();
	if (!match) {
		throw new Error(`missing scenario ${id}`);
	}
	return match;
}

function importedNames(source: string): Set<string> {
	const names = new Set<string>();
	for (const block of source.matchAll(/import\s+\{([^}]+)\}\s+from/g)) {
		for (const part of block[1].split(",")) {
			const name = part
				.trim()
				.split(/\s+as\s+/)[0]
				?.trim();
			if (name) {
				names.add(name);
			}
		}
	}
	return names;
}

function expectUsageImportsCover(usage: string, names: string[]) {
	const imported = importedNames(usage);
	for (const name of names) {
		expect(imported.has(name), `${name} imported`).toBe(true);
		expect(usage, name).toContain(`<${name}`);
	}
}

function hasAccessibleName(source: string) {
	return /aria-label=|<Field |<Label /.test(source);
}

describe("form selection scenario truth", () => {
	it("keeps audited scenario ids and counts", () => {
		expect(UI_EXAMPLES.checkbox?.map((item) => item.id)).toEqual([
			"checkbox-default",
			"checkbox-checked",
			"checkbox-indeterminate",
			"checkbox-disabled",
			"checkbox-error",
		]);
		expect(UI_EXAMPLES.combobox?.map((item) => item.id)).toEqual([
			"combobox-searchable-select-with-placeholder",
			"combobox-disabled",
		]);
		expect(UI_EXAMPLES["date-picker"]?.map((item) => item.id)).toEqual([
			"date-picker-single-date-selection",
		]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([
			"input-with-label-and-description",
			"input-with-error-string",
			"input-disabled",
			"input-input-types",
			"input-bare-input-no-label",
		]);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([
			"input-area-with-label",
			"input-area-custom-row-count",
			"input-area-error-state-string",
			"input-area-disabled",
		]);
		expect(UI_EXAMPLES["input-group"]?.map((item) => item.id)).toEqual([
			"input-group-inline-suffix",
			"input-group-icon",
			"input-group-text",
			"input-group-button",
			"input-group-loading",
		]);
		expect(UI_EXAMPLES.radio?.map((item) => item.id)).toEqual([
			"radio-default-vertical",
			"radio-horizontal",
			"radio-disabled",
		]);
		expect(UI_EXAMPLES["sensitive-input"]?.map((item) => item.id)).toEqual([
			"sensitive-input-default",
			"sensitive-input-disabled",
		]);
		expect(UI_EXAMPLES.switch?.map((item) => item.id)).toEqual([
			"switch-off-state",
			"switch-on-state",
			"switch-disabled",
			"switch-sizes",
		]);
	});

	it("keeps checkbox and switch codes named like their renders", () => {
		expect(scenario("checkbox", "checkbox-default").code).toContain('aria-label="Unchecked"');
		expect(scenario("checkbox", "checkbox-checked").code).toContain('aria-label="Checked"');
		expect(scenario("checkbox", "checkbox-disabled").code).toContain('aria-label="Disabled off"');
		expect(scenario("checkbox", "checkbox-disabled").code).toContain('aria-label="Disabled on"');
		expect(scenario("checkbox", "checkbox-error").code).toContain("<Field ");
		expect(scenario("switch", "switch-off-state").code).toContain('aria-label="Off"');
		expect(scenario("switch", "switch-on-state").code).toContain('aria-label="On"');
		expect(scenario("switch", "switch-disabled").code).toContain('aria-label="Disabled off"');
		expect(scenario("switch", "switch-sizes").code).toContain('aria-label="Small"');
	});

	it("keeps standalone inputs named and input groups labelled", () => {
		expect(scenario("input", "input-disabled").code).toContain("aria-label=");
		expect(scenario("input", "input-input-types").code).toContain('type="search"');
		expect(scenario("input", "input-input-types").code).toContain("aria-label=");
		expect(scenario("input", "input-with-label-and-description").code).toContain("placeholder=");
		expect(scenario("input", "input-with-label-and-description").code).toContain("<Field ");
		expect(scenario("input-area", "input-area-custom-row-count").code).toContain("aria-label=");
		expect(scenario("input-area", "input-area-disabled").code).toContain("aria-label=");
		expect(scenario("sensitive-input", "sensitive-input-default").code).toContain("aria-label=");
		expect(scenario("sensitive-input", "sensitive-input-disabled").code).toContain("aria-label=");
		for (const example of UI_EXAMPLES["input-group"] ?? []) {
			expect(example.code, example.id).toContain("aria-label=");
		}
		expect(scenario("input-group", "input-group-loading").code).toContain("Loader size={16}");
	});

	it("shows radio labels instead of ellipsis shells", () => {
		expect(scenario("radio", "radio-default-vertical").code).toContain("<Label");
		expect(scenario("radio", "radio-default-vertical").code).toContain("Alpha");
		expect(scenario("radio", "radio-horizontal").code).not.toContain("…");
		expect(scenario("radio", "radio-horizontal").code).toContain("<Label");
		expect(scenario("radio", "radio-disabled").code).toContain("RadioGroup");
		expect(scenario("radio", "radio-disabled").code).toContain("aria-label=");
	});

	it("keeps combobox items and date picker names in usage", () => {
		expect(scenario("combobox", "combobox-disabled").code).toContain("items=");
		expect(scenario("combobox", "combobox-disabled").code).toContain('placeholder="Disabled"');
		expectUsageImportsCover(CATALOG_DOCS.combobox?.usage ?? "", ["Combobox"]);
		expect(CATALOG_DOCS.combobox?.usage).toContain("items=");
		expect(CATALOG_DOCS.combobox?.usage).not.toMatch(/<Combobox\s*\/>/);
		expectUsageImportsCover(CATALOG_DOCS["date-picker"]?.usage ?? "", ["DatePicker"]);
		expect(CATALOG_DOCS["date-picker"]?.usage).toContain("aria-label=");
		expect(CATALOG_DOCS["date-picker"]?.usage).not.toMatch(/<DatePicker\s*\/>/);
		expect(scenario("date-picker", "date-picker-single-date-selection").code).toContain(
			"aria-label=",
		);
	});

	it("imports jsx parts used by form docs usage", () => {
		expectUsageImportsCover(CATALOG_DOCS.input?.usage ?? "", ["Input"]);
		expect(hasAccessibleName(CATALOG_DOCS.input?.usage ?? "")).toBe(true);
		expectUsageImportsCover(CATALOG_DOCS["input-area"]?.usage ?? "", ["InputArea"]);
		expect(hasAccessibleName(CATALOG_DOCS["input-area"]?.usage ?? "")).toBe(true);
		expectUsageImportsCover(CATALOG_DOCS["sensitive-input"]?.usage ?? "", ["SensitiveInput"]);
		expect(hasAccessibleName(CATALOG_DOCS["sensitive-input"]?.usage ?? "")).toBe(true);
		expectUsageImportsCover(CATALOG_DOCS.checkbox?.usage ?? "", ["Checkbox"]);
		expect(hasAccessibleName(CATALOG_DOCS.checkbox?.usage ?? "")).toBe(true);
		expectUsageImportsCover(CATALOG_DOCS.switch?.usage ?? "", ["Switch"]);
		expect(hasAccessibleName(CATALOG_DOCS.switch?.usage ?? "")).toBe(true);
		expectUsageImportsCover(CATALOG_DOCS.radio?.usage ?? "", ["RadioGroup", "Radio"]);
		expect(hasAccessibleName(CATALOG_DOCS.radio?.usage ?? "")).toBe(true);
		expectUsageImportsCover(CATALOG_DOCS["input-group"]?.usage ?? "", ["InputGroup"]);
		expect(CATALOG_DOCS["input-group"]?.usage).toContain("InputGroup.Input");
		expect(CATALOG_DOCS["input-group"]?.usage).toContain("InputGroup.Suffix");
		expect(hasAccessibleName(CATALOG_DOCS["input-group"]?.usage ?? "")).toBe(true);
	});
});
