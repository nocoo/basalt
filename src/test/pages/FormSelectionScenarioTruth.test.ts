import { describe, expect, it } from "vitest";
import { UI_EXAMPLES } from "@/pages/ui/demos";
import { CATALOG_DOCS } from "@/pages/ui/docs";
import { FIELD_EXAMPLES } from "@/pages/ui/examples/field";
import { INPUT_EXAMPLES } from "@/pages/ui/examples/input";

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
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
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
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual(["field-hint", "field-error"]);
	});

	it("keeps field hint and error ids aligned with preview", () => {
		const hint = scenario("field", "field-hint");
		expect(hint.title).toBe("Hint");
		expect(hint.code).toContain("export default");
		expect(hint.code).toContain("@nocoo/basalt/components/field");
		expect(hint.code).toContain("@nocoo/basalt/components/input");
		expect(hint.code).toContain('htmlFor="field-hint-email"');
		expect(hint.code).toContain('id="field-hint-email"');
		expect(hint.code).toContain('label="Email"');
		expect(hint.code).toContain('hint="Never shared"');
		expect(hint.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		const error = scenario("field", "field-error");
		expect(error.title).toBe("Error");
		expect(error.code).toContain('htmlFor="field-error-email"');
		expect(error.code).toContain('id="field-error-email"');
		expect(error.code).toContain('error="Required"');
		expect(error.code).not.toContain("kumo-ex-email");
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
		const labeled = scenario("input", "input-with-label-and-description");
		expect(labeled.code).toContain("export default");
		expect(labeled.code).toContain("@nocoo/basalt/components/field");
		expect(labeled.code).toContain("@nocoo/basalt/components/input");
		expect(labeled.code).toContain("<Field ");
		expect(labeled.code).toContain('htmlFor="ex-input-email"');
		expect(labeled.code).toContain('id="ex-input-email"');
		expect(labeled.code).toContain('hint="Never shared"');
		expect(labeled.code).toContain('placeholder="you@example.com"');
		expect(labeled.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		const error = scenario("input", "input-with-error-string");
		expect(error.code).toContain('htmlFor="ex-input-err"');
		expect(error.code).toContain('id="ex-input-err"');
		expect(error.code).toContain('error="Required"');
		expect(error.code).toContain("export default");
		const disabled = scenario("input", "input-disabled");
		expect(disabled.code).toContain("aria-label=");
		expect(disabled.code).toContain('aria-label="Disabled input"');
		expect(disabled.code).toContain('value="Read only"');
		expect(disabled.code).toContain("disabled");
		const types = scenario("input", "input-input-types");
		expect(types.code).toContain('type="search"');
		expect(types.code).toContain("aria-label=");
		expect(types.code).toContain('<div className="flex w-full flex-col gap-3">');
		expect(types.code).toContain('type="email"');
		expect(types.code).toContain('type="password"');
		expect(types.code).toContain('aria-label="Email type"');
		expect(types.code).toContain('aria-label="Password type"');
		expect(types.code).toContain('aria-label="Search type"');
		expect(types.code.indexOf('type="email"')).toBeLessThan(types.code.indexOf('type="password"'));
		expect(types.code.indexOf('type="password"')).toBeLessThan(types.code.indexOf('type="search"'));
		expect(scenario("input", "input-bare-input-no-label").code).toContain('aria-label="Name"');
		expect(scenario("input", "input-bare-input-no-label").code).toContain('placeholder="Jane Doe"');
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
