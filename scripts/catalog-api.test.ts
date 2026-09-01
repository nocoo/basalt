import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	CATALOG_API_TARGETS,
	catalogApiShardRelativePath,
	checkCatalogApiFile,
	checkCatalogApiFiles,
	DEFAULT_TSCONFIG,
	GENERATE_COMMAND,
	GENERATED_RELATIVE_PATH,
	GENERATED_SHARD_DIR,
	generateCatalogApi,
	generateCatalogApiFiles,
	renderCatalogApiModule,
	renderCatalogApiShard,
	writeCatalogApiFile,
	writeCatalogApiFiles,
} from "./catalog-api";

const repoRoot = process.cwd();
const fixtureRoots: string[] = [];

afterEach(() => {
	while (fixtureRoots.length > 0) {
		const root = fixtureRoots.pop();
		if (root) {
			rmSync(root, { recursive: true, force: true });
		}
	}
});

function fixture(
	files: Record<string, string>,
	options?: { compilerOptions?: Record<string, unknown> },
): string {
	const root = mkdtempSync(path.join(tmpdir(), "catalog-api-"));
	fixtureRoots.push(root);
	writeFileSync(
		path.join(root, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				strict: true,
				target: "ES2022",
				module: "ESNext",
				moduleResolution: "bundler",
				jsx: "react-jsx",
				skipLibCheck: true,
				noEmit: true,
				...options?.compilerOptions,
			},
			include: ["./**/*.ts", "./**/*.tsx"],
		}),
	);
	for (const [relative, content] of Object.entries(files)) {
		const absolute = path.join(root, relative);
		mkdirSync(path.dirname(absolute), { recursive: true });
		writeFileSync(absolute, content);
	}
	return root;
}

function generateFixture(root: string, sourceFile = "widget.ts", slug = "widget") {
	return generateCatalogApi({
		repoRoot: root,
		tsconfigPath: "tsconfig.json",
		targets: [{ slug, sourceFile, propsType: "WidgetProps", surface: "Widget" }],
	});
}

function fixtureProps(root: string, sourceFile = "widget.ts", slug = "widget") {
	return generateFixture(root, sourceFile, slug)[slug]?.[0]?.props;
}

function generateProductionProps() {
	const generated = generateCatalogApi({
		repoRoot,
		tsconfigPath: DEFAULT_TSCONFIG,
		targets: CATALOG_API_TARGETS,
	});
	const separatelyAssertedMultiSurfaceSlugs = new Set(["input-group", "select"]);
	return Object.fromEntries(
		Object.entries(generated)
			.filter(([slug]) => !separatelyAssertedMultiSurfaceSlugs.has(slug))
			.map(([slug, surfaces]) => {
				expect(surfaces.length, slug).toBeGreaterThan(0);
				return [slug, surfaces[0]?.props ?? []];
			}),
	);
}

describe("catalog API generator contract", () => {
	it("imports compiler API from typescript-api and keeps official typescript at 7.0.2", () => {
		const source = readFileSync("scripts/catalog-api.ts", "utf8");
		const cli = readFileSync("scripts/catalog-api-cli.ts", "utf8");
		const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
			devDependencies: Record<string, string>;
			scripts: Record<string, string>;
		};
		expect(source).toContain('from "typescript-api"');
		expect(source).not.toMatch(/from ["']typescript["']/);
		expect(cli).not.toMatch(/from ["']typescript["']/);
		expect(pkg.devDependencies.typescript).toBe("7.0.2");
		expect(pkg.devDependencies["typescript-api"]).toBe("npm:typescript@5.9.3");
		expect(pkg.scripts["catalog-api:generate"]).toBe("bun scripts/catalog-api-cli.ts generate");
		expect(pkg.scripts["catalog-api:check"]).toBe("bun scripts/catalog-api-cli.ts check");
		expect(pkg.scripts.typecheck.startsWith("bun run catalog-api:check &&")).toBe(true);
		expect(pkg.scripts.build.startsWith("bun run catalog-api:check &&")).toBe(true);
		expect(pkg.scripts.build).not.toContain("catalog-api:generate");
		expect(pkg.scripts.typecheck).not.toContain("catalog-api:generate");
	});

	it("declares catalog targets without a per-component prop allowlist", () => {
		expect(CATALOG_API_TARGETS).toEqual([
			{
				slug: "button",
				sourceFile: "packages/basalt/src/components/button.tsx",
				propsType: "ButtonProps",
				surface: "Button",
			},
			{
				slug: "link-button",
				sourceFile: "packages/basalt/src/components/button.tsx",
				propsType: "LinkButtonProps",
				surface: "LinkButton",
			},
			{
				slug: "text",
				sourceFile: "packages/basalt/src/components/text.tsx",
				propsType: "TextProps",
				surface: "Text",
			},
			{
				slug: "label",
				sourceFile: "packages/basalt/src/components/label.tsx",
				propsType: "LabelProps",
				surface: "Label",
			},
			{
				slug: "separator",
				sourceFile: "packages/basalt/src/components/separator.tsx",
				propsType: "SeparatorProps",
				surface: "Separator",
			},
			{
				slug: "scroll-area",
				sourceFile: "packages/basalt/src/components/scroll-area.tsx",
				propsType: "ScrollAreaProps",
				surface: "ScrollArea",
			},
			{
				slug: "link",
				sourceFile: "packages/basalt/src/components/link.tsx",
				propsType: "LinkProps",
				surface: "Link",
			},
			{
				slug: "tooltip",
				sourceFile: "packages/basalt/src/components/tooltip.tsx",
				propsType: "TooltipProps",
				surface: "Tooltip",
			},
			{
				slug: "theme-toggle",
				sourceFile: "packages/basalt/src/components/theme-toggle.tsx",
				propsType: "ThemeToggleProps",
				surface: "ThemeToggle",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardProps",
				surface: "LayerCard",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Primary",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Secondary",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Header",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Body",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Footer",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardLoadingProps",
				surface: "LayerCard.Loading",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardEmptyProps",
				surface: "LayerCard.Empty",
			},
			{
				slug: "basalt-mark",
				sourceFile: "packages/basalt/src/components/basalt-mark.tsx",
				propsType: "BasaltMarkProps",
				surface: "BasaltMark",
			},
			{
				slug: "field",
				sourceFile: "packages/basalt/src/components/field.tsx",
				propsType: "FieldProps",
				surface: "Field",
			},
			{
				slug: "input",
				sourceFile: "packages/basalt/src/components/input.tsx",
				propsType: "InputProps",
				surface: "Input",
			},
			{
				slug: "input-area",
				sourceFile: "packages/basalt/src/components/input-area.tsx",
				propsType: "InputAreaProps",
				surface: "InputArea",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupProps",
				surface: "InputGroup",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupInputProps",
				surface: "InputGroup.Input",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupAddonProps",
				surface: "InputGroup.Addon",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupButtonProps",
				surface: "InputGroup.Button",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupSuffixProps",
				surface: "InputGroup.Suffix",
				allowEmpty: true,
			},
			{
				slug: "sensitive-input",
				sourceFile: "packages/basalt/src/components/sensitive-input.tsx",
				propsType: "SensitiveInputProps",
				surface: "SensitiveInput",
			},
			{
				slug: "checkbox",
				sourceFile: "packages/basalt/src/components/checkbox.tsx",
				propsType: "CheckboxProps",
				surface: "Checkbox",
			},
			{
				slug: "radio",
				sourceFile: "packages/basalt/src/components/radio.tsx",
				propsType: "RadioProps",
				surface: "Radio",
			},
			{
				slug: "switch",
				sourceFile: "packages/basalt/src/components/switch.tsx",
				propsType: "SwitchProps",
				surface: "Switch",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectProps",
				surface: "Select",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectTriggerProps",
				surface: "SelectTrigger",
				allowEmpty: true,
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectValueProps",
				surface: "SelectValue",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectContentProps",
				surface: "SelectContent",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectGroupProps",
				surface: "SelectGroup",
				allowEmpty: true,
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectItemProps",
				surface: "SelectItem",
			},
			{
				slug: "segment-control",
				sourceFile: "packages/basalt/src/components/segment-control.tsx",
				propsType: "SegmentControlProps",
				surface: "SegmentControl",
			},
			{
				slug: "page-header",
				sourceFile: "packages/basalt/src/components/page-header.tsx",
				propsType: "PageHeaderProps",
				surface: "PageHeader",
			},
		]);
		expect(CATALOG_API_TARGETS).toHaveLength(38);
		expect(
			CATALOG_API_TARGETS.filter((target) => target.allowEmpty === true).map(
				(target) => target.surface,
			),
		).toEqual([
			"LayerCard.Primary",
			"LayerCard.Secondary",
			"LayerCard.Header",
			"LayerCard.Body",
			"LayerCard.Footer",
			"InputGroup.Suffix",
			"SelectTrigger",
			"SelectGroup",
		]);
		const source = readFileSync("scripts/catalog-api.ts", "utf8");
		expect(source).not.toMatch(/allowlist|propNames/);
		expect(source).not.toMatch(/Cloudflare|Kumo|Workers?\b/);
		expect(source).not.toMatch(/\bif\s*\([^)]*InputGroup|\bswitch\s*\([^)]*input-group/);
		expect(source).not.toMatch(/\bif\s*\([^)]*SensitiveInput|\bswitch\s*\([^)]*sensitive-input/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Checkbox|\bswitch\s*\([^)]*checkbox/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Radio|\bswitch\s*\([^)]*radio/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Switch|\bswitch\s*\([^)]*switch/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Select|\bswitch\s*\([^)]*select/);
		expect(source).not.toMatch(/\bif\s*\([^)]*ScrollArea|\bswitch\s*\([^)]*scroll-area/);
		expect(source).not.toMatch(/\bif\s*\([^)]*SegmentControl|\bswitch\s*\([^)]*segment-control/);
		expect(source).not.toMatch(/\bif\s*\([^)]*PageHeader|\bswitch\s*\([^)]*page-header/);
	});

	it("extracts Button props from ButtonProps in source order with CVA literals and null", () => {
		const generated = generateProductionProps();
		expect(Object.keys(generated)).toEqual([
			"button",
			"link-button",
			"text",
			"label",
			"separator",
			"scroll-area",
			"link",
			"tooltip",
			"theme-toggle",
			"layer-card",
			"basalt-mark",
			"field",
			"input",
			"input-area",
			"sensitive-input",
			"checkbox",
			"radio",
			"switch",
			"segment-control",
			"page-header",
		]);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated.button).toEqual([
			{
				name: "variant",
				type: '"default" | "destructive" | "ghost" | "link" | "outline" | "secondary" | null',
				required: false,
			},
			{
				name: "size",
				type: '"default" | "icon" | "lg" | "sm" | null',
				required: false,
			},
			{
				name: "asChild",
				type: "boolean",
				required: false,
			},
			{
				name: "loading",
				type: "boolean",
				required: false,
			},
			{
				name: "icon",
				type: "React.ReactNode",
				required: false,
			},
		]);
	}, 20_000);

	it("extracts ScrollArea props without inherited Radix, DOM, event, or ARIA inventory", () => {
		const generated = generateProductionProps();
		expect(generated["scroll-area"]).toEqual([
			{
				name: "className",
				type: "string",
				required: false,
				description: "Classes applied to the non-scrolling root.",
			},
			{
				name: "orientation",
				type: "ScrollAreaOrientation",
				required: false,
				default: '"vertical"',
				description: "Axes that may scroll.",
			},
			{
				name: "viewportClassName",
				type: "string",
				required: false,
				description: "Classes applied to the actual scrolling viewport.",
			},
		]);
		for (const inherited of [
			"children",
			"onScroll",
			"tabIndex",
			"role",
			"aria-label",
			"id",
			"type",
			"scrollHideDelay",
		]) {
			expect(
				generated["scroll-area"]?.some((prop) => prop.name === inherited),
				inherited,
			).toBe(false);
		}
	}, 20_000);

	it("extracts LinkButton props from the same file without Button-only or DOM fields", () => {
		const generated = generateProductionProps();
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated["link-button"]).toEqual([
			{
				name: "variant",
				type: '"default" | "destructive" | "ghost" | "link" | "outline" | "secondary" | null',
				required: false,
			},
			{
				name: "size",
				type: '"default" | "icon" | "lg" | "sm" | null',
				required: false,
			},
			{
				name: "icon",
				type: "React.ReactNode",
				required: false,
			},
		]);
		expect(generated["link-button"]?.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated["link-button"]?.some((prop) => prop.name === "loading")).toBe(false);
		expect(generated["link-button"]?.some((prop) => prop.name === "href")).toBe(false);
		expect(generated["link-button"]?.some((prop) => prop.name === "className")).toBe(false);
	}, 20_000);

	it("extracts Text props from TextProps without HTML or Kumo-only fields", () => {
		const generated = generateProductionProps();
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.text).toEqual([
			{
				name: "size",
				type: '"lg" | "md" | "sm" | "xl" | "xs" | null',
				required: false,
			},
			{
				name: "tone",
				type: '"default" | "muted" | null',
				required: false,
			},
		]);
		expect(generated.text?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.text?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.text?.some((prop) => prop.name === "as")).toBe(false);
		expect(generated.text?.some((prop) => prop.name === "bold")).toBe(false);
		expect(generated.text?.some((prop) => prop.name === "truncate")).toBe(false);
	}, 20_000);

	it("extracts Label props from LabelProps with JSDoc defaults and descriptions", () => {
		const generated = generateProductionProps();
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.label).toEqual([
			{
				name: "showOptional",
				type: "boolean",
				required: false,
				default: "false",
				description: "Show gray (optional) after the label.",
			},
			{
				name: "tooltip",
				type: "React.ReactNode",
				required: false,
				description: "Info icon with hover text.",
			},
		]);
		expect(generated.label?.some((prop) => prop.name === "htmlFor")).toBe(false);
		expect(generated.label?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.label?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.label?.some((prop) => prop.name === "asContent")).toBe(false);
	}, 20_000);

	it("extracts Separator props from SeparatorProps with JSDoc defaults and descriptions", () => {
		const generated = generateProductionProps();
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.separator).toEqual([
			{
				name: "orientation",
				type: '"horizontal" | "vertical"',
				required: false,
				default: "horizontal",
				description: "The orientation of the separator.",
			},
			{
				name: "decorative",
				type: "boolean",
				required: false,
				default: "true",
				description: "Whether the separator is purely decorative.",
			},
		]);
		expect(generated.separator?.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated.separator?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.separator?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.separator?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
	}, 20_000);

	it("extracts Link props from LinkProps as a single required href", () => {
		const generated = generateProductionProps();
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.link).toEqual([
			{
				name: "href",
				type: "string",
				required: true,
				description: "The link destination.",
			},
		]);
		expect(generated.link?.[0]).not.toHaveProperty("default");
		expect(generated.link?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "target")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "rel")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "download")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "style")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "onClick")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
	}, 20_000);

	it("extracts Tooltip props from TooltipProps as a single optional delayDuration", () => {
		const generated = generateProductionProps();
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(generated.tooltip).toEqual([
			{
				name: "delayDuration",
				type: "number",
				required: false,
				default: "700",
				description: "Delay before the tooltip opens, in milliseconds.",
			},
		]);
		expect(generated.tooltip?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "open")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "defaultOpen")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "onOpenChange")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "disableHoverableContent")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "skipDelayDuration")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "side")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "align")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "sideOffset")).toBe(false);
		expect(generated.tooltip?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
	}, 20_000);

	it("extracts ThemeToggle props from ThemeToggleProps as a single required aria-label", () => {
		const generated = generateProductionProps();
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual(["aria-label"]);
		expect(generated["theme-toggle"]).toEqual([
			{
				name: "aria-label",
				type: "string",
				required: true,
				description: "Accessible name for the toggle.",
			},
		]);
		expect(generated["theme-toggle"]?.[0]).not.toHaveProperty("default");
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "type")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "variant")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "size")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "loading")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "icon")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual(["delayDuration"]);
	}, 20_000);

	it("extracts LayerCard root props from LayerCardProps", () => {
		const generated = generateProductionProps();
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual(["className", "padding"]);
		expect(generated["layer-card"]).toEqual([
			{
				name: "className",
				type: "string",
				required: false,
				description: "Additional classes for the card root.",
			},
			{
				name: "padding",
				type: '"lg" | "md" | "none" | "sm"',
				required: false,
				default: '"none"',
				description: "Inner spacing for unstructured card content.",
			},
		]);
		expect(generated["layer-card"]?.[0]).not.toHaveProperty("default");
		expect(generated["layer-card"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "style")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "role")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "onClick")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "data-kind")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual(["aria-label"]);
	}, 20_000);

	it("extracts BasaltMark props from BasaltMarkProps as a single optional className", () => {
		const generated = generateProductionProps();
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
		expect(generated["basalt-mark"]).toEqual([
			{
				name: "className",
				type: "string",
				required: false,
				description: "Additional classes for the mark.",
			},
		]);
		expect(generated["basalt-mark"]?.[0]).not.toHaveProperty("default");
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "style")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "role")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "onClick")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "strokeWidth")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "absoluteStrokeWidth")).toBe(
			false,
		);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual(["aria-label"]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual(["className", "padding"]);
	}, 20_000);

	it("extracts Field props from FieldProps in source order with required label and children", () => {
		const generated = generateProductionProps();
		expect(generated.field?.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"className",
			"children",
		]);
		expect(generated.field).toEqual([
			{
				name: "label",
				type: "string",
				required: true,
				description: "Visible label text.",
			},
			{
				name: "htmlFor",
				type: "string",
				required: false,
				description: "Associates the label and described-by ids.",
			},
			{
				name: "hint",
				type: "string",
				required: false,
				description: "Supporting text when there is no error.",
			},
			{
				name: "error",
				type: "string",
				required: false,
				description: "Replaces the hint and marks the control invalid.",
			},
			{
				name: "className",
				type: "string",
				required: false,
				description: "Additional classes for the field root.",
			},
			{
				name: "children",
				type: "React.ReactNode",
				required: true,
				description: "The control or content to render.",
			},
		]);
		expect(generated.field?.every((prop) => !("default" in prop))).toBe(true);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual(["aria-label"]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual(["className", "padding"]);
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
	}, 20_000);

	it("extracts Input props from InputProps as a single optional type", () => {
		const generated = generateProductionProps();
		expect(generated.input?.map((prop) => prop.name)).toEqual(["type"]);
		expect(generated.input).toEqual([
			{
				name: "type",
				type: "React.HTMLInputTypeAttribute",
				required: false,
				description: "The type of input control to render.",
			},
		]);
		expect(generated.input?.[0]).not.toHaveProperty("default");
		expect(generated.input?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "name")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "value")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "defaultValue")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "placeholder")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "disabled")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "required")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "onChange")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual(["aria-label"]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual(["className", "padding"]);
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
		expect(generated.field?.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"className",
			"children",
		]);
	}, 20_000);

	it("extracts InputArea props from InputAreaProps as a single optional rows", () => {
		const generated = generateProductionProps();
		expect(generated["input-area"]?.map((prop) => prop.name)).toEqual(["rows"]);
		expect(generated["input-area"]).toEqual([
			{
				name: "rows",
				type: "number",
				required: false,
				description: "The visible text row count.",
			},
		]);
		expect(generated["input-area"]?.[0]).not.toHaveProperty("default");
		expect(generated["input-area"]?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "name")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "value")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "defaultValue")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "placeholder")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "disabled")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "required")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "onChange")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual(["aria-label"]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual(["className", "padding"]);
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
		expect(generated.field?.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"className",
			"children",
		]);
		expect(generated.input?.map((prop) => prop.name)).toEqual(["type"]);
	}, 20_000);

	it("emits a locally quoted property name", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	"aria-label": string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "aria-label", type: "string", required: true }]);
	});

	it("filters DOM, event, ARIA, and className inheritance", () => {
		const root = fixture({
			"dom.ts": `export interface Dom {
	className?: string;
	onClick?: () => void;
	"aria-label"?: string;
}
`,
			"widget.ts": `import type { Dom } from "./dom";
export interface WidgetProps extends Dom {
	tone?: "a" | "b";
}
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "tone", type: '"a" | "b"', required: false }]);
	});

	it("sorts props by source declaration position, not name", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	zebra?: boolean;
	alpha?: boolean;
}
`,
		});
		expect(fixtureProps(root)?.map((prop) => prop.name)).toEqual(["zebra", "alpha"]);
	});

	it("strips top-level undefined and keeps null", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	value?: string | null | undefined;
	label: string | undefined;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "value", type: "string | null", required: false },
			{ name: "label", type: "string", required: true },
		]);
	});

	it("strips top-level undefined from required and optional Maybe aliases", () => {
		const root = fixture({
			"widget.ts": `type Maybe = string | undefined;
export interface WidgetProps {
	required: Maybe;
	optional?: Maybe;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "required", type: "string", required: true },
			{ name: "optional", type: "string", required: false },
		]);
	});

	it("copies available JSDoc onto generated props", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/** Enables the spinner. */
	loading?: boolean;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{
				name: "loading",
				type: "boolean",
				required: false,
				description: "Enables the spinner.",
			},
		]);
	});

	it("reads a single non-empty JSDoc default without mixing other tags into description", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/**
	 * Enables the spinner.
	 * @see https://example.test/spinner
	 * @example true
	 * @default false
	 */
	loading?: boolean;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{
				name: "loading",
				type: "boolean",
				required: false,
				default: "false",
				description: "Enables the spinner.",
			},
		]);
	});

	it("fails closed on an empty JSDoc default", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/**
	 * Count.
	 * @default
	 */
	count?: number;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/empty @default for count/);
	});

	it("fails closed on duplicate JSDoc defaults", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/**
	 * Count.
	 * @default 0
	 * @default 1
	 */
	count?: number;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/duplicate @default for count/);
	});

	it("fails when the tsconfig is missing", () => {
		expect(() =>
			generateCatalogApi({
				repoRoot: fixture({ "widget.ts": "export interface WidgetProps { a?: boolean }" }),
				tsconfigPath: "missing.json",
				targets: [
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "Widget" },
				],
			}),
		).toThrow(/missing tsconfig missing.json/);
	});

	it("fails when the source file is missing", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{ slug: "widget", sourceFile: "missing.ts", propsType: "WidgetProps", surface: "Widget" },
				],
			}),
		).toThrow(/missing source missing.ts/);
	});

	it("fails when the public props type is missing", () => {
		const root = fixture({
			"widget.ts": "export interface OtherProps { a?: boolean }",
		});
		expect(() => generateFixture(root)).toThrow(/missing type WidgetProps/);
	});

	it("fails on TypeScript diagnostics", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	broken: NotAType;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/TypeScript diagnostics/);
	});

	it("keeps one explicit public surface per production target", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(
			Object.fromEntries(
				Object.entries(generated).map(([slug, surfaces]) => [
					slug,
					surfaces.map((surface) => surface.name),
				]),
			),
		).toEqual({
			button: ["Button"],
			"link-button": ["LinkButton"],
			text: ["Text"],
			label: ["Label"],
			separator: ["Separator"],
			"scroll-area": ["ScrollArea"],
			link: ["Link"],
			tooltip: ["Tooltip"],
			"theme-toggle": ["ThemeToggle"],
			"layer-card": [
				"LayerCard",
				"LayerCard.Primary",
				"LayerCard.Secondary",
				"LayerCard.Header",
				"LayerCard.Body",
				"LayerCard.Footer",
				"LayerCard.Loading",
				"LayerCard.Empty",
			],
			"basalt-mark": ["BasaltMark"],
			field: ["Field"],
			input: ["Input"],
			"input-area": ["InputArea"],
			"input-group": [
				"InputGroup",
				"InputGroup.Input",
				"InputGroup.Addon",
				"InputGroup.Button",
				"InputGroup.Suffix",
			],
			"sensitive-input": ["SensitiveInput"],
			checkbox: ["Checkbox"],
			radio: ["Radio"],
			switch: ["Switch"],
			"segment-control": ["SegmentControl"],
			"page-header": ["PageHeader"],
			select: [
				"Select",
				"SelectTrigger",
				"SelectValue",
				"SelectContent",
				"SelectGroup",
				"SelectItem",
			],
		});
	}, 20_000);

	it("extracts five InputGroup surfaces with wrapper defaults and an empty Suffix", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(Object.keys(generated)).toHaveLength(22);
		expect(generated["input-group"]).toEqual([
			{
				name: "InputGroup",
				props: [
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable the input and nested actions.",
					},
				],
			},
			{
				name: "InputGroup.Input",
				props: [
					{
						name: "type",
						type: "React.HTMLInputTypeAttribute",
						required: false,
						description: "The type of input control to render.",
					},
				],
			},
			{
				name: "InputGroup.Addon",
				props: [
					{
						name: "align",
						type: '"end" | "start"',
						required: false,
						default: "start",
						description: "Place the addon at the start or end of the group.",
					},
				],
			},
			{
				name: "InputGroup.Button",
				props: [
					{
						name: "variant",
						type: '"default" | "destructive" | "ghost" | "link" | "outline" | "secondary" | null',
						required: false,
						default: "ghost",
						description: "Visual style for the nested action.",
					},
					{
						name: "size",
						type: '"default" | "icon" | "lg" | "sm" | null',
						required: false,
						default: "icon",
						description: "Size for the nested action.",
					},
					{
						name: "asChild",
						type: "boolean",
						required: false,
						default: "false",
						description: "Render the nested action through its child element.",
					},
					{
						name: "loading",
						type: "boolean",
						required: false,
						default: "false",
						description: "Show a spinner and disable the nested action.",
					},
					{
						name: "icon",
						type: "React.ReactNode",
						required: false,
						description: "Icon rendered before the nested action label.",
					},
				],
			},
			{
				name: "InputGroup.Suffix",
				props: [],
			},
		]);
		expect(generated["input-group"]?.[2]?.props[0]?.type).not.toContain("className");
		expect(
			generated["input-group"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "children"),
			),
		).toBe(false);
		expect(
			generated["input-group"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "className"),
			),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
	}, 20_000);

	it("extracts SensitiveInput props from SensitiveInputProps as required reveal and hide labels", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(Object.keys(generated)).toHaveLength(22);
		expect(generated["sensitive-input"]).toEqual([
			{
				name: "SensitiveInput",
				props: [
					{
						name: "revealLabel",
						type: "string",
						required: true,
						description: "Accessible label for the reveal action.",
					},
					{
						name: "hideLabel",
						type: "string",
						required: true,
						description: "Accessible label for the hide action.",
					},
				],
			},
		]);
		expect(generated["sensitive-input"]?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated["sensitive-input"]?.[0]?.props[1]).not.toHaveProperty("default");
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "type"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "aria-label"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "value"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultValue"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "name"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "autoComplete"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "required"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "disabled"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "className"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "children"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "ref"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "onChange"),
			),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.input?.[0]?.props.map((prop) => prop.name)).toEqual(["type"]);
		expect(generated["input-area"]?.[0]?.props.map((prop) => prop.name)).toEqual(["rows"]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 20_000);

	it("extracts Checkbox props from CheckboxProps as an optional checked union", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(Object.keys(generated)).toHaveLength(22);
		expect(generated.checkbox).toEqual([
			{
				name: "Checkbox",
				props: [
					{
						name: "checked",
						type: '"indeterminate" | boolean',
						required: false,
						description: "The controlled checked state of the checkbox.",
					},
				],
			},
		]);
		expect(generated.checkbox?.[0]?.props[0]).not.toHaveProperty("default");
		expect(
			generated.checkbox?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultChecked"),
			),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) =>
				surface.props.some((prop) => prop.name === "onCheckedChange"),
			),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "disabled")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "required")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "name")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "value")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "form")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "asChild")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) =>
				surface.props.some((prop) => prop.name === "className"),
			),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "children")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) => surface.props.some((prop) => prop.name === "ref")),
		).toBe(false);
		expect(
			generated.checkbox?.some((surface) =>
				surface.props.some((prop) => prop.name === "aria-label"),
			),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated["sensitive-input"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"revealLabel",
			"hideLabel",
		]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 20_000);

	it("extracts Radio props from RadioProps as a required string value", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(Object.keys(generated)).toHaveLength(22);
		expect(generated.radio).toEqual([
			{
				name: "Radio",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value associated with the radio item.",
					},
				],
			},
		]);
		expect(generated.radio?.[0]?.props[0]).not.toHaveProperty("default");
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "disabled")),
		).toBe(false);
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "required")),
		).toBe(false);
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "form")),
		).toBe(false);
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "asChild")),
		).toBe(false);
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "className")),
		).toBe(false);
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "children")),
		).toBe(false);
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "ref")),
		).toBe(false);
		expect(
			generated.radio?.some((surface) => surface.props.some((prop) => prop.name === "aria-label")),
		).toBe(false);
		expect(generated.radio).toHaveLength(1);
		expect(generated.radio?.[0]?.props).toHaveLength(1);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked"]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 20_000);

	it("extracts Switch props from SwitchProps as optional checked and size", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(Object.keys(generated)).toHaveLength(22);
		expect(generated.switch).toEqual([
			{
				name: "Switch",
				props: [
					{
						name: "checked",
						type: "boolean",
						required: false,
						description: "The controlled checked state of the switch.",
					},
					{
						name: "size",
						type: '"default" | "sm"',
						required: false,
						default: "default",
						description: "The visual size of the switch.",
					},
				],
			},
		]);
		expect(generated.switch?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated.switch).toHaveLength(1);
		expect(generated.switch?.[0]?.props).toHaveLength(2);
		expect(
			generated.switch?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultChecked"),
			),
		).toBe(false);
		expect(
			generated.switch?.some((surface) =>
				surface.props.some((prop) => prop.name === "onCheckedChange"),
			),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "disabled")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "required")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "name")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "value")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "form")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "asChild")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "className")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "children")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "ref")),
		).toBe(false);
		expect(
			generated.switch?.some((surface) => surface.props.some((prop) => prop.name === "aria-label")),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.radio?.[0]?.props.map((prop) => prop.name)).toEqual(["value"]);
		expect(generated.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked"]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 20_000);

	it("extracts Select props from six named types as five local rows and two empty surfaces", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(Object.keys(generated)).toHaveLength(22);
		expect(generated.select).toEqual([
			{
				name: "Select",
				props: [
					{
						name: "value",
						type: "string",
						required: false,
						description: "The controlled value of the select.",
					},
				],
			},
			{
				name: "SelectTrigger",
				props: [],
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
				props: [],
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
		]);
		expect(generated.select).toHaveLength(6);
		expect(generated.select?.map((surface) => surface.name)).toEqual([
			"Select",
			"SelectTrigger",
			"SelectValue",
			"SelectContent",
			"SelectGroup",
			"SelectItem",
		]);
		expect(generated.select?.[0]?.props).toHaveLength(1);
		expect(generated.select?.[1]?.props).toEqual([]);
		expect(generated.select?.[2]?.props).toHaveLength(1);
		expect(generated.select?.[3]?.props).toHaveLength(2);
		expect(generated.select?.[4]?.props).toEqual([]);
		expect(generated.select?.[5]?.props).toHaveLength(1);
		expect(generated.select?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated.select?.[2]?.props[0]).not.toHaveProperty("default");
		expect(generated.select?.[5]?.props[0]).not.toHaveProperty("default");
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultValue"),
			),
		).toBe(false);
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "onValueChange"),
			),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "open")),
		).toBe(false);
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultOpen"),
			),
		).toBe(false);
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "onOpenChange"),
			),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "disabled")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "name")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "required")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "form")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "children")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "className")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "ref")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "aria-label")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "textValue")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "side")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "align")),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.switch?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(generated.radio?.[0]?.props.map((prop) => prop.name)).toEqual(["value"]);
		expect(generated.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked"]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 20_000);

	it("extracts the controlled SegmentControl surface without inherited fieldset props", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(generated["segment-control"]).toEqual([
			{
				name: "SegmentControl",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The currently selected value.",
					},
					{
						name: "onValueChange",
						type: "(value: string) => void",
						required: true,
						description: "Called when the user selects a different segment.",
					},
					{
						name: "legend",
						type: "React.ReactNode",
						required: true,
						description: "The visible legend that names the control.",
					},
					{
						name: "options",
						type: "SegmentControlOption[]",
						required: true,
						description: "The selectable segments shown after the optional All segment.",
					},
					{
						name: "allOption",
						type: "SegmentControlAllOption",
						required: false,
						description: "Add a leading unfiltered segment, labelled All by default.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable every segment.",
					},
				],
			},
		]);
		expect(generated["segment-control"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"defaultValue",
		);
		expect(generated["segment-control"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"children",
		);
	}, 20_000);

	it("extracts the PageHeader surface without inherited header props", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(generated["page-header"]).toEqual([
			{
				name: "PageHeader",
				props: [
					{
						name: "title",
						type: "React.ReactNode",
						required: true,
						description: "The page title, rendered as the only heading.",
					},
					{
						name: "description",
						type: "React.ReactNode",
						required: false,
						description: "Supporting text below the title.",
					},
					{
						name: "eyebrow",
						type: "React.ReactNode",
						required: false,
						description: "A short label above the title.",
					},
					{
						name: "breadcrumbs",
						type: "PageHeaderBreadcrumb[]",
						required: false,
						description: "Trail of parent pages.",
					},
					{
						name: "actions",
						type: "React.ReactNode",
						required: false,
						description: "Actions aligned beside the title on wide screens.",
					},
				],
			},
		]);
		expect(generated["page-header"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"className",
		);
		expect(generated["page-header"]?.[0]?.props.map((prop) => prop.name)).not.toContain("children");
	}, 20_000);

	it("aggregates multiple surfaces for the same slug in declaration order", () => {
		const root = fixture({
			"root.ts": "export interface RootProps { open?: boolean }",
			"item.ts": "export interface ItemProps { value?: string }",
		});
		const generated = generateCatalogApi({
			repoRoot: root,
			tsconfigPath: "tsconfig.json",
			targets: [
				{ slug: "widget", sourceFile: "item.ts", propsType: "ItemProps", surface: "Item" },
				{ slug: "widget", sourceFile: "root.ts", propsType: "RootProps", surface: "Root" },
			],
		});
		expect(generated.widget?.map((surface) => surface.name)).toEqual(["Item", "Root"]);
		expect(generated.widget?.[0]?.props).toEqual([
			{ name: "value", type: "string", required: false },
		]);
		expect(generated.widget?.[1]?.props).toEqual([
			{ name: "open", type: "boolean", required: false },
		]);
	});

	it("reuses different source files and props types for one slug", () => {
		const root = fixture({
			"alpha.ts": "export interface AlphaProps { a?: number }",
			"beta.ts": "export interface BetaProps { b?: boolean }",
		});
		const generated = generateCatalogApi({
			repoRoot: root,
			tsconfigPath: "tsconfig.json",
			targets: [
				{ slug: "combo", sourceFile: "alpha.ts", propsType: "AlphaProps", surface: "Alpha" },
				{ slug: "combo", sourceFile: "beta.ts", propsType: "BetaProps", surface: "Beta" },
			],
		});
		expect(generated.combo).toEqual([
			{ name: "Alpha", props: [{ name: "a", type: "number", required: false }] },
			{ name: "Beta", props: [{ name: "b", type: "boolean", required: false }] },
		]);
	});

	it("fails on duplicate surfaces for the same slug", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "Widget" },
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "Widget" },
				],
			}),
		).toThrow(/duplicate surface Widget for widget/);
	});

	it("fails when a target omits the surface name", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "" },
				],
			}),
		).toThrow(/missing surface for widget/);
	});

	it("emits an empty surface only when allowEmpty is declared", () => {
		const root = fixture({
			"dom.ts": "export interface Dom { className?: string }",
			"widget.ts": `import type { Dom } from "./dom";
export interface WidgetProps extends Dom {}
`,
		});
		expect(
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{
						slug: "widget",
						sourceFile: "widget.ts",
						propsType: "WidgetProps",
						surface: "Widget",
						allowEmpty: true,
					},
				],
			}).widget,
		).toEqual([{ name: "Widget", props: [] }]);
	});

	it("fails when allowEmpty is declared but local props exist", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{
						slug: "widget",
						sourceFile: "widget.ts",
						propsType: "WidgetProps",
						surface: "Widget",
						allowEmpty: true,
					},
				],
			}),
		).toThrow(/allowEmpty expired for widget surface Widget/);
	});

	it("fails on an empty component-specific result", () => {
		const root = fixture({
			"dom.ts": "export interface Dom { className?: string }",
			"widget.ts": `import type { Dom } from "./dom";
export interface WidgetProps extends Dom {}
`,
		});
		expect(() => generateFixture(root)).toThrow(/empty result for widget/);
	});

	it("fails when a local prop impersonates a cross-file prop", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
export interface WidgetProps extends Other {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("emits a local className after omitting it from a foreign DOM-like type", () => {
		const root = fixture({
			"dom.ts": `export interface Dom {
	className?: string;
	id?: string;
}
`,
			"widget.ts": `import type { Dom } from "./dom";
export type WidgetProps = Omit<Dom, "className"> & {
	className?: string;
};
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "className", type: "string", required: false }]);
	});

	it("still rejects a local className that impersonates a foreign DOM-like prop", () => {
		const root = fixture({
			"dom.ts": "export interface Dom { className?: string }",
			"widget.ts": `import type { Dom } from "./dom";
export type WidgetProps = Dom & {
	className?: string;
};
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: className/);
	});

	it("rejects a private WidgetProps type", () => {
		const root = fixture({
			"widget.ts": `export interface OtherStuff { x?: boolean }
interface WidgetProps { a?: boolean }
`,
		});
		expect(() => generateFixture(root)).toThrow(/not exported type WidgetProps/);
	});

	it("accepts a type exported only through an export list", () => {
		const root = fixture({
			"widget.ts": `interface WidgetProps {
	tone?: "a" | "b";
}
export type { WidgetProps };
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "tone", type: '"a" | "b"', required: false }]);
	});

	it("preserves nested generic arguments on aliases", () => {
		const root = fixture({
			"widget.ts": `export type Box<T> = { value: T };
export interface WidgetProps {
	box?: Box<string>;
	nested?: Box<Box<string>>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "Box<string>", required: false },
			{ name: "nested", type: "Box<Box<string>>", required: false },
		]);
	});

	it("pierces local aliases when detecting cross-file impersonation", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type LocalOther = Other;
export interface WidgetProps extends LocalOther {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("pierces multilayer interface aliases when detecting impersonation", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
interface Mid extends Other {}
interface Top extends Mid {}
export interface WidgetProps extends Top {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("accepts a renamed local export", () => {
		const root = fixture({
			"widget.ts": `interface Inner {
	tone?: "a" | "b";
}
export type { Inner as WidgetProps };
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "tone", type: '"a" | "b"', required: false }]);
	});

	it("rejects an external re-export of the props type", () => {
		const root = fixture({
			"other.ts": "export interface WidgetProps { value?: string }",
			"widget.ts": `export type { WidgetProps } from "./other";
`,
		});
		expect(() => generateFixture(root)).toThrow(/not declared in/);
	});

	it("keeps explicit type arguments that match parameter defaults", () => {
		const root = fixture({
			"widget.ts": `export type Defaulted<T = string> = { value: T };
export interface WidgetProps {
	explicit?: Defaulted<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "explicit", type: "Defaulted<string>", required: false },
		]);
	});

	it("keeps nested undefined and null inside generic arguments", () => {
		const root = fixture({
			"widget.ts": `export type Box<T> = { value: T };
export interface WidgetProps {
	maybe?: Box<string | undefined>;
	nullable?: Box<string | null>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "maybe", type: "Box<string | undefined>", required: false },
			{ name: "nullable", type: "Box<string | null>", required: false },
		]);
	});

	it("keeps nested undefined inside React generics with a React prefix", () => {
		const root = fixture(
			{
				"widget.ts": `import type { ReactElement } from "react";
export interface WidgetProps {
	el?: ReactElement<string | undefined>;
}
`,
			},
			{
				compilerOptions: {
					baseUrl: ".",
					paths: {
						react: [path.join(repoRoot, "node_modules/@types/react")],
					},
				},
			},
		);
		expect(fixtureProps(root)).toEqual([
			{
				name: "el",
				type: "React.ReactElement<string | undefined>",
				required: false,
			},
		]);
	});

	it("qualifies namespace imports of same-named exported aliases", () => {
		const root = fixture({
			"a.ts": "export type Box<T> = { a: T };\n",
			"b.ts": "export type Box<T> = { b: T };\n",
			"widget.ts": `import type * as A from "./a";
import type * as B from "./b";
export interface WidgetProps {
	box?: A.Box<string> | B.Box<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "A.Box<string> | B.Box<string>", required: false },
		]);
	});

	it("qualifies same-named local namespaces in a union", () => {
		const root = fixture({
			"widget.ts": `export namespace A {
	export type Box<T> = { a: T };
}
export namespace B {
	export type Box<T> = { b: T };
}
export interface WidgetProps {
	box?: A.Box<string> | B.Box<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "A.Box<string> | B.Box<string>", required: false },
		]);
	});

	it("rejects impersonation through identity generic aliases", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Identity<T> = T;
export interface WidgetProps extends Identity<Identity<Other>> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through layered generic aliases", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Identity<T> = T;
type Layer<T> = Identity<T>;
export interface WidgetProps extends Layer<Other> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through a local union alias", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Mix = Other | { localOnly?: boolean };
export type WidgetProps = Mix & { value?: string };
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through a tuple-index alias", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type First<T> = [T][0];
export interface WidgetProps extends First<Other> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through a mixed type-query generic", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
const local = { localOnly: true };
type Pair<Left, Right> = Left;
export interface WidgetProps extends Pair<Other, typeof local> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("instantiates Holder generic field types without treating value-type members as heritage", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Holder<T> = { data?: T };
export interface WidgetProps extends Holder<Other> {
	value?: string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "data", type: "Other", required: false },
			{ name: "value", type: "string", required: false },
		]);
	});

	it("instantiates List generic array elements without heritage impersonation", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type List<T> = { items?: T[] };
export interface WidgetProps extends List<Other> {
	value?: string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "items", type: "Other[]", required: false },
			{ name: "value", type: "string", required: false },
		]);
	});

	it("keeps named import aliases for generic props", () => {
		const root = fixture({
			"box.ts": "export type Box<T> = { a: T };\n",
			"widget.ts": `import type { Box as RenamedBox } from "./box";
export interface WidgetProps {
	box?: RenamedBox<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "RenamedBox<string>", required: false },
		]);
	});

	it("distinguishes renamed named imports of same-named aliases in a union", () => {
		const root = fixture({
			"a.ts": "export type Box<T> = { a: T };\n",
			"b.ts": "export type Box<T> = { b: T };\n",
			"widget.ts": `import type { Box as ABox } from "./a";
import type { Box as BBox } from "./b";
export interface WidgetProps {
	box?: ABox<string> | BBox<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "ABox<string> | BBox<string>", required: false },
		]);
	});

	it("rejects impersonation through an external mapped type", () => {
		const root = fixture({
			"other.ts": `export type Other = { [K in "value"]?: string };\n`,
			"widget.ts": `import type { Other } from "./other";
export interface WidgetProps extends Other {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through an external Record type", () => {
		const root = fixture({
			"other.ts": `export type Other = Record<"value", string>;\n`,
			"widget.ts": `import type { Other } from "./other";
export interface WidgetProps extends Other {
	value: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("emits local mapped heritage properties in declaration order", () => {
		const root = fixture({
			"widget.ts": `type Mapped = { [K in "mapped"]?: string };
export interface WidgetProps extends Mapped {
	value?: string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "mapped", type: "string", required: false },
			{ name: "value", type: "string", required: false },
		]);
	});

	it("emits local Record heritage properties in declaration order", () => {
		const root = fixture({
			"widget.ts": `type Mapped = Record<"mapped", string>;
export interface WidgetProps extends Mapped {
	value?: string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "mapped", type: "string", required: true },
			{ name: "value", type: "string", required: false },
		]);
	});

	it("fails closed when a synthetic heritage property has unresolved provenance", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps extends Record<"mapped", string> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/unresolved provenance for mapped/);
	});

	it("keeps a user Array alias and prints built-in arrays as brackets", () => {
		const root = fixture({
			"other.ts": "export interface Other { nested?: boolean }\n",
			"widget.ts": `import type { Other } from "./other";
type Array<T> = { custom: T };
type List<T> = { items?: T[] };
export interface WidgetProps extends List<Other> {
	values?: Array<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "items", type: "Other[]", required: false },
			{ name: "values", type: "Array<string>", required: false },
		]);
	});

	it("canonicalizes a renamed React element import", () => {
		const root = fixture(
			{
				"widget.ts": `import type { ReactElement as ElementAlias } from "react";
export interface WidgetProps {
	el?: ElementAlias<string | undefined>;
}
`,
			},
			{
				compilerOptions: {
					baseUrl: ".",
					paths: {
						react: [path.join(repoRoot, "node_modules/@types/react")],
					},
				},
			},
		);
		expect(fixtureProps(root)).toEqual([
			{
				name: "el",
				type: "React.ReactElement<string | undefined>",
				required: false,
			},
		]);
	});

	it("canonicalizes a React namespace element import", () => {
		const root = fixture(
			{
				"widget.ts": `import type * as R from "react";
export interface WidgetProps {
	el?: R.ReactElement<string | undefined>;
}
`,
			},
			{
				compilerOptions: {
					baseUrl: ".",
					paths: {
						react: [path.join(repoRoot, "node_modules/@types/react")],
					},
				},
			},
		);
		expect(fixtureProps(root)).toEqual([
			{
				name: "el",
				type: "React.ReactElement<string | undefined>",
				required: false,
			},
		]);
	});

	it("rejects impersonation through an external generic mapped type", () => {
		const root = fixture({
			"other.ts": `export type Other<T> = { [K in "value"]?: T };\n`,
			"widget.ts": `import type { Other } from "./other";
export interface WidgetProps extends Other<string> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation from a user file whose name resembles a default library", () => {
		const root = fixture({
			"lib.eswidgets.d.ts": `export type Other<T> = { [K in "value"]?: T };\n`,
			"widget.ts": `import type { Other } from "./lib.eswidgets";
export interface WidgetProps extends Other<string> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through an external generic Record type", () => {
		const root = fixture({
			"other.ts": `export type Other<K extends string> = Record<K, string>;\n`,
			"widget.ts": `import type { Other } from "./other";
export interface WidgetProps extends Other<"value"> {
	value: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through an external mapped intersection alias", () => {
		const root = fixture({
			"other.ts": `export type Other = { [K in "value"]?: string } & { extra?: boolean };\n`,
			"widget.ts": `import type { Other } from "./other";
export interface WidgetProps extends Other {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through an external mapped union alias", () => {
		const root = fixture({
			"other.ts": `export type Other = { [K in "value"]?: string } | { extra?: boolean };\n`,
			"widget.ts": `import type { Other } from "./other";
export type WidgetProps = Other & { value?: string };
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("canonicalizes a React JSX element namespace import", () => {
		const root = fixture(
			{
				"widget.ts": `import type * as R from "react";
export interface WidgetProps {
	el?: R.JSX.Element;
}
`,
			},
			{
				compilerOptions: {
					baseUrl: ".",
					paths: {
						react: [path.join(repoRoot, "node_modules/@types/react")],
					},
				},
			},
		);
		expect(fixtureProps(root)).toEqual([
			{ name: "el", type: "React.JSX.Element", required: false },
		]);
	});

	it("canonicalizes a renamed React JSX namespace import", () => {
		const root = fixture(
			{
				"widget.ts": `import type { JSX as J } from "react";
export interface WidgetProps {
	el?: J.Element;
}
`,
			},
			{
				compilerOptions: {
					baseUrl: ".",
					paths: {
						react: [path.join(repoRoot, "node_modules/@types/react")],
					},
				},
			},
		);
		expect(fixtureProps(root)).toEqual([
			{ name: "el", type: "React.JSX.Element", required: false },
		]);
	});

	it("prints an explicit true false union as boolean", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	flag?: true | false;
}
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "flag", type: "boolean", required: false }]);
	});

	it("does not treat @types/reactive as the React package", () => {
		const root = fixture({
			"node_modules/@types/reactive/package.json":
				'{ "name": "@types/reactive", "version": "1.0.0", "types": "index.d.ts" }\n',
			"node_modules/@types/reactive/index.d.ts": "export type Vessel<T> = { cargo: T };\n",
			"widget.ts": `import type { Vessel } from "reactive";
export interface WidgetProps {
	vessel?: Vessel<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "vessel", type: "Vessel<string>", required: false },
		]);
	});

	it("renders deterministic modules and rejects missing or stale artifacts", () => {
		const data = {
			button: [
				{
					name: "Button",
					props: [
						{
							name: "variant",
							type: '"default" | null',
							required: false,
						},
					],
				},
			],
		};
		const first = renderCatalogApiModule(data);
		const second = renderCatalogApiModule(data);
		expect(first).toBe(second);
		expect(first.startsWith("// Generated by scripts/catalog-api.ts. Do not edit.\n")).toBe(true);
		expect(first).toContain('from "./catalog-api/button"');
		expect(first).toContain("\tbutton: buttonApi,");
		expect(first).not.toContain('name: "Button"');
		const shard = renderCatalogApiShard(data.button ?? []);
		expect(shard).toContain('name: "Button"');
		expect(shard).toContain('name: "variant"');
		expect(shard).toContain("\t\tprops: [");
		const withDefault = renderCatalogApiShard([
			{
				name: "Button",
				props: [
					{
						name: "loading",
						type: "boolean",
						required: false,
						default: "false",
						description: "Enables the spinner.",
					},
				],
			},
		]);
		expect(withDefault).toContain("\t\t\t\tname: ");
		expect(withDefault.indexOf("\t\t\t\tname:")).toBeLessThan(withDefault.indexOf("\t\t\t\ttype:"));
		expect(withDefault.indexOf("\t\t\t\ttype:")).toBeLessThan(
			withDefault.indexOf("\t\t\t\trequired:"),
		);
		expect(withDefault.indexOf("\t\t\t\trequired:")).toBeLessThan(
			withDefault.indexOf("\t\t\t\tdefault:"),
		);
		expect(withDefault.indexOf("\t\t\t\tdefault:")).toBeLessThan(
			withDefault.indexOf("\t\t\t\tdescription:"),
		);
		expect(renderCatalogApiShard([{ name: "Empty", props: [] }])).toContain("\t\tprops: [],");
		const root = fixture({});
		const filePath = path.join(root, GENERATED_RELATIVE_PATH);
		expect(() => checkCatalogApiFile(filePath, first)).toThrow(
			new RegExp(`missing catalog API at ${filePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
		);
		expect(() => checkCatalogApiFile(filePath, first)).toThrow(GENERATE_COMMAND);
		writeCatalogApiFile(filePath, `${first} `);
		expect(() => checkCatalogApiFile(filePath, first)).toThrow(/stale catalog API/);
		expect(() => checkCatalogApiFile(filePath, first)).toThrow(GENERATE_COMMAND);
		writeCatalogApiFile(filePath, first);
		expect(() => checkCatalogApiFile(filePath, first)).not.toThrow();
	});

	it("produces the same complete API set on a second generation", () => {
		const first = generateCatalogApiFiles(repoRoot);
		const second = generateCatalogApiFiles(repoRoot);
		expect(first).toEqual(second);
		const slugs = Object.keys(first)
			.filter((relative) => relative.startsWith(`${GENERATED_SHARD_DIR}/`))
			.map((relative) => path.basename(relative, ".ts"))
			.sort();
		expect(slugs).toHaveLength(22);
		expect(Object.keys(first)).toHaveLength(23);
		expect(first[GENERATED_RELATIVE_PATH]).toContain('from "./catalog-api/button"');
		expect(first[GENERATED_RELATIVE_PATH]).not.toContain('name: "Button"');
		const joined = slugs.map((slug) => first[catalogApiShardRelativePath(slug)] ?? "").join("\n");
		expect(joined).toContain('"variant"');
		expect(joined).toContain("| null");
		expect(joined).toContain('name: "Button"');
		expect(joined).toContain('name: "InputArea"');
		expect(joined).toContain('name: "InputGroup.Button"');
		expect(joined).toContain('name: "InputGroup.Suffix"');
		expect(joined).toContain('name: "LayerCard.Loading"');
		expect(joined).toContain('name: "LayerCard.Empty"');
		expect(joined).toContain('name: "ScrollArea"');
		expect(joined).toContain('name: "SegmentControl"');
		expect(joined).toContain('name: "PageHeader"');
		expect(joined).toContain('name: "SensitiveInput"');
		expect(joined).toContain('name: "Checkbox"');
		expect(joined).toContain('name: "Radio"');
		expect(joined).toContain('name: "Switch"');
		expect(joined).toContain('name: "Select"');
		expect(joined).toContain('name: "SelectTrigger"');
		expect(joined).toContain('name: "SelectValue"');
		expect(joined).toContain('name: "SelectContent"');
		expect(joined).toContain('name: "SelectGroup"');
		expect(joined).toContain('name: "SelectItem"');
		const digest = createHash("sha256");
		for (const relative of Object.keys(first).sort()) {
			digest.update(relative);
			digest.update("\n");
			digest.update(first[relative] ?? "");
		}
		expect(digest.digest("hex")).toBe(
			"fc52b241844dea088752e8a08b075e20cf7d0617979389fbe163bf0abe854a00",
		);
	}, 20_000);

	it("checks the complete generated API set and rejects extra shards", () => {
		const root = fixture({});
		const files = generateCatalogApiFiles(repoRoot);
		expect(() => checkCatalogApiFiles(root, files)).toThrow(/missing catalog API/);
		writeCatalogApiFiles(root, files);
		expect(() => checkCatalogApiFiles(root, files)).not.toThrow();
		writeFileSync(path.join(root, GENERATED_SHARD_DIR, "extra.ts"), "export const API = [];\n");
		expect(() => checkCatalogApiFiles(root, files)).toThrow(/extra catalog API shards extra.ts/);
	}, 20_000);
});
