import { describe, expect, it } from "vitest";
import forms from "./catalog-content/families/forms";
import { AUTOCOMPLETE_EXAMPLES } from "./examples/autocomplete";
import { CHECKBOX_EXAMPLES } from "./examples/checkbox";
import { COMBOBOX_EXAMPLES } from "./examples/combobox";
import { DATE_PICKER_EXAMPLES } from "./examples/date-picker";
import { FIELD_EXAMPLES } from "./examples/field";
import { INPUT_EXAMPLES } from "./examples/input";
import { INPUT_AREA_EXAMPLES } from "./examples/input-area";
import { INPUT_GROUP_EXAMPLES } from "./examples/input-group";
import { RADIO_EXAMPLES } from "./examples/radio";
import { SEGMENT_CONTROL_EXAMPLES } from "./examples/segment-control";
import { SELECT_EXAMPLES } from "./examples/select";
import { SENSITIVE_INPUT_EXAMPLES } from "./examples/sensitive-input";
import { SWITCH_EXAMPLES } from "./examples/switch";
import { API as autocompleteApi } from "./generated/catalog-api/autocomplete";
import { API as checkboxApi } from "./generated/catalog-api/checkbox";
import { API as comboboxApi } from "./generated/catalog-api/combobox";
import { API as datePickerApi } from "./generated/catalog-api/date-picker";
import { API as fieldApi } from "./generated/catalog-api/field";
import { API as inputApi } from "./generated/catalog-api/input";
import { API as inputAreaApi } from "./generated/catalog-api/input-area";
import { API as inputGroupApi } from "./generated/catalog-api/input-group";
import { API as radioApi } from "./generated/catalog-api/radio";
import { API as segmentControlApi } from "./generated/catalog-api/segment-control";
import { API as selectApi } from "./generated/catalog-api/select";
import { API as sensitiveInputApi } from "./generated/catalog-api/sensitive-input";
import { API as switchApi } from "./generated/catalog-api/switch";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const FORMS_SLUGS = [
	"field",
	"input",
	"input-area",
	"input-group",
	"sensitive-input",
	"checkbox",
	"radio",
	"switch",
	"select",
	"combobox",
	"autocomplete",
	"date-picker",
	"slider",
	"toggle",
	"toggle-group",
	"segment-control",
] as const;

const SOURCE_BACKED = {
	field: FIELD_EXAMPLES,
	input: INPUT_EXAMPLES,
	"input-area": INPUT_AREA_EXAMPLES,
	"input-group": INPUT_GROUP_EXAMPLES,
	"sensitive-input": SENSITIVE_INPUT_EXAMPLES,
	checkbox: CHECKBOX_EXAMPLES,
	radio: RADIO_EXAMPLES,
	switch: SWITCH_EXAMPLES,
	select: SELECT_EXAMPLES,
	combobox: COMBOBOX_EXAMPLES,
	autocomplete: AUTOCOMPLETE_EXAMPLES,
	"date-picker": DATE_PICKER_EXAMPLES,
} as const;

describe("forms catalog content family", () => {
	it("owns exactly sixteen slugs and eighty-six generated owners", () => {
		expect(Object.keys(forms)).toEqual([...FORMS_SLUGS]);
		expect(Object.keys(forms)).toHaveLength(16);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "forms")
				.map(([slug]) => slug)
				.sort(),
		).toEqual([...FORMS_SLUGS].sort());
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY).filter(([, family]) => family === "foundation"),
		).toHaveLength(12);
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(102);
	});

	it("keeps source-backed example owners and generated API shards by reference", () => {
		expect(forms.field?.examples).toBe(FIELD_EXAMPLES);
		expect(forms.input?.examples).toBe(INPUT_EXAMPLES);
		expect(forms["input-area"]?.examples).toBe(INPUT_AREA_EXAMPLES);
		expect(forms["input-group"]?.examples).toBe(INPUT_GROUP_EXAMPLES);
		expect(forms["sensitive-input"]?.examples).toBe(SENSITIVE_INPUT_EXAMPLES);
		expect(forms.checkbox?.examples).toBe(CHECKBOX_EXAMPLES);
		expect(forms.radio?.examples).toBe(RADIO_EXAMPLES);
		expect(forms.switch?.examples).toBe(SWITCH_EXAMPLES);
		expect(forms.select?.examples).toBe(SELECT_EXAMPLES);
		expect(forms.combobox?.examples).toBe(COMBOBOX_EXAMPLES);
		expect(forms.autocomplete?.examples).toBe(AUTOCOMPLETE_EXAMPLES);
		expect(forms["date-picker"]?.examples).toBe(DATE_PICKER_EXAMPLES);
		expect(forms.field?.docs.api).toBe(fieldApi);
		expect(forms.input?.docs.api).toBe(inputApi);
		expect(forms["input-area"]?.docs.api).toBe(inputAreaApi);
		expect(forms["input-group"]?.docs.api).toBe(inputGroupApi);
		expect(forms["sensitive-input"]?.docs.api).toBe(sensitiveInputApi);
		expect(forms.checkbox?.docs.api).toBe(checkboxApi);
		expect(forms.radio?.docs.api).toBe(radioApi);
		expect(forms.switch?.docs.api).toBe(switchApi);
		expect(forms.select?.docs.api).toBe(selectApi);
		expect(forms.combobox?.docs.api).toBe(comboboxApi);
		expect(forms.autocomplete?.docs.api).toBe(autocompleteApi);
		expect(forms["date-picker"]?.docs.api).toBe(datePickerApi);
		expect(forms["segment-control"]?.examples).toBe(SEGMENT_CONTROL_EXAMPLES);
		expect(forms["segment-control"]?.docs.api).toBe(segmentControlApi);
		for (const [slug, examples] of Object.entries(SOURCE_BACKED)) {
			expect(forms[slug]?.examples.map((example) => example.id)).toEqual(
				examples.map((example) => example.id),
			);
			expect(forms[slug]?.examples.map((example) => example.title)).toEqual(
				examples.map((example) => example.title),
			);
			expect(forms[slug]?.examples.map((example) => example.code)).toEqual(
				examples.map((example) => example.code),
			);
			expect(forms[slug]?.examples.map((example) => example.render)).toEqual(
				examples.map((example) => example.render),
			);
		}
	});

	it("preserves docs truth and extra scenario identity for every forms slug", () => {
		expect(forms.field?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "field-hint", title: "Hint" },
			{ id: "field-error", title: "Error" },
			{ id: "field-rich-label-and-optional", title: "Rich label and optional" },
			{ id: "field-structured-error", title: "Structured error" },
		]);
		expect(forms.field?.docs.description).toBe(
			"Accessible association and metadata for a labeled control.",
		);
		expect(forms.field?.docs.usage).toContain(
			'import { Field } from "@nocoo/basalt/components/field";',
		);
		expect(forms.field?.docs.usage).toContain('<Field label="Email"><Input /></Field>');
		expect(forms.field?.docs.usage).not.toContain("htmlFor");
		expect(forms.field?.docs.variants).toEqual([]);
		expect(forms.field?.docs.provenance).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/components/field/field.tsx",
		});
		expect(forms.field?.docs.implementationSource).toEqual({
			owner: "nocoo",
			repo: "basalt",
			ref: "main",
			file: "packages/basalt/src/components/field.tsx",
		});
		expect(forms.input?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "input-with-label-and-description", title: "With Label and Description" },
			{ id: "input-with-error-string", title: "With Error (String)" },
			{ id: "input-disabled", title: "Disabled" },
			{ id: "input-input-types", title: "Input Types" },
			{ id: "input-bare-input-no-label", title: "Bare Input (No Label)" },
			{ id: "input-sizes", title: "Sizes" },
			{ id: "input-controlled-and-reset", title: "Controlled and reset" },
		]);
		expect(forms.input?.docs.description).toBe(
			"A sized native single-line control on the L3 surface.",
		);
		expect(forms.input?.docs.variants).toEqual(["sm", "default", "lg"]);
		expect(forms.input?.docs.provenance).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/components/input/input.tsx",
		});
		expect(forms["input-area"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "input-area-with-label", title: "With Label" },
			{ id: "input-area-custom-row-count", title: "Custom Row Count" },
			{ id: "input-area-error-state-string", title: "Error State (String)" },
			{ id: "input-area-disabled", title: "Disabled" },
			{ id: "input-area-sizes", title: "Sizes" },
			{ id: "input-area-controlled-and-reset", title: "Controlled and reset" },
		]);
		expect(forms["input-area"]?.docs.description).toBe(
			"A sized native multi-line control on the L3 surface.",
		);
		expect(forms["input-area"]?.docs.variants).toEqual(["sm", "default", "lg"]);
		expect(forms["input-area"]?.docs.provenance).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/components/input-area/input-area.tsx",
		});
		expect(forms.checkbox?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "checkbox-default", title: "Default" },
			{ id: "checkbox-checked", title: "Checked" },
			{ id: "checkbox-indeterminate", title: "Indeterminate" },
			{ id: "checkbox-disabled", title: "Disabled" },
			{ id: "checkbox-error", title: "Error" },
			{ id: "checkbox-group-and-legend", title: "Group and legend" },
			{ id: "checkbox-controlled-and-error", title: "Controlled and error" },
		]);
		expect(forms.checkbox?.docs.description).toBe(
			"A check control with group, legend, size, and error.",
		);
		expect(forms.checkbox?.docs.variants).toEqual([
			"checked",
			"unchecked",
			"indeterminate",
			"sm",
			"default",
		]);
		expect(forms.checkbox?.docs.provenance).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/components/checkbox/checkbox.tsx",
		});
		expect(forms.radio?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "radio-default-vertical", title: "Default (Vertical)" },
			{ id: "radio-horizontal", title: "Horizontal" },
			{ id: "radio-disabled", title: "Disabled" },
			{ id: "radio-group-and-legend", title: "Group and legend" },
			{ id: "radio-controlled-and-error", title: "Controlled and error" },
		]);
		expect(forms.radio?.docs.description).toBe(
			"A radio control with group, legend, size, and error.",
		);
		expect(forms.radio?.docs.variants).toEqual(["sm", "default"]);
		expect(forms.radio?.docs.provenance).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/components/radio/radio.tsx",
		});
		expect(forms.switch?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "switch-off-state", title: "Off State" },
			{ id: "switch-on-state", title: "On State" },
			{ id: "switch-disabled", title: "Disabled" },
			{ id: "switch-sizes", title: "Sizes" },
			{ id: "switch-group-and-legend", title: "Group and legend" },
			{ id: "switch-controlled-and-error", title: "Controlled and error" },
		]);
		expect(forms.switch?.docs.description).toBe(
			"A binary toggle with group, legend, size, and error.",
		);
		expect(forms.switch?.docs.variants).toEqual(["checked", "unchecked", "sm", "default"]);
		expect(forms.switch?.docs.provenance).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/components/switch/switch.tsx",
		});
		expect(forms.combobox?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "combobox-default", title: "Default" },
			{ id: "combobox-disabled", title: "Disabled" },
			{ id: "combobox-sizes", title: "Sizes" },
			{ id: "combobox-controlled-and-error", title: "Controlled and error" },
		]);
		expect(forms.autocomplete?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "autocomplete-default", title: "Default" },
			{ id: "autocomplete-disabled", title: "Disabled" },
			{ id: "autocomplete-controlled-and-reset", title: "Controlled and reset" },
		]);
		expect(forms["date-picker"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "date-picker-single-date-selection", title: "Single Date Selection" },
			{ id: "date-picker-disabled-dates", title: "Disabled dates" },
			{ id: "date-picker-presets", title: "Presets" },
			{ id: "date-picker-range", title: "Range" },
		]);
		expect(forms.slider?.examples.map((example) => example.id)).toEqual([
			"slider-default",
			"slider-disabled",
		]);
		expect(forms.toggle?.examples.map((example) => example.id)).toEqual([
			"toggle-default",
			"toggle-sizes",
		]);
		expect(forms["toggle-group"]?.examples).toHaveLength(1);
		expect(forms["toggle-group"]?.examples[0]).toMatchObject({
			id: "toggle-group-default",
			title: "Default",
		});
		expect(forms["toggle-group"]?.examples[0]?.code).toContain(
			'import { ToggleGroup } from "@nocoo/basalt/components/toggle-group";',
		);
		expect(forms.combobox?.docs.description).toBe(
			"A searchable list that commits only listed values.",
		);
		expect(forms.autocomplete?.docs.description).toBe(
			"A typeahead field that also accepts freeform text.",
		);
		expect(forms["toggle-group"]?.docs.description).toBe(
			"Segmented tabs for switching a compact set of modes.",
		);
		expect(forms["segment-control"]?.docs).toMatchObject({
			description:
				"A controlled, labelled segmented filter with an optional All choice and horizontal overflow.",
			variants: ["all", "overflow", "disabled"],
			provenance: {
				owner: "nocoo",
				repo: "basalt",
				ref: "23046c3",
				file: "src/pages/ui/UiIndexPage.tsx",
			},
			implementationSource: {
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: "packages/basalt/src/components/segment-control.tsx",
			},
		});
		expect(forms["segment-control"]?.docs.usage).toContain(
			'import { SegmentControl } from "@nocoo/basalt/components/segment-control";',
		);
		expect(forms["segment-control"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "segment-control-controlled-status", title: "Controlled status filter" },
			{ id: "segment-control-overflow-disabled", title: "Overflow and disabled" },
		]);
		for (const example of forms["segment-control"]?.examples ?? []) {
			expect(example.code).toContain("@nocoo/basalt/components/segment-control");
			expect(example.render).toBeTypeOf("function");
		}
		for (const slug of FORMS_SLUGS) {
			const content = forms[slug];
			expect(content?.docs.description.length, slug).toBeGreaterThan(0);
			expect(content?.examples[0], slug).toBeDefined();
			expect(content?.docs.implementationSource.file, slug).toContain("packages/basalt/src");
			for (const example of content?.examples ?? []) {
				expect(example.id.startsWith(`${slug}-`), example.id).toBe(true);
			}
		}
	});
});
