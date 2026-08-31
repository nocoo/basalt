import { describe, expect, it } from "vitest";
import {
	catalogScenarioId,
	catalogScenarioMatchesSlug,
	loadModuleScenarios,
	moduleFileKey,
	normalizeModulePath,
} from "./catalog-scenario";
import { BUTTON_EXAMPLES } from "./examples/button";

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
