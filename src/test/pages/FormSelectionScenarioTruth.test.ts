import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { loadCatalogContentRecord } from "@/pages/ui/catalog-content-registry";

const catalogContent = await loadCatalogContentRecord();
const UI_EXAMPLES = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.examples]),
);
const CATALOG_DOCS = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.docs]),
);

import { CHECKBOX_EXAMPLES } from "@/pages/ui/examples/checkbox";
import { FIELD_EXAMPLES } from "@/pages/ui/examples/field";
import { INPUT_EXAMPLES } from "@/pages/ui/examples/input";
import { INPUT_AREA_EXAMPLES } from "@/pages/ui/examples/input-area";
import { INPUT_GROUP_EXAMPLES } from "@/pages/ui/examples/input-group";
import { RADIO_EXAMPLES } from "@/pages/ui/examples/radio";
import { SELECT_EXAMPLES } from "@/pages/ui/examples/select";
import { SENSITIVE_INPUT_EXAMPLES } from "@/pages/ui/examples/sensitive-input";
import { SWITCH_EXAMPLES } from "@/pages/ui/examples/switch";

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
		expect(UI_EXAMPLES.checkbox).toBe(CHECKBOX_EXAMPLES);
		expect(UI_EXAMPLES.checkbox?.map((item) => item.id)).toEqual([
			"checkbox-default",
			"checkbox-checked",
			"checkbox-indeterminate",
			"checkbox-disabled",
			"checkbox-error",
			"checkbox-group-and-legend",
			"checkbox-controlled-and-error",
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
			"input-sizes",
			"input-controlled-and-reset",
		]);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([
			"input-area-with-label",
			"input-area-custom-row-count",
			"input-area-error-state-string",
			"input-area-disabled",
			"input-area-sizes",
			"input-area-controlled-and-reset",
		]);
		expect(UI_EXAMPLES["input-group"]).toBe(INPUT_GROUP_EXAMPLES);
		expect(UI_EXAMPLES["input-group"]?.map((item) => item.id)).toEqual([
			"input-group-inline-suffix",
			"input-group-icon",
			"input-group-text",
			"input-group-button",
			"input-group-loading",
		]);
		expect(UI_EXAMPLES.radio).toBe(RADIO_EXAMPLES);
		expect(UI_EXAMPLES.radio?.map((item) => item.id)).toEqual([
			"radio-default-vertical",
			"radio-horizontal",
			"radio-disabled",
			"radio-group-and-legend",
			"radio-controlled-and-error",
		]);
		expect(UI_EXAMPLES["sensitive-input"]).toBe(SENSITIVE_INPUT_EXAMPLES);
		expect(UI_EXAMPLES["sensitive-input"]?.map((item) => item.id)).toEqual([
			"sensitive-input-default",
			"sensitive-input-disabled",
		]);
		expect(UI_EXAMPLES.switch).toBe(SWITCH_EXAMPLES);
		expect(UI_EXAMPLES.switch?.map((item) => item.id)).toEqual([
			"switch-off-state",
			"switch-on-state",
			"switch-disabled",
			"switch-sizes",
			"switch-group-and-legend",
			"switch-controlled-and-error",
		]);
		expect(UI_EXAMPLES.select).toBe(SELECT_EXAMPLES);
		expect(UI_EXAMPLES.select?.map((item) => item.id)).toEqual([
			"select-basic",
			"select-placeholder",
			"select-disabled-options",
		]);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([
			"field-hint",
			"field-error",
			"field-rich-label-and-optional",
			"field-structured-error",
		]);
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
		const rich = scenario("field", "field-rich-label-and-optional");
		expect(rich.title).toBe("Rich label and optional");
		expect(rich.code).toContain("label={<span>Workspace name</span>}");
		expect(rich.code).toContain("required={false}");
		expect(rich.code).toContain('labelTooltip="Used in billing"');
		const structured = scenario("field", "field-structured-error");
		expect(structured.title).toBe("Structured error");
		expect(structured.code).toContain("error={{ message: <span>Enter a valid email</span> }}");
		expect(structured.code).not.toContain("htmlFor");
		expect(structured.code).not.toContain("id=");
	});

	it("keeps checkbox and switch codes named like their renders", () => {
		const checkboxDefault = scenario("checkbox", "checkbox-default");
		expect(checkboxDefault.code).toContain("export default");
		expect(checkboxDefault.code).toContain("@nocoo/basalt/components/checkbox");
		expect(checkboxDefault.code).toContain("import { Checkbox }");
		expect(checkboxDefault.code).toContain('aria-label="Unchecked"');
		expect(checkboxDefault.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		render(createElement(checkboxDefault.render));
		const unchecked = screen.getByRole("checkbox", { name: "Unchecked" });
		expect(unchecked).not.toBeChecked();
		expect(unchecked).toBeEnabled();
		fireEvent.click(unchecked);
		expect(unchecked).toBeChecked();
		fireEvent.click(unchecked);
		expect(unchecked).not.toBeChecked();
		cleanup();
		const checkboxChecked = scenario("checkbox", "checkbox-checked");
		expect(checkboxChecked.code).toContain("defaultChecked");
		expect(checkboxChecked.code).toContain('aria-label="Checked"');
		render(createElement(checkboxChecked.render));
		expect(screen.getByRole("checkbox", { name: "Checked" })).toBeChecked();
		cleanup();
		const checkboxIndeterminate = scenario("checkbox", "checkbox-indeterminate");
		expect(checkboxIndeterminate.code).toContain('checked="indeterminate"');
		expect(checkboxIndeterminate.code).toContain('aria-label="Partial"');
		render(createElement(checkboxIndeterminate.render));
		const partial = screen.getByRole("checkbox", { name: "Partial" });
		expect(partial).toHaveAttribute("data-state", "indeterminate");
		expect(partial).toHaveAttribute("aria-checked", "mixed");
		cleanup();
		const checkboxDisabled = scenario("checkbox", "checkbox-disabled");
		expect(checkboxDisabled.code).toContain('className="flex flex-wrap items-center gap-3"');
		expect(checkboxDisabled.code).toContain('aria-label="Disabled off"');
		expect(checkboxDisabled.code).toContain('aria-label="Disabled on"');
		render(createElement(checkboxDisabled.render));
		const disabledOff = screen.getByRole("checkbox", { name: "Disabled off" });
		const disabledOn = screen.getByRole("checkbox", { name: "Disabled on" });
		expect(disabledOff).toBeDisabled();
		expect(disabledOn).toBeDisabled();
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		fireEvent.click(disabledOff);
		fireEvent.click(disabledOn);
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		cleanup();
		const checkboxError = scenario("checkbox", "checkbox-error");
		expect(checkboxError.code).toContain("@nocoo/basalt/components/field");
		expect(checkboxError.code).toContain("<Field ");
		expect(checkboxError.code).toContain('label="Terms"');
		expect(checkboxError.code).toContain('htmlFor="ex-terms"');
		expect(checkboxError.code).toContain('error="Required"');
		expect(checkboxError.code).toContain('id="ex-terms"');
		expect(checkboxError.code).not.toContain('variant="error"');
		render(createElement(checkboxError.render));
		const terms = screen.getByRole("checkbox", { name: "Terms" });
		expect(terms).toHaveAttribute("id", "ex-terms");
		expect(terms).toHaveAttribute("aria-invalid", "true");
		expect(terms).toHaveAttribute("aria-describedby", "ex-terms-error");
		const alert = screen.getByRole("alert");
		expect(alert).toHaveAttribute("id", "ex-terms-error");
		expect(alert).toHaveTextContent("Required");
		cleanup();
		expect(scenario("checkbox", "checkbox-group-and-legend").code).toContain("Checkbox.Group");
		expect(scenario("checkbox", "checkbox-group-and-legend").code).toContain("Checkbox.Legend");
		expect(scenario("checkbox", "checkbox-controlled-and-error").code).toContain("onValueChange");
		expect(scenario("checkbox", "checkbox-controlled-and-error").code).toContain(
			"Pick at least two",
		);
		expect(scenario("switch", "switch-off-state").code).toContain('aria-label="Off"');
		expect(scenario("switch", "switch-on-state").code).toContain('aria-label="On"');
		expect(scenario("switch", "switch-disabled").code).toContain('aria-label="Disabled off"');
		expect(scenario("switch", "switch-sizes").code).toContain('aria-label="Small"');
	});

	it("toggles switch off and on, keeps disabled frozen, and preserves size classes", () => {
		expect(UI_EXAMPLES.switch).toBe(SWITCH_EXAMPLES);
		const off = scenario("switch", "switch-off-state");
		expect(off.code).toContain("export default");
		expect(off.code).toContain("@nocoo/basalt/components/switch");
		expect(off.code).toContain("import { Switch }");
		expect(off.code).toContain('aria-label="Off"');
		expect(off.code).not.toContain("defaultChecked");
		expect(off.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		render(createElement(off.render));
		const offSwitch = screen.getByRole("switch", { name: "Off" });
		expect(offSwitch).not.toBeChecked();
		expect(offSwitch).toBeEnabled();
		fireEvent.click(offSwitch);
		expect(offSwitch).toBeChecked();
		fireEvent.click(offSwitch);
		expect(offSwitch).not.toBeChecked();
		cleanup();
		const on = scenario("switch", "switch-on-state");
		expect(on.code).toContain("defaultChecked");
		expect(on.code).toContain('aria-label="On"');
		render(createElement(on.render));
		const onSwitch = screen.getByRole("switch", { name: "On" });
		expect(onSwitch).toBeChecked();
		expect(onSwitch).toBeEnabled();
		fireEvent.click(onSwitch);
		expect(onSwitch).not.toBeChecked();
		cleanup();
		const disabled = scenario("switch", "switch-disabled");
		expect(disabled.code).toContain('className="flex flex-wrap items-center gap-3"');
		expect(disabled.code).toContain('aria-label="Disabled off"');
		expect(disabled.code).toContain('aria-label="Disabled on"');
		render(createElement(disabled.render));
		const disabledOff = screen.getByRole("switch", { name: "Disabled off" });
		const disabledOn = screen.getByRole("switch", { name: "Disabled on" });
		expect(disabledOff).toBeDisabled();
		expect(disabledOn).toBeDisabled();
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		fireEvent.click(disabledOff);
		fireEvent.click(disabledOn);
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		cleanup();
		const sizes = scenario("switch", "switch-sizes");
		expect(sizes.code).toContain('className="flex flex-wrap items-center gap-3"');
		expect(sizes.code).toContain('size="sm"');
		expect(sizes.code).toContain('aria-label="Small"');
		expect(sizes.code).toContain('aria-label="Default size"');
		render(createElement(sizes.render));
		const small = screen.getByRole("switch", { name: "Small" });
		const defaultSize = screen.getByRole("switch", { name: "Default size" });
		expect(small).toBeChecked();
		expect(defaultSize).toBeChecked();
		expect(small).toBeEnabled();
		expect(defaultSize).toBeEnabled();
		expect(small.className).toContain("h-4");
		expect(small.className).toContain("w-7");
		expect(defaultSize.className).toContain("h-6");
		expect(defaultSize.className).toContain("w-11");
		cleanup();
	});

	it("selects options, keeps placeholder isolation, and leaves disabled beta unselected", () => {
		expect(UI_EXAMPLES.select).toBe(SELECT_EXAMPLES);
		const basic = scenario("select", "select-basic");
		expect(basic.code).toContain("export default");
		expect(basic.code).toContain("@nocoo/basalt/components/select");
		expect(basic.code).toContain('aria-label="Version"');
		expect(basic.code).toContain('className="w-48"');
		expect(basic.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		render(createElement(basic.render));
		const trigger = screen.getByRole("combobox", { name: "Version" });
		expect(trigger).toHaveTextContent("Select version");
		fireEvent.click(trigger);
		expect(screen.getByRole("option", { name: "v1" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("option", { name: "v2" }));
		expect(trigger).toHaveTextContent("v2");
		cleanup();
		const placeholder = scenario("select", "select-placeholder");
		render(createElement(placeholder.render));
		const empty = screen.getByRole("combobox", { name: "Empty select" });
		expect(empty).toHaveTextContent("Choose…");
		fireEvent.click(empty);
		fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
		expect(empty).toHaveTextContent("Alpha");
		cleanup();
		const disabled = scenario("select", "select-disabled-options");
		render(createElement(disabled.render));
		const disabledTrigger = screen.getByRole("combobox", { name: "Disabled option" });
		fireEvent.click(disabledTrigger);
		expect(screen.getByRole("option", { name: "Alpha" })).not.toHaveAttribute(
			"aria-disabled",
			"true",
		);
		expect(screen.getByRole("option", { name: "Beta" })).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(screen.getByRole("option", { name: "Beta" }));
		expect(disabledTrigger).toHaveTextContent("Choose…");
		cleanup();
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
		expect(scenario("input", "input-sizes").code).toContain('size="sm"');
		expect(scenario("input", "input-sizes").code).toContain('aria-label="Default"');
		expect(scenario("input", "input-sizes").code).toContain('size="lg"');
		expect(scenario("input", "input-controlled-and-reset").code).toContain("useState");
		expect(scenario("input", "input-controlled-and-reset").code).toContain("Reset");
		const areaLabel = scenario("input-area", "input-area-with-label");
		expect(areaLabel.code).toContain("export default");
		expect(areaLabel.code).toContain("@nocoo/basalt/components/field");
		expect(areaLabel.code).toContain("@nocoo/basalt/components/input-area");
		expect(areaLabel.code).toContain("<Field ");
		expect(areaLabel.code).toContain('htmlFor="ex-notes"');
		expect(areaLabel.code).toContain('id="ex-notes"');
		expect(areaLabel.code).toContain('label="Notes"');
		expect(areaLabel.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		expect(scenario("input-area", "input-area-custom-row-count").code).toContain("aria-label=");
		expect(scenario("input-area", "input-area-custom-row-count").code).toContain("rows={6}");
		expect(scenario("input-area", "input-area-custom-row-count").code).toContain(
			'aria-label="Tall notes"',
		);
		const areaError = scenario("input-area", "input-area-error-state-string");
		expect(areaError.code).toContain('htmlFor="ex-bio"');
		expect(areaError.code).toContain('id="ex-bio"');
		expect(areaError.code).toContain('error="Too short"');
		expect(areaError.code).toContain("export default");
		expect(scenario("input-area", "input-area-disabled").code).toContain("aria-label=");
		expect(scenario("input-area", "input-area-disabled").code).toContain(
			'aria-label="Disabled notes"',
		);
		expect(scenario("input-area", "input-area-disabled").code).toContain("disabled");
		expect(scenario("input-area", "input-area-disabled").code).toContain('value="Unavailable"');
		expect(scenario("input-area", "input-area-sizes").code).toContain('size="sm"');
		expect(scenario("input-area", "input-area-sizes").code).toContain('aria-label="Default notes"');
		expect(scenario("input-area", "input-area-sizes").code).toContain('size="lg"');
		expect(scenario("input-area", "input-area-controlled-and-reset").code).toContain("useState");
		expect(scenario("input-area", "input-area-controlled-and-reset").code).toContain("Reset");
		const sensitiveDefault = scenario("sensitive-input", "sensitive-input-default");
		expect(sensitiveDefault.code).toContain("export default");
		expect(sensitiveDefault.code).toContain("@nocoo/basalt/components/sensitive-input");
		expect(sensitiveDefault.code).toContain("import { SensitiveInput }");
		expect(sensitiveDefault.code).toContain('aria-label="Password"');
		expect(sensitiveDefault.code).toContain('revealLabel="Show"');
		expect(sensitiveDefault.code).toContain('hideLabel="Hide"');
		expect(sensitiveDefault.code).not.toContain("disabled");
		expect(sensitiveDefault.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
		render(createElement(sensitiveDefault.render));
		const password = screen.getByLabelText("Password");
		expect(password).toHaveAttribute("type", "password");
		expect(password).toBeEnabled();
		fireEvent.click(screen.getByRole("button", { name: "Show" }));
		expect(password).toHaveAttribute("type", "text");
		fireEvent.click(screen.getByRole("button", { name: "Hide" }));
		expect(password).toHaveAttribute("type", "password");
		expect(screen.getByRole("button", { name: "Show" })).toBeEnabled();
		cleanup();
		const sensitiveDisabled = scenario("sensitive-input", "sensitive-input-disabled");
		expect(sensitiveDisabled.code).toContain('aria-label="Disabled password"');
		expect(sensitiveDisabled.code).toContain("disabled");
		expect(sensitiveDisabled.code).toContain('revealLabel="Show"');
		expect(sensitiveDisabled.code).toContain('hideLabel="Hide"');
		expect(sensitiveDisabled.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
		render(createElement(sensitiveDisabled.render));
		const disabledInput = screen.getByLabelText("Disabled password");
		expect(disabledInput).toHaveAttribute("type", "password");
		expect(disabledInput).toBeDisabled();
		const disabledToggle = screen.getByRole("button", { name: "Show" });
		expect(disabledToggle).toBeDisabled();
		fireEvent.click(disabledToggle);
		expect(disabledInput).toHaveAttribute("type", "password");
		for (const example of UI_EXAMPLES["input-group"] ?? []) {
			expect(example.code, example.id).toContain("export default");
			expect(example.code, example.id).toContain("@nocoo/basalt/components/input-group");
			expect(example.code, example.id).toContain("import { InputGroup }");
			expect(example.code, example.id).toContain('className="max-w-sm"');
			expect(example.code, example.id).toContain("aria-label=");
			expect(example.code, example.id).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		}
		const inlineSuffix = scenario("input-group", "input-group-inline-suffix");
		expect(inlineSuffix.code).toContain("import { CircleCheck }");
		expect(inlineSuffix.code).toContain('defaultValue="atlas"');
		expect(inlineSuffix.code).toContain('aria-label="Subdomain"');
		expect(inlineSuffix.code).toContain("<InputGroup.Suffix>.example.com</InputGroup.Suffix>");
		expect(inlineSuffix.code).toContain('className="text-basalt-heatmap-green-3"');
		expect(scenario("input-group", "input-group-icon").code).toContain('aria-label="Search"');
		expect(scenario("input-group", "input-group-icon").code).toContain('placeholder="Search"');
		expect(scenario("input-group", "input-group-icon").code).toContain("<Search />");
		expect(scenario("input-group", "input-group-text").code).toContain("https://");
		expect(scenario("input-group", "input-group-text").code).toContain('aria-label="Host"');
		expect(scenario("input-group", "input-group-text").code).toContain('placeholder="example.com"');
		expect(scenario("input-group", "input-group-button").code).toContain('aria-label="Query"');
		expect(scenario("input-group", "input-group-button").code).toContain(
			'<InputGroup.Button icon={<Search />} aria-label="Search" />',
		);
		expect(scenario("input-group", "input-group-loading").code).toContain(
			"@nocoo/basalt/components/loader",
		);
		expect(scenario("input-group", "input-group-loading").code).toContain("<Loader size={16} />");
		expect(scenario("input-group", "input-group-loading").code).toContain(
			'aria-label="Loading query"',
		);
	});

	it("shows radio labels instead of ellipsis shells", () => {
		const radioDefault = scenario("radio", "radio-default-vertical");
		expect(radioDefault.code).toContain("export default");
		expect(radioDefault.code).toContain("@nocoo/basalt/components/radio");
		expect(radioDefault.code).toContain("import { Radio, RadioGroup }");
		expect(radioDefault.code).toContain("@nocoo/basalt/components/label");
		expect(radioDefault.code).toContain("<Label");
		expect(radioDefault.code).toContain("Alpha");
		expect(radioDefault.code).toContain("Beta");
		expect(radioDefault.code).toContain('className="flex flex-col gap-2"');
		expect(radioDefault.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		render(createElement(radioDefault.render));
		const defaultAlpha = screen.getByRole("radio", { name: "Alpha" });
		const defaultBeta = screen.getByRole("radio", { name: "Beta" });
		expect(defaultAlpha).toBeChecked();
		expect(defaultBeta).not.toBeChecked();
		fireEvent.click(defaultBeta);
		expect(defaultBeta).toBeChecked();
		expect(defaultAlpha).not.toBeChecked();
		cleanup();
		const radioHorizontal = scenario("radio", "radio-horizontal");
		expect(radioHorizontal.code).not.toContain("…");
		expect(radioHorizontal.code).toContain("<Label");
		expect(radioHorizontal.code).toContain('className="flex gap-4"');
		expect(radioHorizontal.code).toContain("Alpha");
		expect(radioHorizontal.code).toContain("Beta");
		render(createElement(radioHorizontal.render));
		const horizontalAlpha = screen.getByRole("radio", { name: "Alpha" });
		const horizontalBeta = screen.getByRole("radio", { name: "Beta" });
		expect(horizontalAlpha).toBeChecked();
		expect(horizontalBeta).not.toBeChecked();
		fireEvent.click(horizontalBeta);
		expect(horizontalBeta).toBeChecked();
		expect(horizontalAlpha).not.toBeChecked();
		cleanup();
		const radioDisabled = scenario("radio", "radio-disabled");
		expect(radioDisabled.code).toContain("RadioGroup");
		expect(radioDisabled.code).toContain("aria-label=");
		expect(radioDisabled.code).toContain('className="flex gap-4"');
		expect(radioDisabled.code).toContain('aria-label="Disabled A"');
		expect(radioDisabled.code).toContain('aria-label="Disabled B"');
		render(createElement(radioDisabled.render));
		const disabledA = screen.getByRole("radio", { name: "Disabled A" });
		const disabledB = screen.getByRole("radio", { name: "Disabled B" });
		expect(disabledA).toBeDisabled();
		expect(disabledB).toBeDisabled();
		expect(disabledA).toBeChecked();
		expect(disabledB).not.toBeChecked();
		fireEvent.click(disabledB);
		expect(disabledA).toBeChecked();
		expect(disabledB).not.toBeChecked();
		cleanup();
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
		expectUsageImportsCover(CATALOG_DOCS.radio?.usage ?? "", ["Radio"]);
		expect(hasAccessibleName(CATALOG_DOCS.radio?.usage ?? "")).toBe(true);
		expectUsageImportsCover(CATALOG_DOCS["input-group"]?.usage ?? "", ["InputGroup"]);
		expect(CATALOG_DOCS["input-group"]?.usage).toContain("InputGroup.Input");
		expect(CATALOG_DOCS["input-group"]?.usage).toContain("InputGroup.Suffix");
		expect(hasAccessibleName(CATALOG_DOCS["input-group"]?.usage ?? "")).toBe(true);
	});
});
