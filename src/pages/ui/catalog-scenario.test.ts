import { describe, expect, it } from "vitest";
import {
	catalogScenarioId,
	catalogScenarioMatchesSlug,
	loadModuleScenarios,
	moduleFileKey,
	normalizeModulePath,
} from "./catalog-scenario";
import { UI_EXAMPLES } from "./demos";
import { BUTTON_EXAMPLES } from "./examples/button";
import { LABEL_EXAMPLES } from "./examples/label";
import { LINK_EXAMPLES } from "./examples/link";
import { LINK_BUTTON_EXAMPLES } from "./examples/link-button";
import { SEPARATOR_EXAMPLES } from "./examples/separator";
import { TEXT_EXAMPLES } from "./examples/text";
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

const TEXT_IDS = ["text-sizes", "text-muted-tone"] as const;
const TEXT_TITLES = ["Sizes", "Muted tone"] as const;

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
	it("loads two text scenarios from the same glob modules", () => {
		expect(Object.keys(textRenders)).toHaveLength(2);
		expect(Object.keys(textSources)).toHaveLength(2);
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
			expect(scenario.code).not.toMatch(/as=|<h[1-6]|Semantic HTML/i);
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
