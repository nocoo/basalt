import { describe, expect, it } from "vitest";
import forms from "./catalog-content/families/forms";
import { CHECKBOX_EXAMPLES } from "./examples/checkbox";
import { FIELD_EXAMPLES } from "./examples/field";
import { INPUT_EXAMPLES } from "./examples/input";
import { INPUT_AREA_EXAMPLES } from "./examples/input-area";
import { INPUT_GROUP_EXAMPLES } from "./examples/input-group";
import { RADIO_EXAMPLES } from "./examples/radio";
import { SELECT_EXAMPLES } from "./examples/select";
import { SENSITIVE_INPUT_EXAMPLES } from "./examples/sensitive-input";
import { SWITCH_EXAMPLES } from "./examples/switch";
import { API as checkboxApi } from "./generated/catalog-api/checkbox";
import { API as fieldApi } from "./generated/catalog-api/field";
import { API as inputApi } from "./generated/catalog-api/input";
import { API as inputAreaApi } from "./generated/catalog-api/input-area";
import { API as inputGroupApi } from "./generated/catalog-api/input-group";
import { API as radioApi } from "./generated/catalog-api/radio";
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
} as const;

describe("forms catalog content family", () => {
	it("owns exactly fifteen migrated slugs and twenty-six generated owners", () => {
		expect(Object.keys(forms)).toEqual([...FORMS_SLUGS]);
		expect(Object.keys(forms)).toHaveLength(15);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "forms")
				.map(([slug]) => slug)
				.sort(),
		).toEqual([...FORMS_SLUGS].sort());
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY).filter(([, family]) => family === "foundation"),
		).toHaveLength(11);
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(26);
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
		expect(forms.field?.docs.api).toBe(fieldApi);
		expect(forms.input?.docs.api).toBe(inputApi);
		expect(forms["input-area"]?.docs.api).toBe(inputAreaApi);
		expect(forms["input-group"]?.docs.api).toBe(inputGroupApi);
		expect(forms["sensitive-input"]?.docs.api).toBe(sensitiveInputApi);
		expect(forms.checkbox?.docs.api).toBe(checkboxApi);
		expect(forms.radio?.docs.api).toBe(radioApi);
		expect(forms.switch?.docs.api).toBe(switchApi);
		expect(forms.select?.docs.api).toBe(selectApi);
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
		expect(forms.field?.docs.description).toBe("A labeled control with optional hint and error.");
		expect(forms.field?.docs.usage).toContain(
			'import { Field } from "@nocoo/basalt/components/field";',
		);
		expect(forms.field?.docs.variants).toEqual([]);
		expect(forms.field?.docs.provenance).toEqual({
			owner: "nocoo",
			repo: "signoff.now",
			ref: "92033c89d807",
			file: "apps/web/src/components/Field.tsx",
		});
		expect(forms.field?.docs.implementationSource).toEqual({
			owner: "nocoo",
			repo: "basalt",
			ref: "main",
			file: "packages/basalt/src/components/field.tsx",
		});
		expect(forms.combobox?.examples).toHaveLength(2);
		expect(forms.combobox?.examples.map((example) => example.id)).toEqual([
			"combobox-searchable-select-with-placeholder",
			"combobox-disabled",
		]);
		expect(forms.combobox?.examples.map((example) => example.title)).toEqual([
			"Searchable Select with Placeholder",
			"Disabled",
		]);
		expect(forms.combobox?.examples[0]?.code).toBe(
			'<Combobox items={["Apple", "Banana"]} placeholder="Select…" />',
		);
		expect(forms.autocomplete?.examples).toHaveLength(1);
		expect(forms.autocomplete?.examples[0]).toMatchObject({
			id: "autocomplete-default",
			title: "Default",
			code: '<Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />',
		});
		expect(forms["date-picker"]?.examples).toHaveLength(1);
		expect(forms["date-picker"]?.examples[0]).toMatchObject({
			id: "date-picker-single-date-selection",
			title: "Single Date Selection",
			code: '<DatePicker aria-label="Date" />',
		});
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
		expect(forms.combobox?.docs.description).toBe("Searchable select.");
		expect(forms["toggle-group"]?.docs.description).toBe(
			"Segmented tabs for switching a compact set of modes.",
		);
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
