import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { CATALOG } from "@/pages/ui/catalog";
import { catalogScenarioMatchesSlug } from "@/pages/ui/catalog-scenario";
import { CATALOG_API } from "@/pages/ui/generated/catalog-api";
import { CATALOG_SOURCE_FILES } from "@/pages/ui/generated/catalog-source-files";
import { KUMO_DOCS_SLUGS } from "@/pages/ui/kumo-list";
import { UiSourceViewerPage } from "@/pages/ui/UiSourceViewerPage";
import { CATALOG_DOCS, renderCatalog, UI_EXAMPLES } from "./ui-catalog-test-helpers";

describe("ui catalog part 2", () => {
	it("sources checkbox API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.checkbox?.api).toEqual(CATALOG_API.checkbox);
		expect(CATALOG_API.checkbox).toEqual([
			{
				name: "Checkbox",
				props: [
					{
						name: "checked",
						type: '"indeterminate" | boolean',
						required: false,
						description: "The controlled checked state of the checkbox.",
					},
					{
						name: "size",
						type: "CheckboxSize",
						required: false,
						default: '"md"',
						description: "The visual size of the checkbox.",
					},
				],
			},
			{
				name: "Checkbox.Group",
				props: [
					{
						name: "value",
						type: "string[]",
						required: false,
						description: "The controlled selected values.",
					},
					{
						name: "defaultValue",
						type: "string[]",
						required: false,
						description: "The initially selected values.",
					},
					{
						name: "onValueChange",
						type: "(value: string[]) => void",
						required: false,
						description: "Called when the selected values change.",
					},
					{
						name: "error",
						type: "React.ReactNode",
						required: false,
						description: "Marks the group invalid and shows alert copy.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable every item in the group.",
					},
				],
			},
			{
				name: "Checkbox.Legend",
				props: [],
			},
			{
				name: "Checkbox.Item",
				props: [
					{
						name: "size",
						type: '"md" | "sm"',
						required: false,
						default: '"md"',
						description: "The visual size of the checkbox.",
					},
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value stored in the group when this item is checked.",
					},
				],
			},
		]);
		renderCatalog("/ui/checkbox");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(document.getElementById("api-Checkbox")?.tagName).toBe("H3");
		expect(document.querySelector('[data-toc-id="api-Checkbox"]')).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Checkbox", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Checkbox props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(9);
		expect(api).toHaveTextContent("checked?");
		expect(api).toHaveTextContent('"indeterminate" | boolean');
		expect(api).toHaveTextContent("The controlled checked state of the checkbox.");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("Checkbox.Group");
		expect(api).toHaveTextContent("Checkbox.Item");
		expect(api).not.toHaveTextContent("defaultChecked");
		expect(api).not.toHaveTextContent("onCheckedChange");
		expect(api).not.toHaveTextContent("className");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Checked" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Indeterminate" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="checkbox-default"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="checkbox-error"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="checkbox-group-and-legend"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Checkbox");
		expect(markdown).toContain(
			'- checked ("indeterminate" | boolean, optional, default —): The controlled checked state of the checkbox.',
		);
		expect(markdown).not.toContain("- defaultChecked (");
		expect(markdown).not.toContain("- className (");
		expect(UI_EXAMPLES.checkbox).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten checkbox prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: checkboxApi");
		expect(family).not.toContain('name: "checked"');
		expect(family).not.toContain('boolean | "indeterminate"');
		expect(family).toContain('description: "A check control with group, legend, size, and error."');
		expect(family).toContain('<Checkbox aria-label="Subscribe" />');
		expect(family).toContain('variants: ["checked", "unchecked", "indeterminate", "sm", "md"]');
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain('sha: "1159868dfe32"');
		expect(family).toContain('file: "packages/kumo/src/components/checkbox/checkbox.tsx"');
	});

	it("sources radio API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.radio?.api).toEqual(CATALOG_API.radio);
		expect(CATALOG_API.radio).toEqual([
			{
				name: "Radio",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value associated with the radio item.",
					},
					{
						name: "size",
						type: "RadioSize",
						required: false,
						default: '"md"',
						description: "The visual size of the radio.",
					},
				],
			},
			{
				name: "Radio.Group",
				props: [
					{
						name: "value",
						type: "string",
						required: false,
						description: "The controlled selected value.",
					},
					{
						name: "defaultValue",
						type: "string",
						required: false,
						description: "The initially selected value.",
					},
					{
						name: "onValueChange",
						type: "(value: string) => void",
						required: false,
						description: "Called when the selected value changes.",
					},
					{
						name: "error",
						type: "React.ReactNode",
						required: false,
						description: "Marks the group invalid and shows alert copy.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable every item in the group.",
					},
				],
			},
			{
				name: "Radio.Legend",
				props: [],
			},
		]);
		renderCatalog("/ui/radio");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(document.getElementById("api-Radio")?.tagName).toBe("H3");
		expect(document.querySelector('[data-toc-id="api-Radio"]')).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Radio", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Radio props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(7);
		expect(api).toHaveTextContent("value");
		expect(api).toHaveTextContent("value?");
		expect(api).toHaveTextContent("defaultValue?");
		expect(api).toHaveTextContent("onValueChange?");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("The value associated with the radio item.");
		expect(api).toHaveTextContent("The controlled selected value.");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("Radio.Group");
		expect(api).not.toHaveTextContent("required?");
		expect(api).not.toHaveTextContent("asChild");
		expect(api).not.toHaveTextContent("className");
		expect(screen.getByRole("heading", { name: "Default (Vertical)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Horizontal" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="radio-default-vertical"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="radio-disabled"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="radio-group-and-legend"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Radio");
		expect(markdown).toContain(
			"- value (string, required, default —): The value associated with the radio item.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- form (");
		expect(UI_EXAMPLES.radio).toHaveLength(5);
		for (const scenario of UI_EXAMPLES.radio ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten radio prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		const start = family.indexOf("\tradio: {");
		const end = family.indexOf("\tswitch: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = family.slice(start, end);
		expect(block).toContain("api: radioApi");
		expect(block).not.toContain('name: "value"');
		expect(block).toContain(
			'description:\n\t\t\t\t"A radio control with group, legend, size, and error. RadioGroup is an alias of Radio.Group and shares the same component implementation and props interface."',
		);
		expect(block).toContain(
			`<Radio.Group defaultValue="a">
	<Radio value="a" aria-label="Alpha" />
	<Radio value="b" aria-label="Beta" />
</Radio.Group>`,
		);
		expect(block).toContain('variants: ["sm", "md"]');
		expect(block).toContain('repo: "kumo"');
		expect(block).toContain('sha: "1159868dfe32"');
		expect(block).toContain('file: "packages/kumo/src/components/radio/radio.tsx"');
	});

	it("sources switch API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.switch?.api).toEqual(CATALOG_API.switch);
		expect(CATALOG_API.switch?.map((surface) => surface.name)).toEqual([
			"Switch",
			"Switch.Group",
			"Switch.Legend",
			"Switch.Item",
		]);
		renderCatalog("/ui/switch");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(document.getElementById("api-Switch")?.tagName).toBe("H3");
		expect(document.querySelector('[data-toc-id="api-Switch"]')).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Switch", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Switch props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(9);
		expect(api).toHaveTextContent("checked?");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("boolean");
		expect(api).toHaveTextContent('"md" | "sm"');
		expect(api).toHaveTextContent("The controlled checked state of the switch.");
		expect(api).toHaveTextContent("The visual size of the switch.");
		expect(api).toHaveTextContent("Switch.Group");
		expect(api).not.toHaveTextContent("defaultChecked");
		expect(api).not.toHaveTextContent("onCheckedChange");
		expect(api).not.toHaveTextContent("className");
		expect(screen.getByRole("heading", { name: "Off State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "On State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="switch-off-state"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="switch-sizes"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="switch-group-and-legend"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Switch");
		expect(markdown).toContain(
			"- checked (boolean, optional, default —): The controlled checked state of the switch.",
		);
		expect(markdown).toContain(
			'- size ("md" | "sm", optional, default "md"): The visual size of the switch.',
		);
		expect(markdown).not.toContain("- defaultChecked (");
		expect(markdown).not.toContain("- className (");
		expect(UI_EXAMPLES.switch).toHaveLength(6);
		for (const scenario of UI_EXAMPLES.switch ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten switch prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: switchApi");
		expect(family).not.toContain('name: "checked"');
		expect(family).not.toContain('name: "size"');
		expect(family).toContain('description: "A binary toggle with group, legend, size, and error."');
		expect(family).toContain('<Switch aria-label="Notifications" />');
		expect(family).toContain('variants: ["checked", "unchecked", "sm", "md"]');
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain('sha: "1159868dfe32"');
		expect(family).toContain('file: "packages/kumo/src/components/switch/switch.tsx"');
	});

	it("sources select API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.select?.api).toEqual(CATALOG_API.select);
		expect(CATALOG_API.select).toEqual([
			{
				name: "Select",
				props: [
					{
						name: "value",
						type: "string",
						required: false,
						description: "The controlled value of the select.",
					},
					{
						name: "defaultValue",
						type: "string",
						required: false,
						description: "The uncontrolled initial value of the select.",
					},
					{
						name: "onValueChange",
						type: "(value: string) => void",
						required: false,
						description: "Called when the selected value changes.",
					},
				],
			},
			{
				name: "SelectTrigger",
				props: [
					{
						name: "size",
						type: "SelectSize",
						required: false,
						default: '"md"',
						description: "The visual size of the trigger.",
					},
					{
						name: "loading",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable the trigger and mark it busy.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable the trigger.",
					},
				],
			},
			{
				name: "SelectValue",
				props: [
					{
						name: "placeholder",
						type: "React.ReactNode",
						required: false,
						description: "Content shown when no value is selected.",
					},
				],
			},
			{
				name: "SelectContent",
				props: [
					{
						name: "position",
						type: '"item-aligned" | "popper"',
						required: false,
						default: "popper",
						description: "The positioning mode for the select content.",
					},
					{
						name: "sideOffset",
						type: "number",
						required: false,
						default: "4",
						description: "The distance between the trigger and the select content.",
					},
				],
			},
			{
				name: "SelectGroup",
				props: [
					{
						name: "asChild",
						type: "boolean",
						required: false,
						default: "false",
						description:
							"Change the default rendered div element to the child element, merging props and behavior.\nGroup forwards ref to HTMLDivElement and inherits native div attributes.",
					},
				],
			},
			{
				name: "SelectItem",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value associated with the select item.",
					},
				],
			},
			{
				name: "SelectLabel",
				props: [
					{
						name: "asChild",
						type: "boolean",
						required: false,
						default: "false",
						description:
							"Change the default rendered div element to the child element, merging props and behavior.\nLabel forwards ref to HTMLDivElement and inherits native div attributes.",
					},
				],
			},
		]);
		renderCatalog("/ui/select");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		const surfaceIds = [
			"api-Select",
			"api-SelectTrigger",
			"api-SelectValue",
			"api-SelectContent",
			"api-SelectGroup",
			"api-SelectItem",
			"api-SelectLabel",
		];
		for (const id of surfaceIds) {
			expect(document.getElementById(id)?.tagName).toBe("H3");
			expect(document.querySelectorAll(`[data-toc-id="${id}"]`)).toHaveLength(2);
		}
		expect(screen.getByRole("heading", { name: "Select", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectTrigger", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectValue", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectContent", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectGroup", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectItem", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectLabel", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Select props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectTrigger props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectValue props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectContent props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectGroup props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectItem props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectLabel props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(12);
		expect(
			screen.getByRole("table", { name: "Select props" }).querySelectorAll("tbody tr"),
		).toHaveLength(3);
		expect(
			screen.getByRole("table", { name: "SelectTrigger props" }).querySelectorAll("tbody tr"),
		).toHaveLength(3);
		expect(
			screen.getByRole("table", { name: "SelectValue props" }).querySelectorAll("tbody tr"),
		).toHaveLength(1);
		expect(
			screen.getByRole("table", { name: "SelectContent props" }).querySelectorAll("tbody tr"),
		).toHaveLength(2);
		expect(
			screen.getByRole("table", { name: "SelectGroup props" }).querySelectorAll("tbody tr"),
		).toHaveLength(1);
		expect(
			screen.getByRole("table", { name: "SelectItem props" }).querySelectorAll("tbody tr"),
		).toHaveLength(1);
		expect(
			screen.getByRole("table", { name: "SelectLabel props" }).querySelectorAll("tbody tr"),
		).toHaveLength(1);
		expect(api).toHaveTextContent("value?");
		expect(api).toHaveTextContent("defaultValue?");
		expect(api).toHaveTextContent("onValueChange?");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("loading?");
		expect(api).toHaveTextContent("disabled?");
		expect(api).toHaveTextContent("placeholder?");
		expect(api).toHaveTextContent("position?");
		expect(api).toHaveTextContent("sideOffset?");
		expect(api).toHaveTextContent("The controlled value of the select.");
		expect(api).toHaveTextContent("Content shown when no value is selected.");
		expect(api).toHaveTextContent("The positioning mode for the select content.");
		expect(api).toHaveTextContent("The distance between the trigger and the select content.");
		expect(api).toHaveTextContent("The value associated with the select item.");
		expect(api).toHaveTextContent('"item-aligned" | "popper"');
		expect(api).toHaveTextContent("React.ReactNode");
		expect(api).toHaveTextContent("popper");
		expect(api).toHaveTextContent("4");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("Select.Option");
		expect(api).not.toHaveTextContent("GroupLabel");
		expect(api).not.toHaveTextContent("textValue");
		expect(screen.getByRole("heading", { name: "Basic" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Placeholder" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled Options" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="select-basic"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="select-disabled-options"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Select");
		expect(markdown).toContain("### SelectTrigger");
		expect(markdown).toContain("### SelectValue");
		expect(markdown).toContain("### SelectContent");
		expect(markdown).toContain("### SelectGroup");
		expect(markdown).toContain("### SelectItem");
		expect(markdown).toContain("### SelectLabel");
		expect(markdown).toContain(
			"- value (string, optional, default —): The controlled value of the select.",
		);
		expect(markdown).toContain(
			"- defaultValue (string, optional, default —): The uncontrolled initial value of the select.",
		);
		expect(markdown).toContain(
			"- onValueChange ((value: string) => void, optional, default —): Called when the selected value changes.",
		);
		expect(markdown).toContain(
			"- asChild (boolean, optional, default false): Change the default rendered div element to the child element, merging props and behavior.",
		);
		expect(markdown).toContain(
			"- placeholder (React.ReactNode, optional, default —): Content shown when no value is selected.",
		);
		expect(markdown).toContain(
			'- position ("item-aligned" | "popper", optional, default popper): The positioning mode for the select content.',
		);
		expect(markdown).toContain(
			"- sideOffset (number, optional, default 4): The distance between the trigger and the select content.",
		);
		expect(markdown).toContain(
			"- value (string, required, default —): The value associated with the select item.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("Select.Option");
		expect(markdown).not.toContain("GroupLabel");
		expect(UI_EXAMPLES.select).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.select ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
	});

	it("shows usage as docs code without a preview surface", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const usage = CATALOG_DOCS.button?.usage;
		expect(usage).toBeDefined();
		renderCatalog("/ui/button");
		const section = document.getElementById("usage");
		expect(section).toBeTruthy();
		expect(section?.querySelector("[data-example-preview]")).toBeNull();
		expect(section?.querySelector("code")?.textContent).toBe(usage);
	});

	it("documents banner examples like kumo", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/banner");
		expect(screen.getByRole("heading", { level: 1, name: "Banner" })).toBeInTheDocument();
		expect(document.getElementById("api-Banner")?.tagName).toBe("H3");
		for (const title of [
			"Tones",
			"With icon",
			"With action",
			"With multiple actions",
			"Compact size",
			"Custom content",
		]) {
			expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
		}
		expect(screen.getAllByText("Update available").length).toBeGreaterThan(0);
		expect(screen.getAllByRole("button", { name: "Update" }).length).toBeGreaterThan(0);
	});

	it.each([
		[
			"badge",
			["Tone and variant matrix", "Dot badges", "In a sentence", "With an icon", "Linked badge"],
		],
		[
			"checkbox",
			[
				"Default",
				"Checked",
				"Indeterminate",
				"Disabled",
				"Error",
				"Group and legend",
				"Controlled and error",
			],
		],
		[
			"switch",
			["Off State", "On State", "Disabled", "Sizes", "Group and legend", "Controlled and error"],
		],
		["input", ["With Label and Description", "With Error (String)", "Disabled", "Input Types"]],
		["loader", ["Default Size", "Custom Size"]],
		["empty", ["Basic", "With icon"]],
		["meter", ["Basic Meter", "Custom Value Display", "Hidden Value"]],
		[
			"toast",
			[
				"Title Only",
				"Success tone",
				"Danger tone",
				"Loading",
				"Promise",
				"Close button",
				"Hidden close",
				"Custom icon",
				"Hidden icon",
			],
		],
		["clipboard-text", ["Short Text", "API Key", "Copy Alternate Text"]],
		["label", ["Default Label", "Optional Field", "With Tooltip"]],
		[
			"dialog",
			[
				"Basic Dialog",
				"Sizes",
				"Alert Dialog",
				"Confirmation Dialog",
				"With Actions",
				"Custom Max Width",
				"With Select",
				"With Autocomplete",
				"With Dropdown",
			],
		],
	] as const)("documents kumo examples for %s", (slug, titles) => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog(`/ui/${slug}`);
		for (const title of titles) {
			expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
		}
	});

	it("documents button examples like kumo", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/button");
		for (const title of [
			"Variants",
			"Sizes",
			"With Icon",
			"Icon Only",
			"Loading State",
			"Disabled State",
			"Title",
			"Link as Button",
			"Link with Tooltip",
			"Disabled Link",
		]) {
			expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
		}
	});

	it("keeps the disabled link example inert", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/button");
		const link = screen.getByRole("link", { name: "Disabled link" });
		expect(link).toHaveAttribute("aria-disabled", "true");
		expect(link).toHaveAttribute("tabindex", "-1");
		expect(link).not.toHaveAttribute("href");
		expect(link).toHaveClass("opacity-50");
		const disabled = UI_EXAMPLES.button?.find((item) => item.id === "button-disabled-link");
		expect(disabled?.code).toContain('className="opacity-50"');
		expect(disabled?.code).toContain('aria-disabled="true"');
		expect(disabled?.code).not.toContain("href=");
		fireEvent.click(link);
		expect(window.location.hash).not.toBe("#docs");
	});

	it("shows a barrel install for stable controls", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/badge");
		expect(screen.getByRole("heading", { name: "Barrel" })).toBeInTheDocument();
		expect(document.body.textContent).toContain('import { Badge } from "@nocoo/basalt"');
	});

	it("omits the barrel install for catalog-only controls", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/accordion");
		expect(screen.queryByRole("heading", { name: "Barrel" })).not.toBeInTheDocument();
	});

	it("covers every Kumo docs component slug", () => {
		const slugs = new Set(CATALOG.map((entry) => entry.slug));
		expect(KUMO_DOCS_SLUGS).toHaveLength(37);
		for (const slug of KUMO_DOCS_SLUGS) {
			expect(slugs.has(slug), slug).toBe(true);
		}
	});

	it("gives every catalog example a unique slug-prefixed scenario id", () => {
		const seen = new Set<string>();
		expect(Object.keys(UI_EXAMPLES).length).toBeGreaterThan(40);
		for (const [slug, examples] of Object.entries(UI_EXAMPLES)) {
			expect(examples.length, slug).toBeGreaterThan(0);
			for (const example of examples) {
				expect(catalogScenarioMatchesSlug(example.id, slug), example.id).toBe(true);
				expect(example.id, example.id).toMatch(new RegExp(`^${slug}-[a-z0-9]+(?:-[a-z0-9]+)*$`));
				expect(example.id, example.id).not.toMatch(/-\d+$/);
				expect(seen.has(example.id), example.id).toBe(false);
				seen.add(example.id);
			}
		}
	});

	it.each([...KUMO_DOCS_SLUGS])("exposes kumo scenario ids on %s", (slug) => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const examples = UI_EXAMPLES[slug];
		expect(examples, slug).toBeDefined();
		expect(examples?.length, slug).toBeGreaterThan(0);
		cleanup();
		renderCatalog(`/ui/${slug}`);
		for (const example of examples ?? []) {
			const node = document.querySelector(`[data-scenario="${example.id}"]`);
			expect(node, example.id).toBeTruthy();
			expect(node).toHaveAttribute("id", example.id);
		}
	});

	it("does not use example index anchors", () => {
		const page = readFileSync(
			path.join(process.cwd(), "src/pages/ui/ComponentDocPage.tsx"),
			"utf8",
		);
		expect(page).not.toMatch(/example-\$\{index\}/);
		expect(page).toContain("data-scenario");
	});

	it("removes the legacy home inventory and duplicate input branch", () => {
		const source = readFileSync(path.join(process.cwd(), "src/pages/ui/HomeGrid.tsx"), "utf8");
		expect(source).not.toMatch(/\bSHOWCASE\b/);
		expect(source).not.toMatch(/\bextraTiles\b/);
		expect(source).not.toMatch(/\bTILES\b/);
		expect(source).not.toContain("Input (with validation)");
		expect(source).not.toMatch(/\bHomeInputValidation\b/);
		expect(source).not.toContain("aspect-square");
		expect(source).toContain("HOME_DEMOS[item.entry.slug] ?? item.hero.render");
		expect(source).toContain('data-gallery-preview=""');
		expect(source).toContain("overflow-x-auto p-basalt-space-lg");
		expect(source).toContain("sm:justify-center-safe");
		expect(source).toContain("<LayerCard.Header");
		expect(source).not.toContain("<SectionRule");
	});

	it("keeps link-button default hero and disabled link contracts", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/link-button");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled Link" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="link-button-default"]');
		expect(hero).toBeTruthy();
		const docs = screen.getAllByRole("link", { name: "Open docs" });
		expect(docs.length).toBeGreaterThan(0);
		for (const link of docs) {
			expect(link).toHaveAttribute("href", "#docs");
		}
		const disabled = screen.getByRole("link", { name: "Disabled link" });
		expect(disabled).toHaveAttribute("aria-disabled", "true");
		expect(disabled).toHaveAttribute("tabindex", "-1");
		expect(disabled).toHaveAttribute("role", "link");
		expect(disabled).not.toHaveAttribute("href");
		expect(disabled).toHaveClass("opacity-50");
		const disabledScenario = UI_EXAMPLES["link-button"]?.find(
			(item) => item.id === "link-button-disabled-link",
		);
		expect(disabledScenario?.code).toContain('aria-disabled="true"');
		expect(disabledScenario?.code).toContain("tabIndex={-1}");
		expect(disabledScenario?.code).toContain('role="link"');
		expect(disabledScenario?.code).toContain('className="opacity-50"');
		expect(disabledScenario?.code).not.toContain("href=");
		fireEvent.click(disabled);
		expect(window.location.hash).not.toBe("#docs");
	});

	it("keeps text sizes hero and muted tone contracts", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/text");
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Muted tone" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="text-sizes"]');
		expect(hero).toBeTruthy();
		const stack = hero?.querySelector(".flex.w-full.flex-col.gap-basalt-space-lg");
		expect(stack).toBeTruthy();
		expect(
			[...((stack?.querySelectorAll("p") ?? []) as NodeListOf<HTMLElement>)].map(
				(node) => node.textContent,
			),
		).toEqual(["Extra large", "Large", "Body copy", "Small", "Extra small"]);
		const mutedSection = document.querySelector('[data-scenario="text-muted-tone"]');
		expect(mutedSection).toHaveTextContent("Muted supporting copy.");
		const muted = mutedSection?.querySelector("p");
		expect(muted).toHaveClass("text-basalt-muted-foreground");
		expect(muted).toHaveTextContent("Muted supporting copy.");
		const semantic = document.querySelector('[data-scenario="text-semantic-variants"]');
		expect(semantic).toBeTruthy();
		expect(semantic?.querySelector("h2")).toHaveTextContent("Section title");
		expect(semantic?.querySelector("p")).toHaveTextContent("Body paragraph");
		expect(semantic?.querySelector("span")).toHaveTextContent("Inline body");
		expect(semantic?.querySelector("code")).toHaveTextContent("const ready = true");
		const truncated = document.querySelector('[data-scenario="text-bold-and-truncate"]');
		expect(truncated).toBeTruthy();
		expect(truncated).toHaveTextContent("Bold body copy");
		expect(truncated?.querySelector(".truncate")).toBeTruthy();
	});

	it("keeps label hero, optional marker, and tooltip contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/label");
		expect(screen.getByRole("heading", { name: "Default Label" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Optional Field" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "With Tooltip" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="label-default-label"]');
		expect(hero).toBeTruthy();
		expect(hero?.querySelector(".flex.w-full.flex-col.gap-basalt-space-lg")).toBeTruthy();
		expect(hero).toHaveTextContent("Default Label");
		expect(screen.getAllByText("(optional)").length).toBeGreaterThan(0);
		const triggers = screen.getAllByRole("button", { name: "More information" });
		expect(triggers.length).toBeGreaterThan(0);
		await act(async () => {
			fireEvent.focus(triggers[0] as HTMLElement);
			fireEvent.pointerEnter(triggers[0] as HTMLElement);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent(
			"More information about this field",
		);
		for (const scenario of UI_EXAMPLES.label ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/label");
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
	});

	it("keeps separator hero and composite preview contracts", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/separator");
		expect(screen.getByRole("heading", { name: "Horizontal" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="separator-horizontal"]');
		expect(hero).toBeTruthy();
		expect(hero?.querySelector(".w-full.max-w-sm.space-y-basalt-space-lg")).toBeTruthy();
		expect(hero).toHaveTextContent("Above");
		expect(hero).toHaveTextContent("Below");
		const heroRule = hero?.querySelector('[data-orientation="horizontal"]');
		expect(heroRule).toBeTruthy();
		expect(heroRule).toHaveClass("h-px", "w-full");
		const example = document.querySelector('[data-scenario="separator-horizontal"]');
		expect(example).toBeTruthy();
		expect(example?.querySelector(".w-full.max-w-sm.space-y-basalt-space-lg")).toBeTruthy();
		expect(example).toHaveTextContent("Above");
		expect(example).toHaveTextContent("Below");
		expect(example?.querySelector('[data-orientation="horizontal"]')).toBeTruthy();
		for (const scenario of UI_EXAMPLES.separator ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/separator");
			expect(scenario.code).toContain("w-full max-w-sm space-y-basalt-space-lg");
			expect(scenario.code).toContain("<Text>Above</Text>");
			expect(scenario.code).toContain("<Separator />");
			expect(scenario.code).toContain("<Text>Below</Text>");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
	});

	it("keeps link hero, paragraph, and external contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/link");
		expect(screen.getByRole("heading", { name: "Basic Link" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Inline in Paragraph" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "External Links" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="link-basic-link"]');
		expect(hero).toBeTruthy();
		const sectionLinks = screen.getAllByRole("link", { name: "Inline link" });
		expect(sectionLinks).toHaveLength(2);
		for (const link of sectionLinks) {
			expect(link).toHaveAttribute("href", "#section");
		}
		const docsLink = screen.getByRole("link", { name: "docs" });
		expect(docsLink).toHaveAttribute("href", "#docs");
		const external = screen.getByRole("link", { name: "Example" });
		expect(external).toHaveAttribute("href", "https://example.com");
		expect(external).not.toHaveAttribute("target");
		expect(external).not.toHaveAttribute("rel");
		for (const scenario of UI_EXAMPLES.link ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/link");
			expect(scenario.code).toContain("LinkProvider");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES.link ?? []) {
			expect(markdown).toContain(scenario.code);
		}
	});

	it("keeps tooltip hero, compound triggers, and popup contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/tooltip");
		expect(screen.getByRole("heading", { name: "Basic Tooltip" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Tooltips" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="tooltip-basic-tooltip"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing tooltip hero");
		}
		const hover = within(hero as HTMLElement).getByRole("button", { name: "Hover" });
		expect(hover.tagName).toBe("BUTTON");
		expect(hover).toHaveClass("border");
		await act(async () => {
			fireEvent.focus(hover);
			fireEvent.pointerMove(hover);
			fireEvent.pointerEnter(hover);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Hint");
		await act(async () => {
			fireEvent.pointerLeave(hover);
			fireEvent.blur(hover);
		});
		const multiple = document.querySelector('[data-scenario="tooltip-multiple-tooltips"]');
		expect(multiple).toBeTruthy();
		if (!multiple) {
			throw new Error("missing multiple tooltips scenario");
		}
		expect(multiple.querySelector(".flex.flex-wrap.items-center.gap-basalt-space-lg")).toBeTruthy();
		const one = within(multiple as HTMLElement).getByRole("button", { name: "One" });
		const two = within(multiple as HTMLElement).getByRole("button", { name: "Two" });
		expect(one.tagName).toBe("BUTTON");
		expect(two.tagName).toBe("BUTTON");
		await act(async () => {
			fireEvent.focus(one);
			fireEvent.pointerMove(one);
			fireEvent.pointerEnter(one);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent("First");
		await act(async () => {
			fireEvent.pointerLeave(one);
			fireEvent.blur(one);
		});
		await act(async () => {
			fireEvent.focus(two);
			fireEvent.pointerMove(two);
			fireEvent.pointerEnter(two);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Second");
		for (const scenario of UI_EXAMPLES.tooltip ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/tooltip");
			expect(scenario.code).toContain("TooltipProvider");
			expect(scenario.code).toContain("TooltipTrigger asChild");
			expect(scenario.code).toContain("TooltipContent");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES.tooltip ?? []) {
			expect(markdown).toContain(scenario.code);
		}
	});

	it("keeps theme-toggle hero, accessible name, and cycle contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		window.localStorage.removeItem("theme");
		document.documentElement.classList.remove("dark", "light");
		delete document.documentElement.dataset.mode;
		document.documentElement.className = "host-root-sentinel";
		document.documentElement.dataset.mode = "host-mode-sentinel";
		renderCatalog("/ui/theme-toggle");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="theme-toggle-default"]');
		const example = document.querySelector('[data-scenario="theme-toggle-default"]');
		expect(hero).toBeTruthy();
		expect(example).toBeTruthy();
		if (!hero || !example) {
			throw new Error("missing theme-toggle scenario surfaces");
		}
		const heroButton = within(hero as HTMLElement).getByRole("button", { name: "Toggle theme" });
		const exampleButton = within(example as HTMLElement).getByRole("button", {
			name: "Toggle theme",
		});
		expect(heroButton).toHaveClass("basalt-action", "basalt-action-icon", "hover:bg-basalt-hover");
		const iconClass = (button: HTMLElement) =>
			button.querySelector("svg")?.getAttribute("class") ?? "";
		expect(iconClass(heroButton)).toContain("lucide-monitor");
		expect(iconClass(exampleButton)).toContain("lucide-monitor");
		expect(window.localStorage.getItem("theme")).toBeNull();
		expect(document.documentElement).toHaveClass("host-root-sentinel");
		expect(document.documentElement.dataset.mode).toBe("host-mode-sentinel");

		// Click hero button: cycles monitor -> sun (in-memory only; host storage and root DOM untouched)
		fireEvent.click(heroButton);
		expect(iconClass(heroButton)).toContain("lucide-sun");
		expect(iconClass(exampleButton)).toContain("lucide-monitor");
		expect(window.localStorage.getItem("theme")).toBeNull();
		expect(document.documentElement).toHaveClass("host-root-sentinel");
		expect(document.documentElement.dataset.mode).toBe("host-mode-sentinel");

		// Click hero button: cycles sun -> moon (in-memory only; host storage and root DOM untouched)
		fireEvent.click(heroButton);
		expect(iconClass(heroButton)).toContain("lucide-moon");
		expect(iconClass(exampleButton)).toContain("lucide-monitor");
		expect(window.localStorage.getItem("theme")).toBeNull();
		expect(document.documentElement).toHaveClass("host-root-sentinel");
		expect(document.documentElement.dataset.mode).toBe("host-mode-sentinel");

		// Click hero button: cycles moon -> monitor (in-memory only; host storage and root DOM untouched)
		fireEvent.click(heroButton);
		expect(iconClass(heroButton)).toContain("lucide-monitor");
		expect(iconClass(exampleButton)).toContain("lucide-monitor");
		expect(window.localStorage.getItem("theme")).toBeNull();
		expect(document.documentElement).toHaveClass("host-root-sentinel");
		expect(document.documentElement.dataset.mode).toBe("host-mode-sentinel");

		expect(exampleButton).toHaveAccessibleName("Toggle theme");
		for (const scenario of UI_EXAMPLES["theme-toggle"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/theme-toggle");
			expect(scenario.code).toContain("@nocoo/basalt/providers/theme");
			expect(scenario.code).toContain("ThemeProvider");
			expect(scenario.code).toContain('aria-label="Toggle theme"');
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(UI_EXAMPLES["theme-toggle"]?.[0]?.code ?? "");
		expect(markdown).toContain("ThemeProvider");
		expect(markdown).toContain("@nocoo/basalt/providers/theme");
	});

	it("keeps layer-card hero, width, padding, and wrapper contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/layer-card");
		expect(screen.getByRole("heading", { name: "Basic Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Surface-style Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Cards" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Structured Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Loading and Empty" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="layer-card-basic-card"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing layer-card hero");
		}
		const heroCard = hero.querySelector("[data-basalt-surface]");
		expect(heroCard).toBeTruthy();
		expect(hero).toHaveTextContent("Next Steps");
		expect(hero).toHaveTextContent("Hello");
		const surface = document.querySelector('[data-scenario="layer-card-surface-style-card"]');
		expect(surface).toBeTruthy();
		expect(surface?.querySelector("[data-basalt-surface].p-basalt-card")).toBeTruthy();
		expect(surface).toHaveTextContent("Quick start guide");
		const multiple = document.querySelector('[data-scenario="layer-card-multiple-cards"]');
		expect(multiple).toBeTruthy();
		if (!multiple) {
			throw new Error("missing multiple cards scenario");
		}
		expect(multiple.querySelector(".flex.w-full.gap-basalt-space-lg")).toBeTruthy();
		expect(
			multiple.querySelectorAll("[data-example-preview] > div > [data-basalt-surface]"),
		).toHaveLength(2);
		expect(multiple).toHaveTextContent("Components");
		expect(multiple).toHaveTextContent("Browse all components");
		expect(multiple).toHaveTextContent("Examples");
		expect(multiple).toHaveTextContent("View code examples");
		const structured = document.querySelector('[data-scenario="layer-card-structured-card"]');
		expect(structured).toHaveTextContent("Care plan review");
		expect(structured).toHaveTextContent("All checks have passed.");
		expect(structured).toHaveTextContent("Review");
		expect(structured).toHaveTextContent("Review");
		const states = document.querySelector('[data-scenario="layer-card-loading-empty"]');
		expect(states).toHaveTextContent("No activity");
		expect(states).toHaveTextContent("New events will appear here.");
		const loading = states?.querySelector('[role="status"]');
		expect(loading).toHaveAttribute("aria-label", "Loading account activity");
		expect(loading?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
		for (const scenario of UI_EXAMPLES["layer-card"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/layer-card");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		expect(UI_EXAMPLES["layer-card"]?.[0]?.code).toContain('className="w-[15.625rem]"');
		expect(UI_EXAMPLES["layer-card"]?.[1]?.code).toContain('className="w-[15.625rem]"');
		expect(UI_EXAMPLES["layer-card"]?.[2]?.code).toContain(
			'className="flex w-full gap-basalt-space-lg"',
		);
		expect(UI_EXAMPLES["layer-card"]?.[3]?.code).toContain("<LayerCard.Header>");
		expect(UI_EXAMPLES["layer-card"]?.[4]?.code).toContain(
			'<LayerCard.Loading label="Loading account activity" />',
		);
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES["layer-card"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
	});

	it("keeps field hero, hint, error, and association contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/field");
		expect(screen.getByRole("heading", { name: "Hint" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Rich label and optional" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Structured error" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="field-hint"]');
		const hint = document.querySelector('[data-scenario="field-hint"]');
		const error = document.querySelector('[data-scenario="field-error"]');
		const rich = document.querySelector('[data-scenario="field-rich-label-and-optional"]');
		const structured = document.querySelector('[data-scenario="field-structured-error"]');
		expect(hero).toBeTruthy();
		expect(hint).toBeTruthy();
		expect(error).toBeTruthy();
		expect(rich).toBeTruthy();
		expect(structured).toBeTruthy();
		if (!hero || !hint || !error || !rich || !structured) {
			throw new Error("missing field scenario surfaces");
		}
		const heroLabel = hero.querySelector("label");
		const heroInput = hero.querySelector("input");
		expect(heroLabel).toHaveTextContent("Email");
		expect(heroInput).toHaveAttribute("aria-describedby", `${heroInput?.id}-hint`);
		expect(heroInput).not.toHaveAttribute("aria-invalid");
		expect(hero.querySelector("[id$='-hint']")).toHaveTextContent("Never shared");
		const hintLabel = hint.querySelector("label");
		const hintInput = hint.querySelector("input");
		expect(hintLabel).toHaveTextContent("Email");
		expect(hintInput).toHaveAttribute("id", hintLabel?.getAttribute("for"));
		expect(hintInput?.id).not.toBe(heroInput?.id);
		expect(hintInput).toHaveAttribute("aria-describedby", `${hintInput?.id}-hint`);
		expect(hint.querySelector("[id$='-hint']")).toHaveClass(
			"text-basalt-sm",
			"text-basalt-muted-foreground",
		);
		const errorLabel = error.querySelector("label");
		const errorInput = error.querySelector("input");
		expect(errorLabel).toHaveTextContent("Email");
		expect(errorInput).toHaveAttribute("aria-describedby", `${errorInput?.id}-error`);
		expect(errorInput).toHaveAttribute("aria-invalid", "true");
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveTextContent("Required");
		expect(alert).toHaveAttribute("id", `${errorInput?.id}-error`);
		expect(alert).toHaveClass("text-basalt-sm", "text-basalt-danger-solid");
		expect(rich).toHaveTextContent("Care team name");
		expect(rich).toHaveTextContent("(optional)");
		expect(rich).toHaveTextContent("Shown on care summaries");
		expect(rich.querySelector('button[aria-label="More information"]')).toBeTruthy();
		const richInput = rich.querySelector("input");
		expect(richInput).toHaveAttribute("id");
		expect(rich.querySelector(`label[for="${richInput?.getAttribute("id")}"]`)).toHaveTextContent(
			"Care team name",
		);
		expect(structured).toHaveTextContent("Enter a valid email");
		const structuredInput = structured.querySelector("input");
		expect(structuredInput).toBeTruthy();
		const structuredId = structuredInput?.getAttribute("id");
		expect(structuredInput).toHaveAttribute("aria-invalid", "true");
		expect(structuredInput).toHaveAttribute("aria-describedby", `${structuredId}-error`);
		expect(within(structured as HTMLElement).getByRole("alert")).toHaveTextContent(
			"Enter a valid email",
		);
		for (const scenario of UI_EXAMPLES.field ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/field");
			expect(scenario.code).toContain("@nocoo/basalt/components/input");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES.field ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("htmlFor={id}");
		expect(markdown).toContain("htmlFor={id}");
	});

	it("keeps input hero, field associations, types wrapper, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/input");
		expect(screen.getByRole("heading", { name: "With Label and Description" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "With Error (String)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Input Types" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Bare Input (No Label)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="input-with-label-and-description"]');
		const labeled = document.querySelector('[data-scenario="input-with-label-and-description"]');
		const error = document.querySelector('[data-scenario="input-with-error-string"]');
		const disabled = document.querySelector('[data-scenario="input-disabled"]');
		const types = document.querySelector('[data-scenario="input-input-types"]');
		const bare = document.querySelector('[data-scenario="input-bare-input-no-label"]');
		const sizes = document.querySelector('[data-scenario="input-sizes"]');
		const controlled = document.querySelector('[data-scenario="input-controlled-and-reset"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(error).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(types).toBeTruthy();
		expect(bare).toBeTruthy();
		expect(sizes).toBeTruthy();
		expect(controlled).toBeTruthy();
		if (!hero || !labeled || !error || !disabled || !types || !bare || !sizes || !controlled) {
			throw new Error("missing input scenario surfaces");
		}
		const heroLabel = hero.querySelector("label");
		const heroInput = hero.querySelector("input");
		expect(heroLabel).toHaveTextContent("Email");
		expect(heroInput).toHaveAttribute("aria-describedby", `${heroInput?.id}-hint`);
		expect(heroInput).not.toHaveAttribute("aria-invalid");
		expect(hero.querySelector("[id$='-hint']")).toHaveTextContent("Never shared");
		const labeledInput = labeled.querySelector("input");
		expect(labeled.querySelector("label")).toHaveTextContent("Email");
		expect(labeledInput).toHaveAttribute("placeholder", "you@example.com");
		expect(labeledInput).toHaveAttribute("id", labeled.querySelector("label")?.getAttribute("for"));
		expect(labeledInput?.id).not.toBe(heroInput?.id);
		expect(labeledInput).toHaveAttribute("aria-describedby", `${labeledInput?.id}-hint`);
		const errorInput = error.querySelector("input");
		expect(error.querySelector("label")).toHaveTextContent("Email");
		expect(errorInput).toHaveAttribute("aria-describedby", `${errorInput?.id}-error`);
		expect(errorInput).toHaveAttribute("aria-invalid", "true");
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveTextContent("Required");
		expect(alert).toHaveAttribute("id", `${errorInput?.id}-error`);
		const disabledInput = within(disabled as HTMLElement).getByRole("textbox", {
			name: "Disabled input",
		});
		expect(disabledInput).toBeDisabled();
		expect(disabledInput).toHaveValue("Read only");
		const typeRoot = types.querySelector("div.flex.w-full.flex-col.gap-basalt-space-lg");
		expect(typeRoot).toBeTruthy();
		const typeInputs = typeRoot?.querySelectorAll("input") ?? [];
		expect(typeInputs).toHaveLength(3);
		expect(typeInputs[0]).toHaveAttribute("type", "email");
		expect(typeInputs[0]).toHaveAttribute("placeholder", "Email");
		expect(typeInputs[0]).toHaveAccessibleName("Email type");
		expect(typeInputs[1]).toHaveAttribute("type", "password");
		expect(typeInputs[1]).toHaveAttribute("placeholder", "Password");
		expect(typeInputs[1]).toHaveAccessibleName("Password type");
		expect(typeInputs[2]).toHaveAttribute("type", "search");
		expect(typeInputs[2]).toHaveAttribute("placeholder", "Search");
		expect(typeInputs[2]).toHaveAccessibleName("Search type");
		expect(within(bare as HTMLElement).getByRole("textbox", { name: "Name" })).toHaveAttribute(
			"placeholder",
			"Jane Doe",
		);
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Small" }).className,
		).toContain("basalt-action-sm");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Default" }).className,
		).toContain("basalt-action");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Large" }).className,
		).toContain("basalt-action-lg");
		expect(within(controlled as HTMLElement).getByRole("textbox", { name: "Name" })).toHaveValue(
			"Ada",
		);
		expect(within(controlled as HTMLElement).getByRole("button", { name: "Reset" })).toBeEnabled();
		for (const scenario of UI_EXAMPLES.input ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.input).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.input ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('<div className="flex w-full flex-col gap-basalt-space-lg">');
		expect(markdown).toContain("htmlFor={id}");
		expect(markdown).toContain("htmlFor={id}");
	});

	it("keeps textarea hero, field associations, rows, autoResize, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/textarea");
		expect(screen.getByRole("heading", { name: "With Label" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Custom Row Count" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Auto Resize" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error State (String)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="textarea-with-label"]');
		const labeled = document.querySelector('[data-scenario="textarea-with-label"]');
		const rows = document.querySelector('[data-scenario="textarea-custom-row-count"]');
		const autoResize = document.querySelector('[data-scenario="textarea-auto-resize"]');
		const error = document.querySelector('[data-scenario="textarea-error-state-string"]');
		const disabled = document.querySelector('[data-scenario="textarea-disabled"]');
		const sizes = document.querySelector('[data-scenario="textarea-sizes"]');
		const controlled = document.querySelector('[data-scenario="textarea-controlled-and-reset"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(rows).toBeTruthy();
		expect(autoResize).toBeTruthy();
		expect(error).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(sizes).toBeTruthy();
		expect(controlled).toBeTruthy();
		if (!hero || !labeled || !rows || !autoResize || !error || !disabled || !sizes || !controlled) {
			throw new Error("missing textarea scenario surfaces");
		}
		const heroLabel = hero.querySelector("label");
		const heroArea = hero.querySelector("textarea");
		expect(heroLabel).toHaveTextContent("Notes");
		expect(heroArea).not.toHaveAttribute("aria-invalid");
		expect(labeled.querySelector("label")).toHaveTextContent("Notes");
		expect(labeled.querySelector("textarea")).toHaveAttribute(
			"id",
			labeled.querySelector("label")?.getAttribute("for"),
		);
		expect(labeled.querySelector("textarea")?.id).not.toBe(heroArea?.id);
		expect(
			within(rows as HTMLElement).getByRole("textbox", { name: "Tall notes" }),
		).toHaveAttribute("rows", "6");
		const errorArea = error.querySelector("textarea");
		expect(error.querySelector("label")).toHaveTextContent("Bio");
		expect(errorArea).toHaveAttribute("aria-describedby", `${errorArea?.id}-error`);
		expect(errorArea).toHaveAttribute("aria-invalid", "true");
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveTextContent("Too short");
		expect(alert).toHaveAttribute("id", `${errorArea?.id}-error`);
		const disabledArea = within(disabled as HTMLElement).getByRole("textbox", {
			name: "Disabled notes",
		});
		expect(disabledArea).toBeDisabled();
		expect(disabledArea).toHaveValue("Unavailable");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Small notes" }).className,
		).toContain("min-h-basalt-textarea-sm");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Medium notes" }).className,
		).toContain("min-h-basalt-textarea");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Large notes" }).className,
		).toContain("min-h-basalt-textarea-lg");
		expect(within(controlled as HTMLElement).getByRole("textbox", { name: "Notes" })).toHaveValue(
			"Ada",
		);
		expect(within(controlled as HTMLElement).getByRole("button", { name: "Reset" })).toBeEnabled();
		for (const scenario of UI_EXAMPLES.textarea ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/textarea");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.textarea).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.textarea ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("htmlFor={id}");
		expect(markdown).toContain("htmlFor={id}");
		expect(markdown).toContain("rows={6}");
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("keeps input-group hero, compound previews, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/input-group");
		expect(screen.getByRole("heading", { name: "Inline Suffix" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Icon" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Text" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Button" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Loading" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="input-group-inline-suffix"]');
		const suffix = document.querySelector('[data-scenario="input-group-inline-suffix"]');
		const icon = document.querySelector('[data-scenario="input-group-icon"]');
		const text = document.querySelector('[data-scenario="input-group-text"]');
		const button = document.querySelector('[data-scenario="input-group-button"]');
		const loading = document.querySelector('[data-scenario="input-group-loading"]');
		expect(hero).toBeTruthy();
		expect(suffix).toBeTruthy();
		expect(icon).toBeTruthy();
		expect(text).toBeTruthy();
		expect(button).toBeTruthy();
		expect(loading).toBeTruthy();
		if (!hero || !suffix || !icon || !text || !button || !loading) {
			throw new Error("missing input-group scenario surfaces");
		}
		for (const node of [hero, suffix, icon, text, button, loading]) {
			expect(node.querySelector('[data-slot="input-group"]')).toHaveClass("max-w-sm");
		}
		expect(within(hero as HTMLElement).getByRole("textbox", { name: "Subdomain" })).toHaveValue(
			"atlas",
		);
		expect(hero).toHaveTextContent(".example.com");
		expect(hero.querySelector(".text-basalt-success")).toBeTruthy();
		expect(within(suffix as HTMLElement).getByRole("textbox", { name: "Subdomain" })).toHaveValue(
			"atlas",
		);
		expect(suffix).toHaveTextContent(".example.com");
		expect(suffix.querySelector(".text-basalt-success")).toBeTruthy();
		expect(within(icon as HTMLElement).getByRole("textbox", { name: "Search" })).toHaveAttribute(
			"placeholder",
			"Search",
		);
		expect(within(text as HTMLElement).getByRole("textbox", { name: "Host" })).toHaveAttribute(
			"placeholder",
			"example.com",
		);
		expect(text).toHaveTextContent("https://");
		expect(within(button as HTMLElement).getByRole("textbox", { name: "Query" })).toHaveAttribute(
			"placeholder",
			"Search",
		);
		expect(
			within(button as HTMLElement).getByRole("button", { name: "Search" }),
		).toBeInTheDocument();
		expect(
			within(loading as HTMLElement).getByRole("textbox", { name: "Loading query" }),
		).toHaveValue("atlas");
		expect(loading?.querySelector("[data-basalt-loader]")).toHaveStyle({ width: "16px" });
		for (const scenario of UI_EXAMPLES["input-group"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input-group");
			expect(scenario.code).toContain('className="max-w-sm"');
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES["input-group"]).toHaveLength(5);
		for (const scenario of UI_EXAMPLES["input-group"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="text-basalt-success"');
		expect(markdown).toContain("<Loader size={16} showLabel={false} showElapsed={false} />");
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		expect(CATALOG_DOCS["input-group"]?.api).toEqual(CATALOG_API["input-group"]);
		expect(CATALOG_API["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
		const surfaceIds = [
			"api-InputGroup",
			"api-InputGroup.Input",
			"api-InputGroup.Addon",
			"api-InputGroup.Button",
			"api-InputGroup.Suffix",
		];
		for (const id of surfaceIds) {
			expect(document.getElementById(id)?.tagName).toBe("H3");
			expect(document.querySelector(`[data-toc-id="${id}"]`)).toBeTruthy();
		}
		expect(screen.getByRole("table", { name: "InputGroup props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "InputGroup.Input props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "InputGroup.Addon props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "InputGroup.Button props" })).toBeInTheDocument();
		expect(
			screen.queryByRole("table", { name: "InputGroup.Suffix props" }),
		).not.toBeInTheDocument();
		const suffixHeading = document.getElementById("api-InputGroup.Suffix");
		const strategy = suffixHeading?.parentElement?.querySelector("p");
		expect(strategy).toHaveTextContent(
			"Native element wrapper: inherits and forwards all standard HTMLDivElement attributes (including children); does not expose ref.",
		);
		expect(strategy?.parentElement).toHaveAttribute("data-basalt-surface");
		expect(strategy).toHaveClass("text-basalt-sm");
		expect(strategy).toHaveClass("text-basalt-muted-foreground");
		const empty = suffixHeading?.parentElement?.querySelectorAll("p")[1];
		expect(empty).toHaveTextContent("No component-specific props.");
		expect(empty).toHaveClass("text-basalt-base");
		expect(empty).toHaveClass("text-basalt-muted-foreground");
		expect(markdown).toContain("### InputGroup");
		expect(markdown).toContain("### InputGroup.Input");
		expect(markdown).toContain("### InputGroup.Addon");
		expect(markdown).toContain("### InputGroup.Button");
		expect(markdown).toContain("### InputGroup.Suffix");
		expect(markdown).toContain(
			"- disabled (boolean, optional, default false): Disable the input and nested actions.",
		);
		expect(markdown).toContain("- type (React.HTMLInputTypeAttribute, optional, default —):");
		expect(markdown).toContain("- align (");
		expect(markdown).toContain("default ghost");
		expect(markdown).toContain("default icon");
		expect(markdown).toContain("default false");
		expect(markdown).toContain("No component-specific props.");
	});

	it("does not special-case InputGroup or vendor names in the API page", () => {
		const generator = readFileSync(path.join(process.cwd(), "scripts/catalog-api.ts"), "utf8");
		const page = readFileSync(
			path.join(process.cwd(), "src/pages/ui/ComponentDocPage.tsx"),
			"utf8",
		);
		expect(generator).not.toMatch(/Cloudflare|Kumo|Workers?\b/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*InputGroup|\bswitch\s*\([^)]*input-group/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*SensitiveInput|\bswitch\s*\([^)]*sensitive-input/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Checkbox|\bswitch\s*\([^)]*checkbox/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Radio|\bswitch\s*\([^)]*radio/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Switch|\bswitch\s*\([^)]*switch/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Select|\bswitch\s*\([^)]*select/);
		expect(page).not.toMatch(/input-group|InputGroup/);
		expect(page).not.toMatch(/sensitive-input|SensitiveInput/);
		expect(page).not.toMatch(/\bcheckbox\b|Checkbox/);
		expect(page).not.toMatch(/\bradio\b|Radio/);
		expect(page).not.toMatch(/\bswitch\b|Switch/);
		expect(page).not.toMatch(
			/\bSelectTrigger\b|\bSelectValue\b|\bSelectContent\b|\bSelectGroup\b|\bSelectItem\b|\bSelectLabel\b/,
		);
		expect(page).not.toMatch(/Cloudflare|Kumo|Workers?\b/);
	});

	it("keeps sensitive-input hero, reveal toggle, disabled controls, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/sensitive-input");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="sensitive-input-default"]');
		const labeled = document.querySelector('[data-scenario="sensitive-input-default"]');
		const disabled = document.querySelector('[data-scenario="sensitive-input-disabled"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(disabled).toBeTruthy();
		if (!hero || !labeled || !disabled) {
			throw new Error("missing sensitive-input scenario surfaces");
		}
		const heroInput = within(hero as HTMLElement).getByLabelText("Password");
		expect(heroInput).toHaveAttribute("type", "password");
		expect(heroInput).toBeEnabled();
		fireEvent.click(within(hero as HTMLElement).getByRole("button", { name: "Show" }));
		expect(heroInput).toHaveAttribute("type", "text");
		fireEvent.click(within(hero as HTMLElement).getByRole("button", { name: "Hide" }));
		expect(heroInput).toHaveAttribute("type", "password");
		expect(within(hero as HTMLElement).getByRole("button", { name: "Show" })).toBeEnabled();
		expect(within(labeled as HTMLElement).getByLabelText("Password")).toHaveAttribute(
			"type",
			"password",
		);
		const disabledInput = within(disabled as HTMLElement).getByLabelText("Disabled password");
		const disabledToggle = within(disabled as HTMLElement).getByRole("button", { name: "Show" });
		expect(disabledInput).toHaveAttribute("type", "password");
		expect(disabledInput).toBeDisabled();
		expect(disabledToggle).toBeDisabled();
		fireEvent.click(disabledToggle);
		expect(disabledInput).toHaveAttribute("type", "password");
		for (const scenario of UI_EXAMPLES["sensitive-input"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/sensitive-input");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(4);
		for (const scenario of UI_EXAMPLES["sensitive-input"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
	});

	it("keeps checkbox hero, five states, error ARIA, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/checkbox");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Checked" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Indeterminate" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="checkbox-default"]');
		const labeled = document.querySelector('[data-scenario="checkbox-default"]');
		const checked = document.querySelector('[data-scenario="checkbox-checked"]');
		const indeterminate = document.querySelector('[data-scenario="checkbox-indeterminate"]');
		const disabled = document.querySelector('[data-scenario="checkbox-disabled"]');
		const error = document.querySelector('[data-scenario="checkbox-error"]');
		const grouped = document.querySelector('[data-scenario="checkbox-group-and-legend"]');
		const controlled = document.querySelector('[data-scenario="checkbox-controlled-and-error"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(checked).toBeTruthy();
		expect(indeterminate).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(error).toBeTruthy();
		expect(grouped).toBeTruthy();
		expect(controlled).toBeTruthy();
		if (
			!hero ||
			!labeled ||
			!checked ||
			!indeterminate ||
			!disabled ||
			!error ||
			!grouped ||
			!controlled
		) {
			throw new Error("missing checkbox scenario surfaces");
		}
		const heroBox = within(hero as HTMLElement).getByRole("checkbox", { name: "Unchecked" });
		expect(heroBox).not.toBeChecked();
		expect(heroBox).toBeEnabled();
		fireEvent.click(heroBox);
		expect(heroBox).toBeChecked();
		fireEvent.click(heroBox);
		expect(heroBox).not.toBeChecked();
		expect(
			within(labeled as HTMLElement).getByRole("checkbox", { name: "Unchecked" }),
		).not.toBeChecked();
		expect(within(checked as HTMLElement).getByRole("checkbox", { name: "Checked" })).toBeChecked();
		const mixed = within(indeterminate as HTMLElement).getByRole("checkbox", { name: "Partial" });
		expect(mixed).toHaveAttribute("data-state", "indeterminate");
		expect(mixed).toHaveAttribute("aria-checked", "mixed");
		const disabledOff = within(disabled as HTMLElement).getByRole("checkbox", {
			name: "Disabled off",
		});
		const disabledOn = within(disabled as HTMLElement).getByRole("checkbox", {
			name: "Disabled on",
		});
		expect(disabled.querySelector(".flex.flex-wrap.items-center.gap-basalt-space-lg")).toBeTruthy();
		expect(disabledOff).toBeDisabled();
		expect(disabledOn).toBeDisabled();
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		fireEvent.click(disabledOff);
		fireEvent.click(disabledOn);
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		const terms = within(error as HTMLElement).getByRole("checkbox", { name: "Terms" });
		expect(terms).toHaveAttribute("id");
		expect(document.querySelector(`label[for="${terms.id}"]`)).toHaveTextContent("Terms");
		expect(terms).toHaveAttribute("aria-invalid", "true");
		expect(terms).toHaveAttribute("aria-describedby", `${terms?.id}-error`);
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveAttribute("id", `${terms?.id}-error`);
		expect(alert).toHaveTextContent("Required");
		expect(within(grouped as HTMLElement).getByRole("checkbox", { name: "Alpha" })).toBeChecked();
		expect(
			within(grouped as HTMLElement).getByRole("checkbox", { name: "Beta" }),
		).not.toBeChecked();
		expect(within(controlled as HTMLElement).getByRole("alert")).toHaveTextContent(
			"Pick at least two",
		);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/checkbox");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.checkbox).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="flex flex-wrap items-center gap-basalt-space-lg"');
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
		expect(CATALOG_DOCS["sensitive-input"]?.api).toEqual(CATALOG_API["sensitive-input"]);
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(4);
	});

	it("keeps radio hero, exclusive selection, disabled radios, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/radio");
		expect(screen.getByRole("heading", { name: "Default (Vertical)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Horizontal" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="radio-default-vertical"]');
		const labeled = document.querySelector('[data-scenario="radio-default-vertical"]');
		const horizontal = document.querySelector('[data-scenario="radio-horizontal"]');
		const disabled = document.querySelector('[data-scenario="radio-disabled"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(horizontal).toBeTruthy();
		expect(disabled).toBeTruthy();
		if (!hero || !labeled || !horizontal || !disabled) {
			throw new Error("missing radio scenario surfaces");
		}
		const heroAlpha = within(hero as HTMLElement).getByRole("radio", { name: "Alpha" });
		const heroBeta = within(hero as HTMLElement).getByRole("radio", { name: "Beta" });
		expect(heroAlpha).toBeChecked();
		expect(heroBeta).not.toBeChecked();
		fireEvent.click(heroBeta);
		expect(heroBeta).toBeChecked();
		expect(heroAlpha).not.toBeChecked();
		expect(within(labeled as HTMLElement).getByRole("radio", { name: "Alpha" })).toBeChecked();
		expect(within(labeled as HTMLElement).getByRole("radio", { name: "Beta" })).not.toBeChecked();
		const horizontalAlpha = within(horizontal as HTMLElement).getByRole("radio", { name: "Alpha" });
		const horizontalBeta = within(horizontal as HTMLElement).getByRole("radio", { name: "Beta" });
		expect(horizontalAlpha).toBeChecked();
		expect(horizontalBeta).not.toBeChecked();
		fireEvent.click(horizontalBeta);
		expect(horizontalBeta).toBeChecked();
		expect(horizontalAlpha).not.toBeChecked();
		expect(horizontal.querySelector(".flex.gap-basalt-space-lg")).toBeTruthy();
		const disabledA = within(disabled as HTMLElement).getByRole("radio", { name: "Disabled A" });
		const disabledB = within(disabled as HTMLElement).getByRole("radio", { name: "Disabled B" });
		expect(disabled.querySelector(".flex.gap-basalt-space-lg")).toBeTruthy();
		expect(disabledA).toBeDisabled();
		expect(disabledB).toBeDisabled();
		expect(disabledA).toBeChecked();
		expect(disabledB).not.toBeChecked();
		fireEvent.click(disabledB);
		expect(disabledA).toBeChecked();
		expect(disabledB).not.toBeChecked();
		for (const scenario of UI_EXAMPLES.radio ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/radio");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.radio).toHaveLength(5);
		for (const scenario of UI_EXAMPLES.radio ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="flex flex-col gap-basalt-space-lg"');
		expect(markdown).toContain('className="flex gap-basalt-space-lg"');
		expect(markdown).toContain(
			"- value (string, required, default —): The value associated with the radio item.",
		);
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
		expect(CATALOG_DOCS.checkbox?.api).toEqual(CATALOG_API.checkbox);
		expect(CATALOG_DOCS.radio?.api).toEqual(CATALOG_API.radio);
		expect(UI_EXAMPLES.checkbox).toHaveLength(7);
	});

	it("keeps switch hero, four states, sizes, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/switch");
		expect(screen.getByRole("heading", { name: "Off State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "On State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="switch-off-state"]');
		const off = document.querySelector('[data-scenario="switch-off-state"]');
		const on = document.querySelector('[data-scenario="switch-on-state"]');
		const disabled = document.querySelector('[data-scenario="switch-disabled"]');
		const sizes = document.querySelector('[data-scenario="switch-sizes"]');
		expect(hero).toBeTruthy();
		expect(off).toBeTruthy();
		expect(on).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(sizes).toBeTruthy();
		if (!hero || !off || !on || !disabled || !sizes) {
			throw new Error("missing switch scenario surfaces");
		}
		const heroSwitch = within(hero as HTMLElement).getByRole("switch", { name: "Off" });
		expect(heroSwitch).not.toBeChecked();
		expect(heroSwitch).toBeEnabled();
		fireEvent.click(heroSwitch);
		expect(heroSwitch).toBeChecked();
		expect(within(off as HTMLElement).getByRole("switch", { name: "Off" })).not.toBeChecked();
		const onSwitch = within(on as HTMLElement).getByRole("switch", { name: "On" });
		expect(onSwitch).toBeChecked();
		fireEvent.click(onSwitch);
		expect(onSwitch).not.toBeChecked();
		expect(within(hero as HTMLElement).getByRole("switch", { name: "Off" })).toBeChecked();
		expect(disabled.querySelector(".flex.flex-wrap.items-center.gap-basalt-space-lg")).toBeTruthy();
		const disabledOff = within(disabled as HTMLElement).getByRole("switch", {
			name: "Disabled off",
		});
		const disabledOn = within(disabled as HTMLElement).getByRole("switch", {
			name: "Disabled on",
		});
		expect(disabledOff).toBeDisabled();
		expect(disabledOn).toBeDisabled();
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		fireEvent.click(disabledOff);
		fireEvent.click(disabledOn);
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		expect(sizes.querySelector(".flex.flex-wrap.items-center.gap-basalt-space-lg")).toBeTruthy();
		const small = within(sizes as HTMLElement).getByRole("switch", { name: "Small" });
		const defaultSize = within(sizes as HTMLElement).getByRole("switch", { name: "Default size" });
		expect(small).toBeChecked();
		expect(defaultSize).toBeChecked();
		expect(small).toBeEnabled();
		expect(defaultSize).toBeEnabled();
		expect(small.className).toContain("h-basalt-4");
		expect(small.className).toContain("w-basalt-7");
		expect(defaultSize.className).toContain("h-basalt-4_5");
		expect(defaultSize.className).toContain("w-basalt-8");
		for (const scenario of UI_EXAMPLES.switch ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/switch");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.switch).toHaveLength(6);
		for (const scenario of UI_EXAMPLES.switch ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="flex flex-wrap items-center gap-basalt-space-lg"');
		expect(markdown).toContain(
			"- checked (boolean, optional, default —): The controlled checked state of the switch.",
		);
		expect(markdown).toContain(
			'- size ("md" | "sm", optional, default "md"): The visual size of the switch.',
		);
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
		expect(CATALOG_DOCS.radio?.api).toEqual(CATALOG_API.radio);
		expect(CATALOG_DOCS.switch?.api).toEqual(CATALOG_API.switch);
		expect(UI_EXAMPLES.radio).toHaveLength(5);
	});

	it("keeps select hero, seven states, disabled option, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/select");
		expect(screen.getByRole("heading", { name: "Basic" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Placeholder" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled Options" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Loading" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Groups" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="select-basic"]');
		const basic = document.querySelector('[data-scenario="select-basic"]');
		const placeholder = document.querySelector('[data-scenario="select-placeholder"]');
		const disabled = document.querySelector('[data-scenario="select-disabled-options"]');
		expect(hero).toBeTruthy();
		expect(basic).toBeTruthy();
		expect(placeholder).toBeTruthy();
		expect(disabled).toBeTruthy();
		if (!hero || !basic || !placeholder || !disabled) {
			throw new Error("missing select scenario surfaces");
		}
		const heroTrigger = within(hero as HTMLElement).getByRole("combobox", { name: "Version" });
		const labeledTrigger = within(basic as HTMLElement).getByRole("combobox", { name: "Version" });
		const emptyTrigger = within(placeholder as HTMLElement).getByRole("combobox", {
			name: "Empty select",
		});
		const disabledTrigger = within(disabled as HTMLElement).getByRole("combobox", {
			name: "Disabled option",
		});
		expect(heroTrigger.className).toContain("w-48");
		expect(labeledTrigger.className).toContain("w-48");
		expect(emptyTrigger.className).toContain("w-48");
		expect(disabledTrigger.className).toContain("w-48");
		expect(heroTrigger).toHaveTextContent("Select version");
		expect(labeledTrigger).toHaveTextContent("Select version");
		expect(emptyTrigger).toHaveTextContent("Choose…");
		expect(disabledTrigger).toHaveTextContent("Choose…");
		const api = document.getElementById("api-reference");
		expect(document.getElementById("api-Select")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectTrigger")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectValue")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectContent")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectGroup")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectItem")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectLabel")?.tagName).toBe("H3");
		expect(screen.getByRole("table", { name: "Select props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectTrigger props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectValue props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectContent props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectItem props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectGroup props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectLabel props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(12);
		expect(api).toHaveTextContent("value?");
		expect(api).toHaveTextContent("placeholder?");
		expect(api).toHaveTextContent("size?");
		expect(api).not.toHaveTextContent("className");
		expect(CATALOG_DOCS.select?.api).toEqual(CATALOG_API.select);
		fireEvent.click(heroTrigger);
		fireEvent.click(screen.getByRole("option", { name: "v2" }));
		expect(heroTrigger).toHaveTextContent("v2");
		expect(labeledTrigger).toHaveTextContent("Select version");
		fireEvent.click(emptyTrigger);
		fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
		expect(emptyTrigger).toHaveTextContent("Alpha");
		fireEvent.click(disabledTrigger);
		const beta = screen.getByRole("option", { name: "Beta" });
		expect(screen.getByRole("option", { name: "Alpha" })).not.toHaveAttribute(
			"aria-disabled",
			"true",
		);
		expect(beta).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(beta);
		expect(disabledTrigger).toHaveTextContent("Choose…");
		fireEvent.keyDown(disabledTrigger, { key: "Escape" });
		for (const scenario of UI_EXAMPLES.select ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/select");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.select).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.select ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="w-48"');
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		expect(CATALOG_DOCS.switch?.api).toEqual(CATALOG_API.switch);
		expect(UI_EXAMPLES.switch).toHaveLength(6);
	});

	it("renders extra home tiles from the first catalog scenario", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui");
		const accordionLink = screen.getByRole("link", { name: "Accordion" });
		const tile = accordionLink.closest("li");
		expect(tile).toBeTruthy();
		if (!tile) {
			return;
		}
		const preview = within(tile);
		expect(preview.getByRole("button", { name: "Item" })).toBeInTheDocument();
		fireEvent.click(preview.getByRole("button", { name: "Item" }));
		expect(preview.getByText("Body")).toBeInTheDocument();
	});

	describe("UiSourceViewerPage source viewer and race condition tests", () => {
		const buttonHash = CATALOG_SOURCE_FILES.button.hash;

		it("renders source content when hash matches component fingerprint", async () => {
			const view = renderCatalog(`/ui/button/source?hash=${buttonHash}`);
			const loading = screen.getByRole("status");
			expect(loading).toHaveTextContent("Loading source…");
			expect(loading).toHaveAttribute("data-basalt-surface");
			expect(loading).toHaveClass("p-basalt-card");
			await screen.findByText(/export const Button/);
			expect(view.container.querySelector("[data-showcase-page]")).not.toBeNull();
			expect(view.container.querySelector("main, .min-h-screen")).toBeNull();
			expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
			expect(screen.getByRole("button", { name: /copy code/i })).toBeInTheDocument();
			expect(screen.queryByText(/Source fingerprint mismatch/)).not.toBeInTheDocument();
			view.unmount();
		});

		it("immediately rejects wrong hash without loading source", async () => {
			const view = renderCatalog("/ui/button/source?hash=0000000000000000");
			expect(
				screen.getByText(/Source fingerprint mismatch: requested hash "0000000000000000"/),
			).toBeInTheDocument();
			expect(screen.queryByText(/export const Button/)).not.toBeInTheDocument();
			view.unmount();
		});

		it("cancels stale in-flight source verification when route changes to wrong hash", async () => {
			let capturedData: BufferSource | undefined;
			let finishSlowDigest: (val: ArrayBuffer) => void = () => {};
			const slowDigestPromise = new Promise<ArrayBuffer>((resolve) => {
				finishSlowDigest = resolve;
			});

			const originalDigest = crypto.subtle.digest.bind(crypto.subtle);
			const digestSpy = vi.spyOn(crypto.subtle, "digest").mockImplementation((_algorithm, data) => {
				capturedData = data;
				// Delay the digest for button source
				return slowDigestPromise;
			});

			function RouterWithNavigation() {
				const navigate = useNavigate();
				return (
					<>
						<button
							type="button"
							data-testid="nav-wrong-hash"
							onClick={() => navigate("/ui/button/source?hash=0000000000000000")}
						>
							Nav Wrong
						</button>
						<Routes>
							<Route path="/ui/:slug/source" element={<UiSourceViewerPage />} />
						</Routes>
					</>
				);
			}

			const view = render(
				<MemoryRouter initialEntries={[`/ui/button/source?hash=${buttonHash}`]}>
					<RouterWithNavigation />
				</MemoryRouter>,
			);

			try {
				// Initial state: loading with valid hash, waiting on slow crypto.subtle.digest
				expect(screen.getByText("Loading source…")).toBeInTheDocument();

				// Ensure raw import resolved and crypto.subtle.digest was actively invoked
				await waitFor(() => expect(digestSpy).toHaveBeenCalled());

				// Navigate to wrong hash route before slow crypto resolves
				fireEvent.click(screen.getByTestId("nav-wrong-hash"));

				// Now error must be immediately shown for the new route
				expect(
					screen.getByText(/Source fingerprint mismatch: requested hash "0000000000000000"/),
				).toBeInTheDocument();

				// Release the digest with real Button source bytes (not dummy data)
				expect(capturedData).toBeDefined();
				const realButtonBuf = await originalDigest(
					"SHA-256",
					capturedData ?? new TextEncoder().encode(""),
				);

				await act(async () => {
					finishSlowDigest(realButtonBuf);
					await slowDigestPromise;
				});

				// Stale response must NOT clear the error or display source
				expect(
					screen.getByText(/Source fingerprint mismatch: requested hash "0000000000000000"/),
				).toBeInTheDocument();
				expect(screen.queryByText(/export const Button/)).not.toBeInTheDocument();
			} finally {
				digestSpy.mockRestore();
				view.unmount();
			}
		});
	});
});
