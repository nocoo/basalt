import { describe, expect, it } from "vitest";
import foundation from "./catalog-content/families/foundation";
import { BASALT_MARK_EXAMPLES } from "./examples/basalt-mark";
import { BUTTON_EXAMPLES } from "./examples/button";
import { LABEL_EXAMPLES } from "./examples/label";
import { LAYER_CARD_EXAMPLES } from "./examples/layer-card";
import { LINK_EXAMPLES } from "./examples/link";
import { LINK_BUTTON_EXAMPLES } from "./examples/link-button";
import { SCROLL_AREA_EXAMPLES } from "./examples/scroll-area";
import { SEPARATOR_EXAMPLES } from "./examples/separator";
import { TEXT_EXAMPLES } from "./examples/text";
import { THEME_TOGGLE_EXAMPLES } from "./examples/theme-toggle";
import { API as basaltMarkApi } from "./generated/catalog-api/basalt-mark";
import { API as buttonApi } from "./generated/catalog-api/button";
import { API as labelApi } from "./generated/catalog-api/label";
import { API as layerCardApi } from "./generated/catalog-api/layer-card";
import { API as linkApi } from "./generated/catalog-api/link";
import { API as linkButtonApi } from "./generated/catalog-api/link-button";
import { API as scrollAreaApi } from "./generated/catalog-api/scroll-area";
import { API as separatorApi } from "./generated/catalog-api/separator";
import { API as textApi } from "./generated/catalog-api/text";
import { API as themeToggleApi } from "./generated/catalog-api/theme-toggle";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const FOUNDATION_SLUGS = [
	"button",
	"link-button",
	"text",
	"label",
	"separator",
	"scroll-area",
	"link",
	"theme-toggle",
	"layer-card",
	"basalt-mark",
	"theme-provider",
	"link-provider",
] as const;

describe("foundation catalog content family", () => {
	it("owns exactly twelve foundation slugs", () => {
		expect(Object.keys(foundation)).toEqual([...FOUNDATION_SLUGS]);
		expect(Object.keys(foundation)).toHaveLength(12);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "foundation")
				.map(([slug]) => slug)
				.sort(),
		).toEqual([...FOUNDATION_SLUGS].sort());
	});

	it("keeps source-backed example owners and generated API shards by reference", () => {
		expect(foundation.button?.examples).toBe(BUTTON_EXAMPLES);
		expect(foundation["link-button"]?.examples).toBe(LINK_BUTTON_EXAMPLES);
		expect(foundation.text?.examples).toBe(TEXT_EXAMPLES);
		expect(foundation.text?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "text-sizes", title: "Sizes" },
			{ id: "text-muted-tone", title: "Muted tone" },
			{ id: "text-semantic-variants", title: "Semantic variants" },
			{ id: "text-bold-and-truncate", title: "Bold and truncate" },
		]);
		expect(foundation.label?.examples).toBe(LABEL_EXAMPLES);
		expect(foundation.separator?.examples).toBe(SEPARATOR_EXAMPLES);
		expect(foundation["scroll-area"]?.examples).toBe(SCROLL_AREA_EXAMPLES);
		expect(foundation.link?.examples).toBe(LINK_EXAMPLES);
		expect(foundation["theme-toggle"]?.examples).toBe(THEME_TOGGLE_EXAMPLES);
		expect(foundation["layer-card"]?.examples).toBe(LAYER_CARD_EXAMPLES);
		expect(foundation["basalt-mark"]?.examples).toBe(BASALT_MARK_EXAMPLES);
		expect(foundation.button?.docs.api).toBe(buttonApi);
		expect(foundation["link-button"]?.docs.api).toBe(linkButtonApi);
		expect(foundation.text?.docs.api).toBe(textApi);
		expect(foundation.label?.docs.api).toBe(labelApi);
		expect(foundation.separator?.docs.api).toBe(separatorApi);
		expect(foundation["scroll-area"]?.docs.api).toBe(scrollAreaApi);
		expect(foundation.link?.docs.api).toBe(linkApi);
		expect(foundation["theme-toggle"]?.docs.api).toBe(themeToggleApi);
		expect(foundation["layer-card"]?.docs.api).toBe(layerCardApi);
		expect(foundation["basalt-mark"]?.docs.api).toBe(basaltMarkApi);
	});

	it("preserves docs truth and scenario identity for every foundation slug", () => {
		expect(foundation.button?.docs.description).toBe(
			"Primary actions, including loading and icon slots.",
		);
		expect(foundation.button?.docs.usage).toContain(
			'import { Button } from "@nocoo/basalt/components/button";',
		);
		expect(foundation.button?.docs.variants).toEqual([
			"default",
			"secondary",
			"destructive",
			"outline",
			"ghost",
			"link",
		]);
		expect(foundation.button?.docs.provenance).toEqual({
			owner: "nocoo",
			repo: "pew",
			ref: "97a890fabe6e",
			file: "packages/web/src/components/ui/button.tsx",
		});
		expect(foundation.button?.docs.implementationSource).toEqual({
			owner: "nocoo",
			repo: "basalt",
			ref: "main",
			file: "packages/basalt/src/components/button.tsx",
		});
		expect(foundation.button?.examples.map((example) => example.id)).toEqual(
			BUTTON_EXAMPLES.map((example) => example.id),
		);
		expect(foundation.button?.examples.map((example) => example.title)).toEqual(
			BUTTON_EXAMPLES.map((example) => example.title),
		);
		expect(foundation.button?.examples.map((example) => example.code)).toEqual(
			BUTTON_EXAMPLES.map((example) => example.code),
		);
		expect(foundation.button?.examples.map((example) => example.render)).toEqual(
			BUTTON_EXAMPLES.map((example) => example.render),
		);
		expect(foundation["layer-card"]?.docs.description).toBe(
			"A layered or structured card shell with consistent spacing, sections, loading, and empty states.",
		);
		expect(foundation["layer-card"]?.docs.variants).toEqual(["none", "sm", "md", "lg"]);
		expect(foundation["layer-card"]?.docs.api).toBe(layerCardApi);
		expect(foundation["layer-card"]?.examples.map((example) => example.id)).toEqual([
			"layer-card-basic-card",
			"layer-card-surface-style-card",
			"layer-card-multiple-cards",
			"layer-card-structured-card",
			"layer-card-loading-empty",
		]);
		expect(foundation["scroll-area"]?.docs).toMatchObject({
			description:
				"A keyboard-accessible viewport for vertically, horizontally, or bidirectionally overflowing content.",
			variants: ["vertical", "horizontal", "both"],
			provenance: {
				owner: "nocoo",
				repo: "noheir",
				ref: "4835e80997fc",
				file: "src/components/ui/scroll-area.tsx",
			},
			implementationSource: {
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: "packages/basalt/src/components/scroll-area.tsx",
			},
		});
		expect(foundation["scroll-area"]?.docs.usage).toContain(
			'import { ScrollArea } from "@nocoo/basalt/components/scroll-area";',
		);
		expect(foundation["scroll-area"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "scroll-area-vertical-list", title: "Vertical list" },
			{ id: "scroll-area-horizontal-row", title: "Horizontal row" },
		]);
		for (const example of foundation["scroll-area"]?.examples ?? []) {
			expect(example.code).toContain("@nocoo/basalt/components/scroll-area");
			expect(example.code).toContain("export default function");
			expect(example.render).toBeTypeOf("function");
		}
		expect(foundation["theme-provider"]?.examples).toHaveLength(1);
		expect(foundation["theme-provider"]?.examples[0]).toMatchObject({
			id: "theme-provider-default",
			title: "Default",
			code: "<ThemeProvider>{children}</ThemeProvider>",
		});
		expect(foundation["theme-provider"]?.docs.api).toEqual([
			{ name: "ThemeProvider", props: [{ name: "children", type: "ReactNode" }] },
		]);
		expect(foundation["link-provider"]?.examples).toHaveLength(1);
		expect(foundation["link-provider"]?.examples[0]).toMatchObject({
			id: "link-provider-default",
			title: "Default",
			code: "<LinkProvider><Link href='#section'>Link</Link></LinkProvider>",
		});
		expect(foundation["link-provider"]?.docs.implementationSource.file).toBe(
			"packages/basalt/src/providers/link.tsx",
		);
		expect(foundation.text?.docs).toMatchObject({
			description:
				"Polymorphic typography whose visual variant is independent of the document outline.",
			variants: ["body", "heading", "mono"],
			provenance: {
				owner: "cloudflare",
				repo: "kumo",
				ref: "1159868dfe32",
				file: "packages/kumo/src/components/text/text.tsx",
			},
			implementationSource: {
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: "packages/basalt/src/components/text.tsx",
			},
		});
		expect(foundation.text?.docs.usage).toContain('as="h1"');
		expect(
			FOUNDATION_SLUGS.reduce((count, slug) => count + (foundation[slug]?.examples.length ?? 0), 0),
		).toBe(34);
		for (const slug of FOUNDATION_SLUGS) {
			const content = foundation[slug];
			expect(content?.docs.description.length, slug).toBeGreaterThan(0);
			expect(content?.examples[0], slug).toBeDefined();
			for (const example of content?.examples ?? []) {
				expect(example.id.startsWith(`${slug}-`), example.id).toBe(true);
			}
		}
	});
});
