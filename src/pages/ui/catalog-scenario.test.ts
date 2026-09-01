import { describe, expect, it } from "vitest";
import { loadCatalogContentRecord } from "./catalog-content-registry";
import {
	catalogScenarioId,
	catalogScenarioMatchesSlug,
	loadModuleScenarios,
	moduleFileKey,
	normalizeModulePath,
} from "./catalog-scenario";

const catalogContent = await loadCatalogContentRecord();
const UI_EXAMPLES = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.examples]),
);

import { BASALT_MARK_EXAMPLES } from "./examples/basalt-mark";
import { BUTTON_EXAMPLES } from "./examples/button";
import { CHECKBOX_EXAMPLES } from "./examples/checkbox";
import { FIELD_EXAMPLES } from "./examples/field";
import { INPUT_EXAMPLES } from "./examples/input";
import { INPUT_AREA_EXAMPLES } from "./examples/input-area";
import { INPUT_GROUP_EXAMPLES } from "./examples/input-group";
import { LABEL_EXAMPLES } from "./examples/label";
import { LAYER_CARD_EXAMPLES } from "./examples/layer-card";
import { LINK_EXAMPLES } from "./examples/link";
import { LINK_BUTTON_EXAMPLES } from "./examples/link-button";
import { RADIO_EXAMPLES } from "./examples/radio";
import { SELECT_EXAMPLES } from "./examples/select";
import { SENSITIVE_INPUT_EXAMPLES } from "./examples/sensitive-input";
import { SEPARATOR_EXAMPLES } from "./examples/separator";
import { SWITCH_EXAMPLES } from "./examples/switch";
import { TEXT_EXAMPLES } from "./examples/text";
import { THEME_TOGGLE_EXAMPLES } from "./examples/theme-toggle";
import { TOOLTIP_EXAMPLES } from "./examples/tooltip";

const BUTTON_IDS = [
	"button-variants",
	"button-sizes",
	"button-with-icon",
	"button-icon-only",
	"button-loading-state",
	"button-disabled-state",
	"button-title",
	"button-link-as-button",
	"button-link-with-tooltip",
	"button-disabled-link",
] as const;

const BUTTON_TITLES = [
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
] as const;

const buttonRenders = import.meta.glob("./examples/button/*.tsx", { eager: true });
const buttonSources = import.meta.glob("./examples/button/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const LINK_BUTTON_IDS = ["link-button-default", "link-button-disabled-link"] as const;
const LINK_BUTTON_TITLES = ["Default", "Disabled Link"] as const;

const linkButtonRenders = import.meta.glob("./examples/link-button/*.tsx", { eager: true });
const linkButtonSources = import.meta.glob("./examples/link-button/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const TEXT_IDS = [
	"text-sizes",
	"text-muted-tone",
	"text-semantic-variants",
	"text-bold-and-truncate",
] as const;
const TEXT_TITLES = ["Sizes", "Muted tone", "Semantic variants", "Bold and truncate"] as const;

const textRenders = import.meta.glob("./examples/text/*.tsx", { eager: true });
const textSources = import.meta.glob("./examples/text/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const LABEL_IDS = ["label-default-label", "label-optional-field", "label-with-tooltip"] as const;
const LABEL_TITLES = ["Default Label", "Optional Field", "With Tooltip"] as const;

const labelRenders = import.meta.glob("./examples/label/*.tsx", { eager: true });
const labelSources = import.meta.glob("./examples/label/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const SEPARATOR_IDS = ["separator-horizontal"] as const;
const SEPARATOR_TITLES = ["Horizontal"] as const;

const separatorRenders = import.meta.glob("./examples/separator/*.tsx", { eager: true });
const separatorSources = import.meta.glob("./examples/separator/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const LINK_IDS = ["link-basic-link", "link-inline-in-paragraph", "link-external-links"] as const;
const LINK_TITLES = ["Basic Link", "Inline in Paragraph", "External Links"] as const;

const linkRenders = import.meta.glob("./examples/link/*.tsx", { eager: true });
const linkSources = import.meta.glob("./examples/link/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const TOOLTIP_IDS = ["tooltip-basic-tooltip", "tooltip-multiple-tooltips"] as const;
const TOOLTIP_TITLES = ["Basic Tooltip", "Multiple Tooltips"] as const;

const tooltipRenders = import.meta.glob("./examples/tooltip/*.tsx", { eager: true });
const tooltipSources = import.meta.glob("./examples/tooltip/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const THEME_TOGGLE_IDS = ["theme-toggle-default"] as const;
const THEME_TOGGLE_TITLES = ["Default"] as const;

const themeToggleRenders = import.meta.glob("./examples/theme-toggle/*.tsx", { eager: true });
const themeToggleSources = import.meta.glob("./examples/theme-toggle/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const LAYER_CARD_IDS = [
	"layer-card-basic-card",
	"layer-card-surface-style-card",
	"layer-card-multiple-cards",
	"layer-card-structured-card",
	"layer-card-loading-empty",
] as const;
const LAYER_CARD_TITLES = [
	"Basic Card",
	"Surface-style Card",
	"Multiple Cards",
	"Structured Card",
	"Loading and Empty",
] as const;

const layerCardRenders = import.meta.glob("./examples/layer-card/*.tsx", { eager: true });
const layerCardSources = import.meta.glob("./examples/layer-card/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const BASALT_MARK_IDS = ["basalt-mark-default"] as const;
const BASALT_MARK_TITLES = ["Default"] as const;

const basaltMarkRenders = import.meta.glob("./examples/basalt-mark/*.tsx", { eager: true });
const basaltMarkSources = import.meta.glob("./examples/basalt-mark/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const FIELD_IDS = [
	"field-hint",
	"field-error",
	"field-rich-label-and-optional",
	"field-structured-error",
] as const;
const FIELD_TITLES = ["Hint", "Error", "Rich label and optional", "Structured error"] as const;

const fieldRenders = import.meta.glob("./examples/field/*.tsx", { eager: true });
const fieldSources = import.meta.glob("./examples/field/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const INPUT_IDS = [
	"input-with-label-and-description",
	"input-with-error-string",
	"input-disabled",
	"input-input-types",
	"input-bare-input-no-label",
	"input-sizes",
	"input-controlled-and-reset",
] as const;
const INPUT_TITLES = [
	"With Label and Description",
	"With Error (String)",
	"Disabled",
	"Input Types",
	"Bare Input (No Label)",
	"Sizes",
	"Controlled and reset",
] as const;

const inputRenders = import.meta.glob("./examples/input/*.tsx", { eager: true });
const inputSources = import.meta.glob("./examples/input/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const INPUT_AREA_IDS = [
	"input-area-with-label",
	"input-area-custom-row-count",
	"input-area-error-state-string",
	"input-area-disabled",
	"input-area-sizes",
	"input-area-controlled-and-reset",
] as const;
const INPUT_AREA_TITLES = [
	"With Label",
	"Custom Row Count",
	"Error State (String)",
	"Disabled",
	"Sizes",
	"Controlled and reset",
] as const;

const inputAreaRenders = import.meta.glob("./examples/input-area/*.tsx", { eager: true });
const inputAreaSources = import.meta.glob("./examples/input-area/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const INPUT_GROUP_IDS = [
	"input-group-inline-suffix",
	"input-group-icon",
	"input-group-text",
	"input-group-button",
	"input-group-loading",
] as const;
const INPUT_GROUP_TITLES = ["Inline Suffix", "Icon", "Text", "Button", "Loading"] as const;

const inputGroupRenders = import.meta.glob("./examples/input-group/*.tsx", { eager: true });
const inputGroupSources = import.meta.glob("./examples/input-group/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const SENSITIVE_INPUT_IDS = [
	"sensitive-input-default",
	"sensitive-input-disabled",
	"sensitive-input-sizes",
	"sensitive-input-controlled-and-reset",
] as const;
const SENSITIVE_INPUT_TITLES = ["Default", "Disabled", "Sizes", "Controlled and reset"] as const;

const sensitiveInputRenders = import.meta.glob("./examples/sensitive-input/*.tsx", { eager: true });
const sensitiveInputSources = import.meta.glob("./examples/sensitive-input/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const CHECKBOX_IDS = [
	"checkbox-default",
	"checkbox-checked",
	"checkbox-indeterminate",
	"checkbox-disabled",
	"checkbox-error",
	"checkbox-group-and-legend",
	"checkbox-controlled-and-error",
] as const;
const CHECKBOX_TITLES = [
	"Default",
	"Checked",
	"Indeterminate",
	"Disabled",
	"Error",
	"Group and legend",
	"Controlled and error",
] as const;

const checkboxRenders = import.meta.glob("./examples/checkbox/*.tsx", { eager: true });
const checkboxSources = import.meta.glob("./examples/checkbox/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const RADIO_IDS = [
	"radio-default-vertical",
	"radio-horizontal",
	"radio-disabled",
	"radio-group-and-legend",
	"radio-controlled-and-error",
] as const;
const RADIO_TITLES = [
	"Default (Vertical)",
	"Horizontal",
	"Disabled",
	"Group and legend",
	"Controlled and error",
] as const;

const radioRenders = import.meta.glob("./examples/radio/*.tsx", { eager: true });
const radioSources = import.meta.glob("./examples/radio/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const SWITCH_IDS = [
	"switch-off-state",
	"switch-on-state",
	"switch-disabled",
	"switch-sizes",
	"switch-group-and-legend",
	"switch-controlled-and-error",
] as const;
const SWITCH_TITLES = [
	"Off State",
	"On State",
	"Disabled",
	"Sizes",
	"Group and legend",
	"Controlled and error",
] as const;

const switchRenders = import.meta.glob("./examples/switch/*.tsx", { eager: true });
const switchSources = import.meta.glob("./examples/switch/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

const SELECT_IDS = ["select-basic", "select-placeholder", "select-disabled-options"] as const;
const SELECT_TITLES = ["Basic", "Placeholder", "Disabled Options"] as const;

const selectRenders = import.meta.glob("./examples/select/*.tsx", { eager: true });
const selectSources = import.meta.glob("./examples/select/*.tsx", {
	query: "?raw",
	import: "default",
	eager: true,
});

function Sample() {
	return null;
}

function validInput() {
	return {
		slug: "button",
		metas: [{ key: "variants", title: "Variants" }],
		renderModules: { "./variants.tsx": { default: Sample } },
		sourceModules: { "./variants.tsx": "export default function Sample() { return null }" },
	};
}

describe("catalog scenario ids", () => {
	it("joins an explicit slug and semantic key", () => {
		expect(catalogScenarioId("button", "variants")).toBe("button-variants");
		expect(catalogScenarioId("clipboard-text", "api-key")).toBe("clipboard-text-api-key");
	});

	it("does not encode array indexes", () => {
		expect(catalogScenarioId("text", "sizes")).not.toMatch(/-\d+$/);
	});

	it("matches ids to the owning slug prefix", () => {
		expect(catalogScenarioMatchesSlug("code-typescript", "code")).toBe(true);
		expect(catalogScenarioMatchesSlug("code-block-basic", "code-block")).toBe(true);
		expect(catalogScenarioMatchesSlug("code", "code")).toBe(false);
		expect(catalogScenarioMatchesSlug("button-variants", "badge")).toBe(false);
	});
});

describe("source-backed button scenarios", () => {
	it("loads ten button scenarios from the same glob modules", () => {
		const loaded = loadModuleScenarios({
			slug: "button",
			metas: BUTTON_TITLES.map((title, index) => ({
				key: BUTTON_IDS[index].slice("button-".length),
				title,
			})),
			renderModules: buttonRenders,
			sourceModules: buttonSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...BUTTON_TITLES]);
		expect(BUTTON_EXAMPLES.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(BUTTON_EXAMPLES.map((item) => item.title)).toEqual([...BUTTON_TITLES]);
		for (const scenario of loaded) {
			const key = scenario.id.slice("button-".length);
			const modulePath = Object.keys(buttonSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = buttonSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(BUTTON_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((buttonRenders[modulePath] as { default: unknown }).default);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		}
	});
});

describe("source-backed link-button scenarios", () => {
	it("loads two link-button scenarios from the same glob modules", () => {
		expect(Object.keys(linkButtonRenders)).toHaveLength(2);
		expect(Object.keys(linkButtonSources)).toHaveLength(2);
		const loaded = loadModuleScenarios({
			slug: "link-button",
			metas: LINK_BUTTON_TITLES.map((title, index) => ({
				key: LINK_BUTTON_IDS[index].slice("link-button-".length),
				title,
			})),
			renderModules: linkButtonRenders,
			sourceModules: linkButtonSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...LINK_BUTTON_TITLES]);
		expect(LINK_BUTTON_EXAMPLES.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(LINK_BUTTON_EXAMPLES.map((item) => item.title)).toEqual([...LINK_BUTTON_TITLES]);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		const fileKeys = new Set(
			Object.keys(linkButtonRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(LINK_BUTTON_IDS.map((id) => id.slice("link-button-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("link-button-".length);
			const modulePath = Object.keys(linkButtonSources).find((path) =>
				path.endsWith(`/${key}.tsx`),
			);
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = linkButtonSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(
				LINK_BUTTON_EXAMPLES.find((item) => item.id === scenario.id)?.code,
			);
			expect(scenario.render).toBe((linkButtonRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				LINK_BUTTON_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		}
	});
});

describe("source-backed text scenarios", () => {
	it("loads four text scenarios from the same glob modules", () => {
		expect(Object.keys(textRenders)).toHaveLength(4);
		expect(Object.keys(textSources)).toHaveLength(4);
		const loaded = loadModuleScenarios({
			slug: "text",
			metas: TEXT_TITLES.map((title, index) => ({
				key: TEXT_IDS[index].slice("text-".length),
				title,
			})),
			renderModules: textRenders,
			sourceModules: textSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...TEXT_TITLES]);
		expect(TEXT_EXAMPLES.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(TEXT_EXAMPLES.map((item) => item.title)).toEqual([...TEXT_TITLES]);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		const fileKeys = new Set(
			Object.keys(textRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(TEXT_IDS.map((id) => id.slice("text-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("text-".length);
			const modulePath = Object.keys(textSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = textSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(TEXT_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((textRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				TEXT_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			if (scenario.id === "text-sizes" || scenario.id === "text-muted-tone") {
				expect(scenario.code).not.toMatch(/as=|<h[1-6]|Semantic HTML/i);
			}
		}
	});
});

describe("source-backed label scenarios", () => {
	it("loads three label scenarios from the same glob modules", () => {
		expect(Object.keys(labelRenders)).toHaveLength(3);
		expect(Object.keys(labelSources)).toHaveLength(3);
		const loaded = loadModuleScenarios({
			slug: "label",
			metas: LABEL_TITLES.map((title, index) => ({
				key: LABEL_IDS[index].slice("label-".length),
				title,
			})),
			renderModules: labelRenders,
			sourceModules: labelSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...LABEL_TITLES]);
		expect(LABEL_EXAMPLES.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(LABEL_EXAMPLES.map((item) => item.title)).toEqual([...LABEL_TITLES]);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		const fileKeys = new Set(
			Object.keys(labelRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(LABEL_IDS.map((id) => id.slice("label-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("label-".length);
			const modulePath = Object.keys(labelSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = labelSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(LABEL_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((labelRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				LABEL_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
		}
		expect(LABEL_EXAMPLES[0]?.code).toContain("flex w-full flex-col gap-3");
		expect(LABEL_EXAMPLES[2]?.code).toContain("More information about this field");
		expect(LABEL_EXAMPLES[2]?.code).not.toMatch(/tooltip="More information"/);
	});
});

describe("source-backed separator scenarios", () => {
	it("loads one separator scenario from the same glob modules", () => {
		expect(Object.keys(separatorRenders)).toHaveLength(1);
		expect(Object.keys(separatorSources)).toHaveLength(1);
		const loaded = loadModuleScenarios({
			slug: "separator",
			metas: SEPARATOR_TITLES.map((title, index) => ({
				key: SEPARATOR_IDS[index].slice("separator-".length),
				title,
			})),
			renderModules: separatorRenders,
			sourceModules: separatorSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...SEPARATOR_TITLES]);
		expect(SEPARATOR_EXAMPLES.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(SEPARATOR_EXAMPLES.map((item) => item.title)).toEqual([...SEPARATOR_TITLES]);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		const fileKeys = new Set(
			Object.keys(separatorRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(SEPARATOR_IDS.map((id) => id.slice("separator-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("separator-".length);
			const modulePath = Object.keys(separatorSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = separatorSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(SEPARATOR_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((separatorRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				SEPARATOR_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
		}
		expect(SEPARATOR_EXAMPLES[0]?.code).toContain("w-full max-w-sm space-y-3");
		expect(SEPARATOR_EXAMPLES[0]?.code).toContain("<Text>Above</Text>");
		expect(SEPARATOR_EXAMPLES[0]?.code).toContain("<Separator />");
		expect(SEPARATOR_EXAMPLES[0]?.code).toContain("<Text>Below</Text>");
		expect(SEPARATOR_EXAMPLES[0]?.code).not.toBe("<Separator />");
	});
});

describe("source-backed link scenarios", () => {
	it("loads three link scenarios from the same glob modules", () => {
		expect(Object.keys(linkRenders)).toHaveLength(3);
		expect(Object.keys(linkSources)).toHaveLength(3);
		const loaded = loadModuleScenarios({
			slug: "link",
			metas: LINK_TITLES.map((title, index) => ({
				key: LINK_IDS[index].slice("link-".length),
				title,
			})),
			renderModules: linkRenders,
			sourceModules: linkSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...LINK_TITLES]);
		expect(LINK_EXAMPLES.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(LINK_EXAMPLES.map((item) => item.title)).toEqual([...LINK_TITLES]);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		const fileKeys = new Set(
			Object.keys(linkRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(LINK_IDS.map((id) => id.slice("link-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("link-".length);
			const modulePath = Object.keys(linkSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = linkSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(LINK_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((linkRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				LINK_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("LinkProvider");
		}
		expect(LINK_EXAMPLES[0]?.code).toContain('href="#section"');
		expect(LINK_EXAMPLES[0]?.code).toContain("Inline link");
		expect(LINK_EXAMPLES[1]?.code).toContain('href="#docs"');
		expect(LINK_EXAMPLES[2]?.code).toContain('href="https://example.com"');
		expect(LINK_EXAMPLES[2]?.code).toContain("Example");
		expect(LINK_EXAMPLES[2]?.code).not.toMatch(/\btarget=|\brel=|ExternalIcon/);
	});
});

describe("source-backed tooltip scenarios", () => {
	it("loads two tooltip scenarios from the same glob modules", () => {
		expect(Object.keys(tooltipRenders)).toHaveLength(2);
		expect(Object.keys(tooltipSources)).toHaveLength(2);
		const loaded = loadModuleScenarios({
			slug: "tooltip",
			metas: TOOLTIP_TITLES.map((title, index) => ({
				key: TOOLTIP_IDS[index].slice("tooltip-".length),
				title,
			})),
			renderModules: tooltipRenders,
			sourceModules: tooltipSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...TOOLTIP_TITLES]);
		expect(TOOLTIP_EXAMPLES.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(TOOLTIP_EXAMPLES.map((item) => item.title)).toEqual([...TOOLTIP_TITLES]);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		const fileKeys = new Set(
			Object.keys(tooltipRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(TOOLTIP_IDS.map((id) => id.slice("tooltip-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("tooltip-".length);
			const modulePath = Object.keys(tooltipSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = tooltipSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(TOOLTIP_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((tooltipRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				TOOLTIP_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("TooltipProvider");
			expect(scenario.code).toContain("TooltipTrigger asChild");
			expect(scenario.code).toContain("TooltipContent");
		}
		expect(TOOLTIP_EXAMPLES[0]?.code).toContain(">Hover</Button>");
		expect(TOOLTIP_EXAMPLES[0]?.code).toContain(">Hint</TooltipContent>");
		expect(TOOLTIP_EXAMPLES[1]?.code).toContain("flex flex-wrap items-center gap-3");
		expect(TOOLTIP_EXAMPLES[1]?.code).toContain(">One</Button>");
		expect(TOOLTIP_EXAMPLES[1]?.code).toContain(">First</TooltipContent>");
		expect(TOOLTIP_EXAMPLES[1]?.code).toContain(">Two</Button>");
		expect(TOOLTIP_EXAMPLES[1]?.code).toContain(">Second</TooltipContent>");
	});
});

describe("source-backed theme-toggle scenarios", () => {
	it("loads one theme-toggle scenario from the same glob modules", () => {
		expect(Object.keys(themeToggleRenders)).toHaveLength(1);
		expect(Object.keys(themeToggleSources)).toHaveLength(1);
		const loaded = loadModuleScenarios({
			slug: "theme-toggle",
			metas: THEME_TOGGLE_TITLES.map((title, index) => ({
				key: THEME_TOGGLE_IDS[index].slice("theme-toggle-".length),
				title,
			})),
			renderModules: themeToggleRenders,
			sourceModules: themeToggleSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...THEME_TOGGLE_TITLES]);
		expect(THEME_TOGGLE_EXAMPLES.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(THEME_TOGGLE_EXAMPLES.map((item) => item.title)).toEqual([...THEME_TOGGLE_TITLES]);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		const fileKeys = new Set(
			Object.keys(themeToggleRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(
			new Set(THEME_TOGGLE_IDS.map((id) => id.slice("theme-toggle-".length))),
		);
		for (const scenario of loaded) {
			const key = scenario.id.slice("theme-toggle-".length);
			const modulePath = Object.keys(themeToggleSources).find((path) =>
				path.endsWith(`/${key}.tsx`),
			);
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = themeToggleSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(
				THEME_TOGGLE_EXAMPLES.find((item) => item.id === scenario.id)?.code,
			);
			expect(scenario.render).toBe(
				(themeToggleRenders[modulePath] as { default: unknown }).default,
			);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				THEME_TOGGLE_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("ThemeProvider");
			expect(scenario.code).toContain("ThemeToggle");
			expect(scenario.code).toContain('aria-label="Toggle theme"');
		}
		expect(THEME_TOGGLE_EXAMPLES[0]?.code).toContain("@nocoo/basalt/components/theme-toggle");
		expect(THEME_TOGGLE_EXAMPLES[0]?.code).toContain("@nocoo/basalt/providers/theme");
		expect(THEME_TOGGLE_EXAMPLES[0]?.code).not.toBe('<ThemeToggle aria-label="Toggle theme" />');
	});
});

describe("source-backed layer-card scenarios", () => {
	it("loads five layer-card scenarios from the same glob modules", () => {
		expect(Object.keys(layerCardRenders)).toHaveLength(5);
		expect(Object.keys(layerCardSources)).toHaveLength(5);
		const loaded = loadModuleScenarios({
			slug: "layer-card",
			metas: LAYER_CARD_TITLES.map((title, index) => ({
				key: LAYER_CARD_IDS[index].slice("layer-card-".length),
				title,
			})),
			renderModules: layerCardRenders,
			sourceModules: layerCardSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...LAYER_CARD_TITLES]);
		expect(LAYER_CARD_EXAMPLES.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(LAYER_CARD_EXAMPLES.map((item) => item.title)).toEqual([...LAYER_CARD_TITLES]);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		const fileKeys = new Set(
			Object.keys(layerCardRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(LAYER_CARD_IDS.map((id) => id.slice("layer-card-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("layer-card-".length);
			const modulePath = Object.keys(layerCardSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = layerCardSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(LAYER_CARD_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((layerCardRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				LAYER_CARD_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/layer-card");
			expect(scenario.code).toContain("import { LayerCard }");
		}
		expect(LAYER_CARD_EXAMPLES[0]?.code).toContain('className="w-[250px]"');
		expect(LAYER_CARD_EXAMPLES[0]?.code).toContain("Next Steps");
		expect(LAYER_CARD_EXAMPLES[0]?.code).toContain("Hello");
		expect(LAYER_CARD_EXAMPLES[0]?.code).not.toBe(
			"<LayerCard><LayerCard.Secondary>Next Steps</LayerCard.Secondary><LayerCard.Primary>Hello</LayerCard.Primary></LayerCard>",
		);
		expect(LAYER_CARD_EXAMPLES[1]?.code).toContain('className="w-[250px] p-4"');
		expect(LAYER_CARD_EXAMPLES[1]?.code).toContain("Quick start guide");
		expect(LAYER_CARD_EXAMPLES[2]?.code).toContain('className="flex w-full gap-4"');
		expect(LAYER_CARD_EXAMPLES[2]?.code).toContain('className="w-[200px]"');
		expect(LAYER_CARD_EXAMPLES[2]?.code).toContain("Browse all components");
		expect(LAYER_CARD_EXAMPLES[2]?.code).toContain("View code examples");
		expect(LAYER_CARD_EXAMPLES[2]?.code).toContain('<div className="flex w-full gap-4">');
		expect(LAYER_CARD_EXAMPLES[3]?.code).toContain("<LayerCard.Header>");
		expect(LAYER_CARD_EXAMPLES[3]?.code).toContain("<LayerCard.Body>");
		expect(LAYER_CARD_EXAMPLES[3]?.code).toContain("<LayerCard.Footer>");
		expect(LAYER_CARD_EXAMPLES[4]?.code).toContain(
			'<LayerCard.Loading label="Loading account activity" />',
		);
		expect(LAYER_CARD_EXAMPLES[4]?.code).toContain("<LayerCard.Empty");
	});
});

describe("source-backed basalt-mark scenarios", () => {
	it("loads one basalt-mark scenario from the same glob modules", () => {
		expect(Object.keys(basaltMarkRenders)).toHaveLength(1);
		expect(Object.keys(basaltMarkSources)).toHaveLength(1);
		const loaded = loadModuleScenarios({
			slug: "basalt-mark",
			metas: BASALT_MARK_TITLES.map((title, index) => ({
				key: BASALT_MARK_IDS[index].slice("basalt-mark-".length),
				title,
			})),
			renderModules: basaltMarkRenders,
			sourceModules: basaltMarkSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...BASALT_MARK_TITLES]);
		expect(BASALT_MARK_EXAMPLES.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(BASALT_MARK_EXAMPLES.map((item) => item.title)).toEqual([...BASALT_MARK_TITLES]);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		const fileKeys = new Set(
			Object.keys(basaltMarkRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(BASALT_MARK_IDS.map((id) => id.slice("basalt-mark-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("basalt-mark-".length);
			const modulePath = Object.keys(basaltMarkSources).find((path) =>
				path.endsWith(`/${key}.tsx`),
			);
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = basaltMarkSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(
				BASALT_MARK_EXAMPLES.find((item) => item.id === scenario.id)?.code,
			);
			expect(scenario.render).toBe((basaltMarkRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				BASALT_MARK_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default function Example");
			expect(scenario.code).toContain("@nocoo/basalt/components/basalt-mark");
			expect(scenario.code).toContain("import { BasaltMark }");
			expect(scenario.code).toContain("<BasaltMark />");
		}
		expect(BASALT_MARK_EXAMPLES[0]?.code).not.toBe("<BasaltMark />");
	});
});

describe("source-backed field scenarios", () => {
	it("loads four field scenarios from the same glob modules", () => {
		expect(Object.keys(fieldRenders)).toHaveLength(4);
		expect(Object.keys(fieldSources)).toHaveLength(4);
		const loaded = loadModuleScenarios({
			slug: "field",
			metas: FIELD_TITLES.map((title, index) => ({
				key: FIELD_IDS[index].slice("field-".length),
				title,
			})),
			renderModules: fieldRenders,
			sourceModules: fieldSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...FIELD_TITLES]);
		expect(FIELD_EXAMPLES.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(FIELD_EXAMPLES.map((item) => item.title)).toEqual([...FIELD_TITLES]);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		const fileKeys = new Set(
			Object.keys(fieldRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(FIELD_IDS.map((id) => id.slice("field-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("field-".length);
			const modulePath = Object.keys(fieldSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = fieldSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(FIELD_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((fieldRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				FIELD_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/field");
			expect(scenario.code).toContain("@nocoo/basalt/components/input");
			expect(scenario.code).toContain("import { Field }");
			expect(scenario.code).toContain("import { Input }");
		}
		expect(FIELD_EXAMPLES[0]?.code).toContain('htmlFor="field-hint-email"');
		expect(FIELD_EXAMPLES[0]?.code).toContain('id="field-hint-email"');
		expect(FIELD_EXAMPLES[0]?.code).toContain('label="Email"');
		expect(FIELD_EXAMPLES[0]?.code).toContain('hint="Never shared"');
		expect(FIELD_EXAMPLES[0]?.code).not.toContain("ex-email");
		expect(FIELD_EXAMPLES[0]?.code).not.toContain("kumo-ex-email");
		expect(FIELD_EXAMPLES[1]?.code).toContain('htmlFor="field-error-email"');
		expect(FIELD_EXAMPLES[1]?.code).toContain('id="field-error-email"');
		expect(FIELD_EXAMPLES[1]?.code).toContain('error="Required"');
		expect(FIELD_EXAMPLES[1]?.code).not.toContain("ex-email-err");
		expect(FIELD_EXAMPLES[1]?.code).not.toContain("kumo-ex-email-err");
		expect(FIELD_EXAMPLES[2]?.code).toContain("label={<span>Workspace name</span>}");
		expect(FIELD_EXAMPLES[2]?.code).toContain("hint={<span>Shown on invoices</span>}");
		expect(FIELD_EXAMPLES[2]?.code).toContain("required={false}");
		expect(FIELD_EXAMPLES[2]?.code).toContain('labelTooltip="Used in billing"');
		expect(FIELD_EXAMPLES[3]?.code).toContain(
			"error={{ message: <span>Enter a valid email</span> }}",
		);
		expect(FIELD_EXAMPLES[3]?.code).not.toContain("htmlFor");
		expect(FIELD_EXAMPLES[3]?.code).not.toContain("id=");
	});
});

describe("source-backed input scenarios", () => {
	it("loads seven input scenarios from the same glob modules", () => {
		expect(Object.keys(inputRenders)).toHaveLength(7);
		expect(Object.keys(inputSources)).toHaveLength(7);
		const loaded = loadModuleScenarios({
			slug: "input",
			metas: INPUT_TITLES.map((title, index) => ({
				key: INPUT_IDS[index].slice("input-".length),
				title,
			})),
			renderModules: inputRenders,
			sourceModules: inputSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...INPUT_TITLES]);
		expect(INPUT_EXAMPLES.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(INPUT_EXAMPLES.map((item) => item.title)).toEqual([...INPUT_TITLES]);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		const fileKeys = new Set(
			Object.keys(inputRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(INPUT_IDS.map((id) => id.slice("input-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("input-".length);
			const modulePath = Object.keys(inputSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = inputSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(INPUT_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((inputRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				INPUT_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input");
			expect(scenario.code).toContain("import { Input }");
		}
		expect(INPUT_EXAMPLES[0]?.code).toContain("@nocoo/basalt/components/field");
		expect(INPUT_EXAMPLES[0]?.code).toContain("import { Field }");
		expect(INPUT_EXAMPLES[0]?.code).toContain('htmlFor="ex-input-email"');
		expect(INPUT_EXAMPLES[0]?.code).toContain('id="ex-input-email"');
		expect(INPUT_EXAMPLES[0]?.code).toContain('label="Email"');
		expect(INPUT_EXAMPLES[0]?.code).toContain('hint="Never shared"');
		expect(INPUT_EXAMPLES[0]?.code).toContain('placeholder="you@example.com"');
		expect(INPUT_EXAMPLES[1]?.code).toContain("@nocoo/basalt/components/field");
		expect(INPUT_EXAMPLES[1]?.code).toContain("import { Field }");
		expect(INPUT_EXAMPLES[1]?.code).toContain('htmlFor="ex-input-err"');
		expect(INPUT_EXAMPLES[1]?.code).toContain('id="ex-input-err"');
		expect(INPUT_EXAMPLES[1]?.code).toContain('error="Required"');
		expect(INPUT_EXAMPLES[2]?.code).toContain("disabled");
		expect(INPUT_EXAMPLES[2]?.code).toContain('value="Read only"');
		expect(INPUT_EXAMPLES[2]?.code).toContain('aria-label="Disabled input"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('<div className="flex w-full flex-col gap-3">');
		expect(INPUT_EXAMPLES[3]?.code).toContain('type="email"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('placeholder="Email"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('aria-label="Email type"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('type="password"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('placeholder="Password"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('aria-label="Password type"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('type="search"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('placeholder="Search"');
		expect(INPUT_EXAMPLES[3]?.code).toContain('aria-label="Search type"');
		expect(INPUT_EXAMPLES[3]?.code).not.toBe(
			'<Input type="email" placeholder="Email" aria-label="Email type" /><Input type="password" placeholder="Password" aria-label="Password type" /><Input type="search" placeholder="Search" aria-label="Search type" />',
		);
		expect(INPUT_EXAMPLES[4]?.code).toContain('aria-label="Name"');
		expect(INPUT_EXAMPLES[4]?.code).toContain('placeholder="Jane Doe"');
		expect(INPUT_EXAMPLES[5]?.code).toContain('size="sm"');
		expect(INPUT_EXAMPLES[5]?.code).toContain('aria-label="Small"');
		expect(INPUT_EXAMPLES[5]?.code).toContain('aria-label="Default"');
		expect(INPUT_EXAMPLES[5]?.code).toContain('size="lg"');
		expect(INPUT_EXAMPLES[5]?.code).toContain('aria-label="Large"');
		expect(INPUT_EXAMPLES[6]?.code).toContain("useState");
		expect(INPUT_EXAMPLES[6]?.code).toContain("@nocoo/basalt/components/field");
		expect(INPUT_EXAMPLES[6]?.code).toContain("@nocoo/basalt/components/button");
		expect(INPUT_EXAMPLES[6]?.code).toContain("Reset");
		const typesOrder = INPUT_EXAMPLES[3]?.code ?? "";
		expect(typesOrder.indexOf('type="email"')).toBeLessThan(typesOrder.indexOf('type="password"'));
		expect(typesOrder.indexOf('type="password"')).toBeLessThan(typesOrder.indexOf('type="search"'));
	});
});

describe("source-backed input-area scenarios", () => {
	it("loads six input-area scenarios from the same glob modules", () => {
		expect(Object.keys(inputAreaRenders)).toHaveLength(6);
		expect(Object.keys(inputAreaSources)).toHaveLength(6);
		const loaded = loadModuleScenarios({
			slug: "input-area",
			metas: INPUT_AREA_TITLES.map((title, index) => ({
				key: INPUT_AREA_IDS[index].slice("input-area-".length),
				title,
			})),
			renderModules: inputAreaRenders,
			sourceModules: inputAreaSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...INPUT_AREA_TITLES]);
		expect(INPUT_AREA_EXAMPLES.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		expect(INPUT_AREA_EXAMPLES.map((item) => item.title)).toEqual([...INPUT_AREA_TITLES]);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([...INPUT_IDS]);
		const fileKeys = new Set(
			Object.keys(inputAreaRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(INPUT_AREA_IDS.map((id) => id.slice("input-area-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("input-area-".length);
			const modulePath = Object.keys(inputAreaSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = inputAreaSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(INPUT_AREA_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((inputAreaRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				INPUT_AREA_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input-area");
			expect(scenario.code).toContain("import { InputArea }");
		}
		expect(INPUT_AREA_EXAMPLES[0]?.code).toContain("@nocoo/basalt/components/field");
		expect(INPUT_AREA_EXAMPLES[0]?.code).toContain("import { Field }");
		expect(INPUT_AREA_EXAMPLES[0]?.code).toContain('htmlFor="ex-notes"');
		expect(INPUT_AREA_EXAMPLES[0]?.code).toContain('id="ex-notes"');
		expect(INPUT_AREA_EXAMPLES[0]?.code).toContain('label="Notes"');
		expect(INPUT_AREA_EXAMPLES[1]?.code).toContain("rows={6}");
		expect(INPUT_AREA_EXAMPLES[1]?.code).toContain('aria-label="Tall notes"');
		expect(INPUT_AREA_EXAMPLES[2]?.code).toContain("@nocoo/basalt/components/field");
		expect(INPUT_AREA_EXAMPLES[2]?.code).toContain("import { Field }");
		expect(INPUT_AREA_EXAMPLES[2]?.code).toContain('htmlFor="ex-bio"');
		expect(INPUT_AREA_EXAMPLES[2]?.code).toContain('id="ex-bio"');
		expect(INPUT_AREA_EXAMPLES[2]?.code).toContain('label="Bio"');
		expect(INPUT_AREA_EXAMPLES[2]?.code).toContain('error="Too short"');
		expect(INPUT_AREA_EXAMPLES[3]?.code).toContain("disabled");
		expect(INPUT_AREA_EXAMPLES[3]?.code).toContain('aria-label="Disabled notes"');
		expect(INPUT_AREA_EXAMPLES[3]?.code).toContain('value="Unavailable"');
		expect(INPUT_AREA_EXAMPLES[4]?.code).toContain('size="sm"');
		expect(INPUT_AREA_EXAMPLES[4]?.code).toContain('aria-label="Small notes"');
		expect(INPUT_AREA_EXAMPLES[4]?.code).toContain('aria-label="Default notes"');
		expect(INPUT_AREA_EXAMPLES[4]?.code).toContain('size="lg"');
		expect(INPUT_AREA_EXAMPLES[5]?.code).toContain("useState");
		expect(INPUT_AREA_EXAMPLES[5]?.code).toContain("@nocoo/basalt/components/field");
		expect(INPUT_AREA_EXAMPLES[5]?.code).toContain("@nocoo/basalt/components/button");
		expect(INPUT_AREA_EXAMPLES[5]?.code).toContain("Reset");
	});
});

describe("source-backed input-group scenarios", () => {
	it("loads five input-group scenarios from the same glob modules", () => {
		expect(Object.keys(inputGroupRenders)).toHaveLength(5);
		expect(Object.keys(inputGroupSources)).toHaveLength(5);
		const loaded = loadModuleScenarios({
			slug: "input-group",
			metas: INPUT_GROUP_TITLES.map((title, index) => ({
				key: INPUT_GROUP_IDS[index].slice("input-group-".length),
				title,
			})),
			renderModules: inputGroupRenders,
			sourceModules: inputGroupSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...INPUT_GROUP_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...INPUT_GROUP_TITLES]);
		expect(INPUT_GROUP_EXAMPLES.map((item) => item.id)).toEqual([...INPUT_GROUP_IDS]);
		expect(INPUT_GROUP_EXAMPLES.map((item) => item.title)).toEqual([...INPUT_GROUP_TITLES]);
		expect(UI_EXAMPLES["input-group"]).toBe(INPUT_GROUP_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		const fileKeys = new Set(
			Object.keys(inputGroupRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(INPUT_GROUP_IDS.map((id) => id.slice("input-group-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("input-group-".length);
			const modulePath = Object.keys(inputGroupSources).find((path) =>
				path.endsWith(`/${key}.tsx`),
			);
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = inputGroupSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(
				INPUT_GROUP_EXAMPLES.find((item) => item.id === scenario.id)?.code,
			);
			expect(scenario.render).toBe((inputGroupRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				INPUT_GROUP_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input-group");
			expect(scenario.code).toContain("import { InputGroup }");
			expect(scenario.code).toContain('className="max-w-sm"');
		}
		expect(INPUT_GROUP_EXAMPLES[0]?.code).toContain('from "lucide-react"');
		expect(INPUT_GROUP_EXAMPLES[0]?.code).toContain("import { CircleCheck }");
		expect(INPUT_GROUP_EXAMPLES[0]?.code).toContain('defaultValue="atlas"');
		expect(INPUT_GROUP_EXAMPLES[0]?.code).toContain('aria-label="Subdomain"');
		expect(INPUT_GROUP_EXAMPLES[0]?.code).toContain(
			"<InputGroup.Suffix>.example.com</InputGroup.Suffix>",
		);
		expect(INPUT_GROUP_EXAMPLES[0]?.code).toContain('align="end"');
		expect(INPUT_GROUP_EXAMPLES[0]?.code).toContain('className="text-basalt-heatmap-green-3"');
		expect(INPUT_GROUP_EXAMPLES[1]?.code).toContain('from "lucide-react"');
		expect(INPUT_GROUP_EXAMPLES[1]?.code).toContain("import { Search }");
		expect(INPUT_GROUP_EXAMPLES[1]?.code).toContain("<Search />");
		expect(INPUT_GROUP_EXAMPLES[1]?.code).toContain('aria-label="Search"');
		expect(INPUT_GROUP_EXAMPLES[1]?.code).toContain('placeholder="Search"');
		expect(INPUT_GROUP_EXAMPLES[2]?.code).toContain(
			"<InputGroup.Addon>https://</InputGroup.Addon>",
		);
		expect(INPUT_GROUP_EXAMPLES[2]?.code).toContain('aria-label="Host"');
		expect(INPUT_GROUP_EXAMPLES[2]?.code).toContain('placeholder="example.com"');
		expect(INPUT_GROUP_EXAMPLES[3]?.code).toContain('from "lucide-react"');
		expect(INPUT_GROUP_EXAMPLES[3]?.code).toContain("import { Search }");
		expect(INPUT_GROUP_EXAMPLES[3]?.code).toContain('aria-label="Query"');
		expect(INPUT_GROUP_EXAMPLES[3]?.code).toContain('placeholder="Search"');
		expect(INPUT_GROUP_EXAMPLES[3]?.code).toContain(
			'<InputGroup.Button icon={<Search />} aria-label="Search" />',
		);
		expect(INPUT_GROUP_EXAMPLES[4]?.code).toContain("@nocoo/basalt/components/loader");
		expect(INPUT_GROUP_EXAMPLES[4]?.code).toContain("import { Loader }");
		expect(INPUT_GROUP_EXAMPLES[4]?.code).toContain('defaultValue="atlas"');
		expect(INPUT_GROUP_EXAMPLES[4]?.code).toContain('aria-label="Loading query"');
		expect(INPUT_GROUP_EXAMPLES[4]?.code).toContain("<Loader size={16} />");
	});
});

describe("source-backed sensitive-input scenarios", () => {
	it("loads four sensitive-input scenarios from the same glob modules", () => {
		expect(Object.keys(sensitiveInputRenders)).toHaveLength(4);
		expect(Object.keys(sensitiveInputSources)).toHaveLength(4);
		const loaded = loadModuleScenarios({
			slug: "sensitive-input",
			metas: SENSITIVE_INPUT_TITLES.map((title, index) => ({
				key: SENSITIVE_INPUT_IDS[index].slice("sensitive-input-".length),
				title,
			})),
			renderModules: sensitiveInputRenders,
			sourceModules: sensitiveInputSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...SENSITIVE_INPUT_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...SENSITIVE_INPUT_TITLES]);
		expect(SENSITIVE_INPUT_EXAMPLES.map((item) => item.id)).toEqual([...SENSITIVE_INPUT_IDS]);
		expect(SENSITIVE_INPUT_EXAMPLES.map((item) => item.title)).toEqual([...SENSITIVE_INPUT_TITLES]);
		expect(UI_EXAMPLES["sensitive-input"]).toBe(SENSITIVE_INPUT_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES["input-group"]).toBe(INPUT_GROUP_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		expect(UI_EXAMPLES["input-group"]?.map((item) => item.id)).toEqual([...INPUT_GROUP_IDS]);
		const fileKeys = new Set(
			Object.keys(sensitiveInputRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(
			new Set(SENSITIVE_INPUT_IDS.map((id) => id.slice("sensitive-input-".length))),
		);
		for (const scenario of loaded) {
			const key = scenario.id.slice("sensitive-input-".length);
			const modulePath = Object.keys(sensitiveInputSources).find((path) =>
				path.endsWith(`/${key}.tsx`),
			);
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = sensitiveInputSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(
				SENSITIVE_INPUT_EXAMPLES.find((item) => item.id === scenario.id)?.code,
			);
			expect(scenario.render).toBe(
				(sensitiveInputRenders[modulePath] as { default: unknown }).default,
			);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				SENSITIVE_INPUT_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).not.toMatch(/API key|secret|token/i);
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/sensitive-input");
			expect(scenario.code).toContain("import { SensitiveInput }");
			expect(scenario.code).toContain('revealLabel="Show"');
			expect(scenario.code).toContain('hideLabel="Hide"');
		}
		expect(SENSITIVE_INPUT_EXAMPLES[0]?.code).toContain('aria-label="Password"');
		expect(SENSITIVE_INPUT_EXAMPLES[0]?.code).not.toContain("disabled");
		expect(SENSITIVE_INPUT_EXAMPLES[1]?.code).toContain('aria-label="Disabled password"');
		expect(SENSITIVE_INPUT_EXAMPLES[1]?.code).toContain("disabled");
	});
});

describe("source-backed checkbox scenarios", () => {
	it("loads seven checkbox scenarios from the same glob modules", () => {
		expect(Object.keys(checkboxRenders)).toHaveLength(7);
		expect(Object.keys(checkboxSources)).toHaveLength(7);
		const loaded = loadModuleScenarios({
			slug: "checkbox",
			metas: CHECKBOX_TITLES.map((title, index) => ({
				key: CHECKBOX_IDS[index].slice("checkbox-".length),
				title,
			})),
			renderModules: checkboxRenders,
			sourceModules: checkboxSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...CHECKBOX_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...CHECKBOX_TITLES]);
		expect(CHECKBOX_EXAMPLES.map((item) => item.id)).toEqual([...CHECKBOX_IDS]);
		expect(CHECKBOX_EXAMPLES.map((item) => item.title)).toEqual([...CHECKBOX_TITLES]);
		expect(UI_EXAMPLES.checkbox).toBe(CHECKBOX_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES["input-group"]).toBe(INPUT_GROUP_EXAMPLES);
		expect(UI_EXAMPLES["sensitive-input"]).toBe(SENSITIVE_INPUT_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		expect(UI_EXAMPLES["input-group"]?.map((item) => item.id)).toEqual([...INPUT_GROUP_IDS]);
		expect(UI_EXAMPLES["sensitive-input"]?.map((item) => item.id)).toEqual([
			...SENSITIVE_INPUT_IDS,
		]);
		const fileKeys = new Set(
			Object.keys(checkboxRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(CHECKBOX_IDS.map((id) => id.slice("checkbox-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("checkbox-".length);
			const modulePath = Object.keys(checkboxSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = checkboxSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(CHECKBOX_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((checkboxRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				CHECKBOX_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).not.toContain("@cloudflare/kumo");
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/checkbox");
			expect(scenario.code).toContain("import { Checkbox }");
		}
		expect(CHECKBOX_EXAMPLES[0]?.code).toContain('aria-label="Unchecked"');
		expect(CHECKBOX_EXAMPLES[0]?.code).not.toContain("disabled");
		expect(CHECKBOX_EXAMPLES[0]?.code).not.toContain("defaultChecked");
		expect(CHECKBOX_EXAMPLES[1]?.code).toContain("defaultChecked");
		expect(CHECKBOX_EXAMPLES[1]?.code).toContain('aria-label="Checked"');
		expect(CHECKBOX_EXAMPLES[2]?.code).toContain('checked="indeterminate"');
		expect(CHECKBOX_EXAMPLES[2]?.code).toContain('aria-label="Partial"');
		expect(CHECKBOX_EXAMPLES[3]?.code).toContain('className="flex flex-wrap items-center gap-3"');
		expect(CHECKBOX_EXAMPLES[3]?.code).toContain('aria-label="Disabled off"');
		expect(CHECKBOX_EXAMPLES[3]?.code).toContain('aria-label="Disabled on"');
		expect(CHECKBOX_EXAMPLES[3]?.code).toContain("disabled");
		expect(CHECKBOX_EXAMPLES[4]?.code).toContain("@nocoo/basalt/components/field");
		expect(CHECKBOX_EXAMPLES[4]?.code).toContain("import { Field }");
		expect(CHECKBOX_EXAMPLES[4]?.code).toContain('label="Terms"');
		expect(CHECKBOX_EXAMPLES[4]?.code).toContain('htmlFor="ex-terms"');
		expect(CHECKBOX_EXAMPLES[4]?.code).toContain('error="Required"');
		expect(CHECKBOX_EXAMPLES[4]?.code).toContain('id="ex-terms"');
		expect(CHECKBOX_EXAMPLES[4]?.code).toContain('aria-label="Terms"');
		expect(CHECKBOX_EXAMPLES[5]?.code).toContain("Checkbox.Group");
		expect(CHECKBOX_EXAMPLES[5]?.code).toContain("Checkbox.Legend");
		expect(CHECKBOX_EXAMPLES[5]?.code).toContain("Checkbox.Item");
		expect(CHECKBOX_EXAMPLES[5]?.code).toContain("Topics");
		expect(CHECKBOX_EXAMPLES[6]?.code).toContain("useState");
		expect(CHECKBOX_EXAMPLES[6]?.code).toContain("onValueChange");
		expect(CHECKBOX_EXAMPLES[6]?.code).toContain("Pick at least two");
		expect(CHECKBOX_EXAMPLES[6]?.code).toContain('size="sm"');
	});
});

describe("source-backed radio scenarios", () => {
	it("loads five radio scenarios from the same glob modules", () => {
		expect(Object.keys(radioRenders)).toHaveLength(5);
		expect(Object.keys(radioSources)).toHaveLength(5);
		const loaded = loadModuleScenarios({
			slug: "radio",
			metas: RADIO_TITLES.map((title, index) => ({
				key: RADIO_IDS[index].slice("radio-".length),
				title,
			})),
			renderModules: radioRenders,
			sourceModules: radioSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...RADIO_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...RADIO_TITLES]);
		expect(RADIO_EXAMPLES.map((item) => item.id)).toEqual([...RADIO_IDS]);
		expect(RADIO_EXAMPLES.map((item) => item.title)).toEqual([...RADIO_TITLES]);
		expect(UI_EXAMPLES.radio).toBe(RADIO_EXAMPLES);
		expect(UI_EXAMPLES.switch).toBe(SWITCH_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES["input-group"]).toBe(INPUT_GROUP_EXAMPLES);
		expect(UI_EXAMPLES["sensitive-input"]).toBe(SENSITIVE_INPUT_EXAMPLES);
		expect(UI_EXAMPLES.checkbox).toBe(CHECKBOX_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		expect(UI_EXAMPLES["input-group"]?.map((item) => item.id)).toEqual([...INPUT_GROUP_IDS]);
		expect(UI_EXAMPLES["sensitive-input"]?.map((item) => item.id)).toEqual([
			...SENSITIVE_INPUT_IDS,
		]);
		expect(UI_EXAMPLES.checkbox?.map((item) => item.id)).toEqual([...CHECKBOX_IDS]);
		expect(UI_EXAMPLES.switch?.map((item) => item.id)).toEqual([...SWITCH_IDS]);
		const fileKeys = new Set(
			Object.keys(radioRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(RADIO_IDS.map((id) => id.slice("radio-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("radio-".length);
			const modulePath = Object.keys(radioSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = radioSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(RADIO_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((radioRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				RADIO_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).not.toContain("@cloudflare/kumo");
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/radio");
			expect(scenario.code).toContain("import { Radio");
		}
		expect(RADIO_EXAMPLES[0]?.code).toContain("@nocoo/basalt/components/label");
		expect(RADIO_EXAMPLES[0]?.code).toContain("import { Label }");
		expect(RADIO_EXAMPLES[0]?.code).toContain('className="flex flex-col gap-2"');
		expect(RADIO_EXAMPLES[0]?.code).toContain('className="flex items-center gap-2"');
		expect(RADIO_EXAMPLES[0]?.code).toContain('value="a"');
		expect(RADIO_EXAMPLES[0]?.code).toContain('value="b"');
		expect(RADIO_EXAMPLES[0]?.code).toContain("Alpha");
		expect(RADIO_EXAMPLES[0]?.code).toContain("Beta");
		expect(RADIO_EXAMPLES[0]?.code).not.toContain("disabled");
		expect(RADIO_EXAMPLES[1]?.code).toContain("@nocoo/basalt/components/label");
		expect(RADIO_EXAMPLES[1]?.code).toContain("import { Label }");
		expect(RADIO_EXAMPLES[1]?.code).toContain('className="flex gap-4"');
		expect(RADIO_EXAMPLES[1]?.code).toContain("Alpha");
		expect(RADIO_EXAMPLES[1]?.code).toContain("Beta");
		expect(RADIO_EXAMPLES[1]?.code).not.toContain("disabled");
		expect(RADIO_EXAMPLES[2]?.code).not.toContain("@nocoo/basalt/components/label");
		expect(RADIO_EXAMPLES[2]?.code).toContain('className="flex gap-4"');
		expect(RADIO_EXAMPLES[2]?.code).toContain('aria-label="Disabled A"');
		expect(RADIO_EXAMPLES[2]?.code).toContain('aria-label="Disabled B"');
		expect(RADIO_EXAMPLES[2]?.code).toContain("disabled");
		expect(RADIO_EXAMPLES[0]?.code).toContain("import { Radio, RadioGroup }");
		expect(RADIO_EXAMPLES[0]?.code).toContain('defaultValue="a"');
		expect(RADIO_EXAMPLES[3]?.code).toContain("Radio.Group");
		expect(RADIO_EXAMPLES[3]?.code).toContain("Radio.Legend");
		expect(RADIO_EXAMPLES[3]?.code).toContain("Radio.Item");
		expect(RADIO_EXAMPLES[4]?.code).toContain("useState");
		expect(RADIO_EXAMPLES[4]?.code).toContain("onValueChange");
		expect(RADIO_EXAMPLES[4]?.code).toContain("Pick a plan");
	});
});

describe("source-backed switch scenarios", () => {
	it("loads six switch scenarios from the same glob modules", () => {
		expect(Object.keys(switchRenders)).toHaveLength(6);
		expect(Object.keys(switchSources)).toHaveLength(6);
		const loaded = loadModuleScenarios({
			slug: "switch",
			metas: SWITCH_TITLES.map((title, index) => ({
				key: SWITCH_IDS[index].slice("switch-".length),
				title,
			})),
			renderModules: switchRenders,
			sourceModules: switchSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...SWITCH_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...SWITCH_TITLES]);
		expect(SWITCH_EXAMPLES.map((item) => item.id)).toEqual([...SWITCH_IDS]);
		expect(SWITCH_EXAMPLES.map((item) => item.title)).toEqual([...SWITCH_TITLES]);
		expect(UI_EXAMPLES.switch).toBe(SWITCH_EXAMPLES);
		expect(UI_EXAMPLES.select).toBe(SELECT_EXAMPLES);
		expect(UI_EXAMPLES.radio).toBe(RADIO_EXAMPLES);
		expect(UI_EXAMPLES.checkbox).toBe(CHECKBOX_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES["input-group"]).toBe(INPUT_GROUP_EXAMPLES);
		expect(UI_EXAMPLES["sensitive-input"]).toBe(SENSITIVE_INPUT_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		expect(UI_EXAMPLES["input-group"]?.map((item) => item.id)).toEqual([...INPUT_GROUP_IDS]);
		expect(UI_EXAMPLES["sensitive-input"]?.map((item) => item.id)).toEqual([
			...SENSITIVE_INPUT_IDS,
		]);
		expect(UI_EXAMPLES.checkbox?.map((item) => item.id)).toEqual([...CHECKBOX_IDS]);
		expect(UI_EXAMPLES.radio?.map((item) => item.id)).toEqual([...RADIO_IDS]);
		expect(UI_EXAMPLES.select?.map((item) => item.id)).toEqual([...SELECT_IDS]);
		const fileKeys = new Set(
			Object.keys(switchRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(SWITCH_IDS.map((id) => id.slice("switch-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("switch-".length);
			const modulePath = Object.keys(switchSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = switchSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(SWITCH_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((switchRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				SWITCH_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).not.toContain("@cloudflare/kumo");
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/switch");
			expect(scenario.code).toContain("import { Switch }");
			if (
				scenario.id !== "switch-group-and-legend" &&
				scenario.id !== "switch-controlled-and-error"
			) {
				expect(scenario.code).not.toContain("useState");
				expect(scenario.code).not.toContain("Label");
				expect(scenario.code).not.toContain("Field");
			}
		}
		expect(SWITCH_EXAMPLES[0]?.code).toContain('aria-label="Off"');
		expect(SWITCH_EXAMPLES[0]?.code).not.toContain("defaultChecked");
		expect(SWITCH_EXAMPLES[0]?.code).not.toContain("disabled");
		expect(SWITCH_EXAMPLES[1]?.code).toContain("defaultChecked");
		expect(SWITCH_EXAMPLES[1]?.code).toContain('aria-label="On"');
		expect(SWITCH_EXAMPLES[1]?.code).not.toContain("disabled");
		expect(SWITCH_EXAMPLES[2]?.code).toContain('className="flex flex-wrap items-center gap-3"');
		expect(SWITCH_EXAMPLES[2]?.code).toContain('aria-label="Disabled off"');
		expect(SWITCH_EXAMPLES[2]?.code).toContain('aria-label="Disabled on"');
		expect(SWITCH_EXAMPLES[2]?.code).toContain("disabled");
		expect(SWITCH_EXAMPLES[3]?.code).toContain('className="flex flex-wrap items-center gap-3"');
		expect(SWITCH_EXAMPLES[3]?.code).toContain('size="sm"');
		expect(SWITCH_EXAMPLES[3]?.code).toContain('aria-label="Small"');
		expect(SWITCH_EXAMPLES[3]?.code).toContain('aria-label="Default size"');
		expect(SWITCH_EXAMPLES[3]?.code).toContain("defaultChecked");
		expect(SWITCH_EXAMPLES[4]?.code).toContain("Switch.Group");
		expect(SWITCH_EXAMPLES[4]?.code).toContain("Switch.Legend");
		expect(SWITCH_EXAMPLES[4]?.code).toContain("Switch.Item");
		expect(SWITCH_EXAMPLES[5]?.code).toContain("useState");
		expect(SWITCH_EXAMPLES[5]?.code).toContain("onValueChange");
		expect(SWITCH_EXAMPLES[5]?.code).toContain("Turn on at least two");
	});
});

describe("source-backed select scenarios", () => {
	it("loads three select scenarios from the same glob modules", () => {
		expect(Object.keys(selectRenders)).toHaveLength(3);
		expect(Object.keys(selectSources)).toHaveLength(3);
		const loaded = loadModuleScenarios({
			slug: "select",
			metas: SELECT_TITLES.map((title, index) => ({
				key: SELECT_IDS[index].slice("select-".length),
				title,
			})),
			renderModules: selectRenders,
			sourceModules: selectSources as Record<string, string>,
		});
		expect(loaded.map((item) => item.id)).toEqual([...SELECT_IDS]);
		expect(loaded.map((item) => item.title)).toEqual([...SELECT_TITLES]);
		expect(SELECT_EXAMPLES.map((item) => item.id)).toEqual([...SELECT_IDS]);
		expect(SELECT_EXAMPLES.map((item) => item.title)).toEqual([...SELECT_TITLES]);
		expect(UI_EXAMPLES.select).toBe(SELECT_EXAMPLES);
		expect(UI_EXAMPLES.switch).toBe(SWITCH_EXAMPLES);
		expect(UI_EXAMPLES.radio).toBe(RADIO_EXAMPLES);
		expect(UI_EXAMPLES.checkbox).toBe(CHECKBOX_EXAMPLES);
		expect(UI_EXAMPLES.button).toBe(BUTTON_EXAMPLES);
		expect(UI_EXAMPLES["link-button"]).toBe(LINK_BUTTON_EXAMPLES);
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES.field).toBe(FIELD_EXAMPLES);
		expect(UI_EXAMPLES.input).toBe(INPUT_EXAMPLES);
		expect(UI_EXAMPLES["input-area"]).toBe(INPUT_AREA_EXAMPLES);
		expect(UI_EXAMPLES["input-group"]).toBe(INPUT_GROUP_EXAMPLES);
		expect(UI_EXAMPLES["sensitive-input"]).toBe(SENSITIVE_INPUT_EXAMPLES);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([...BUTTON_IDS]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([...LINK_BUTTON_IDS]);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual([...TEXT_IDS]);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([...LABEL_IDS]);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual([...SEPARATOR_IDS]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([...LINK_IDS]);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([...TOOLTIP_IDS]);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual([...THEME_TOGGLE_IDS]);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([...LAYER_CARD_IDS]);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual([...BASALT_MARK_IDS]);
		expect(UI_EXAMPLES.field?.map((item) => item.id)).toEqual([...FIELD_IDS]);
		expect(UI_EXAMPLES.input?.map((item) => item.id)).toEqual([...INPUT_IDS]);
		expect(UI_EXAMPLES["input-area"]?.map((item) => item.id)).toEqual([...INPUT_AREA_IDS]);
		expect(UI_EXAMPLES["input-group"]?.map((item) => item.id)).toEqual([...INPUT_GROUP_IDS]);
		expect(UI_EXAMPLES["sensitive-input"]?.map((item) => item.id)).toEqual([
			...SENSITIVE_INPUT_IDS,
		]);
		expect(UI_EXAMPLES.checkbox?.map((item) => item.id)).toEqual([...CHECKBOX_IDS]);
		expect(UI_EXAMPLES.radio?.map((item) => item.id)).toEqual([...RADIO_IDS]);
		expect(UI_EXAMPLES.switch?.map((item) => item.id)).toEqual([...SWITCH_IDS]);
		const fileKeys = new Set(
			Object.keys(selectRenders).map((modulePath) => moduleFileKey(modulePath)),
		);
		expect(fileKeys).toEqual(new Set(SELECT_IDS.map((id) => id.slice("select-".length))));
		for (const scenario of loaded) {
			const key = scenario.id.slice("select-".length);
			const modulePath = Object.keys(selectSources).find((path) => path.endsWith(`/${key}.tsx`));
			expect(modulePath, key).toBeTruthy();
			if (!modulePath) {
				continue;
			}
			const raw = selectSources[modulePath];
			expect(typeof raw).toBe("string");
			expect(scenario.code).toBe((raw as string).trim());
			expect(scenario.code).toBe(SELECT_EXAMPLES.find((item) => item.id === scenario.id)?.code);
			expect(scenario.render).toBe((selectRenders[modulePath] as { default: unknown }).default);
			expect(loaded.find((item) => item.id === scenario.id)?.render).toBe(
				SELECT_EXAMPLES.find((item) => item.id === scenario.id)?.render,
			);
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			expect(scenario.code).not.toContain("@cloudflare/kumo");
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/select");
			expect(scenario.code).toContain("import {");
			expect(scenario.code).toContain("Select");
			expect(scenario.code).toContain("SelectContent");
			expect(scenario.code).toContain("SelectItem");
			expect(scenario.code).toContain("SelectTrigger");
			expect(scenario.code).toContain("SelectValue");
			expect(scenario.code).toContain('className="w-48"');
		}
		expect(SELECT_EXAMPLES[0]?.code).toContain('aria-label="Version"');
		expect(SELECT_EXAMPLES[0]?.code).toContain('placeholder="Select version"');
		expect(SELECT_EXAMPLES[0]?.code).toContain('value="1"');
		expect(SELECT_EXAMPLES[0]?.code).toContain("v1");
		expect(SELECT_EXAMPLES[0]?.code).toContain('value="2"');
		expect(SELECT_EXAMPLES[0]?.code).toContain("v2");
		expect(SELECT_EXAMPLES[0]?.code).not.toContain("disabled");
		expect(SELECT_EXAMPLES[1]?.code).toContain('aria-label="Empty select"');
		expect(SELECT_EXAMPLES[1]?.code).toContain('placeholder="Choose…"');
		expect(SELECT_EXAMPLES[1]?.code).toContain('value="a"');
		expect(SELECT_EXAMPLES[1]?.code).toContain("Alpha");
		expect(SELECT_EXAMPLES[1]?.code).not.toContain("disabled");
		expect(SELECT_EXAMPLES[2]?.code).toContain('aria-label="Disabled option"');
		expect(SELECT_EXAMPLES[2]?.code).toContain('placeholder="Choose…"');
		expect(SELECT_EXAMPLES[2]?.code).toContain('value="a"');
		expect(SELECT_EXAMPLES[2]?.code).toContain("Alpha");
		expect(SELECT_EXAMPLES[2]?.code).toContain('value="b"');
		expect(SELECT_EXAMPLES[2]?.code).toContain("Beta");
		expect(SELECT_EXAMPLES[2]?.code).toContain("disabled");
	});
});

describe("module scenario loader", () => {
	it("extracts canonical keys from glob paths", () => {
		expect(moduleFileKey("./examples/button/variants.tsx")).toBe("variants");
		expect(moduleFileKey("./variants.tsx?raw")).toBe("variants");
		expect(moduleFileKey(".\\examples\\button\\variants.tsx")).toBe("variants");
	});

	it("normalizes only the raw query and path separators", () => {
		expect(normalizeModulePath("./variants.tsx?raw")).toBe("./variants.tsx");
		expect(normalizeModulePath("./variants.tsx?foo")).toBe("./variants.tsx?foo");
		expect(normalizeModulePath("./variants.tsx?raw&lang")).toBe("./variants.tsx?raw&lang");
		expect(normalizeModulePath(".\\examples\\button\\variants.tsx")).toBe(
			"./examples/button/variants.tsx",
		);
		expect(() => moduleFileKey("./variants.tsx?foo")).toThrow(
			/illegal path \.\/variants\.tsx\?foo/,
		);
	});

	it("pairs render and raw that differ only by ?raw or separators", () => {
		const fromRawQuery = loadModuleScenarios({
			...validInput(),
			sourceModules: {
				"./variants.tsx?raw": "export default function Sample() { return null }",
			},
		});
		expect(fromRawQuery).toHaveLength(1);
		expect(fromRawQuery[0].id).toBe("button-variants");
		const fromSeparators = loadModuleScenarios({
			...validInput(),
			renderModules: { ".\\variants.tsx": { default: Sample } },
		});
		expect(fromSeparators).toHaveLength(1);
		expect(fromSeparators[0].render).toBe(Sample);
	});

	it("rejects the same basename in different directories", () => {
		expect(() =>
			loadModuleScenarios({
				slug: "button",
				metas: [{ key: "variants", title: "Variants" }],
				renderModules: { "./render/variants.tsx": { default: Sample } },
				sourceModules: {
					"./source/variants.tsx?raw": "export default function Sample() { return null }",
				},
			}),
		).toThrow(
			/render\/raw path mismatch for key "variants": render \.\/render\/variants\.tsx vs raw \.\/source\/variants\.tsx\?raw/,
		);
	});

	it("rejects missing raw source", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				sourceModules: {},
			}),
		).toThrow(/missing raw source for key "variants" at \.\/variants\.tsx/);
	});

	it("rejects missing render", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				renderModules: {},
			}),
		).toThrow(/missing render for key "variants" \(raw at \.\/variants\.tsx\)/);
	});

	it("rejects render and raw file set mismatch", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				renderModules: {
					"./variants.tsx": { default: Sample },
					"./sizes.tsx": { default: Sample },
				},
				sourceModules: {
					"./variants.tsx": "export default function Sample() { return null }",
				},
			}),
		).toThrow(/render\/raw file sets differ[\s\S]*sizes \(\.\/sizes\.tsx\)/);
	});

	it("rejects orphan modules outside metadata", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				renderModules: {
					"./variants.tsx": { default: Sample },
					"./sizes.tsx": { default: Sample },
				},
				sourceModules: {
					"./variants.tsx": "export default function Sample() { return null }",
					"./sizes.tsx": "export default function Sizes() { return null }",
				},
			}),
		).toThrow(/orphan module "sizes" at \.\/sizes\.tsx/);
	});

	it("rejects duplicate metadata keys", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				metas: [
					{ key: "variants", title: "Variants" },
					{ key: "variants", title: "Again" },
				],
			}),
		).toThrow(/duplicate metadata key "variants"/);
	});

	it("rejects illegal metadata keys", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				metas: [{ key: "Variants", title: "Variants" }],
			}),
		).toThrow(/illegal metadata key "Variants"/);
	});

	it("rejects illegal file keys", () => {
		expect(() =>
			loadModuleScenarios({
				slug: "button",
				metas: [{ key: "variants", title: "Variants" }],
				renderModules: { "./Variants.tsx": { default: Sample } },
				sourceModules: { "./Variants.tsx": "export default function Sample() { return null }" },
			}),
		).toThrow(/illegal render key "Variants" at \.\/Variants\.tsx/);
	});

	it("rejects a missing default export", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				renderModules: { "./variants.tsx": {} },
			}),
		).toThrow(/invalid default export for key "variants" at \.\/variants\.tsx/);
	});

	it("rejects a non-component default export", () => {
		expect(() =>
			loadModuleScenarios({
				...validInput(),
				renderModules: { "./variants.tsx": { default: "ButtonVariants" } },
			}),
		).toThrow(/invalid default export for key "variants" at \.\/variants\.tsx/);
	});
});
