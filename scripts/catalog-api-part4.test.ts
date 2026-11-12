import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import * as tsApi from "typescript-api";
import { describe, expect, it } from "vitest";
import {
	catalogApiShardRelativePath,
	checkCatalogApiFile,
	checkCatalogApiFiles,
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
import {
	fixture,
	fixtureProps,
	generateFixture,
	generateProductionApi,
	repoRoot,
} from "./catalog-api-test-helpers";
import { DOCUMENTED_NATIVE_ONLY_SURFACES } from "./catalog-surface-owners";

const ts = (tsApi as unknown as { default?: typeof tsApi }).default ?? tsApi;

describe("catalog API generator contract 4/4", () => {
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

	it("preserves global DOM types without React qualification while qualifying React types", () => {
		const root = fixture(
			{
				"widget.ts": `import type * as React from "react";
export interface WidgetProps {
	node?: React.ReactNode;
	handler?: React.MouseEventHandler<HTMLButtonElement>;
	container?: DocumentFragment | Element | null;
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
				name: "node",
				type: "React.ReactNode",
				required: false,
			},
			{
				name: "handler",
				type: "React.MouseEventHandler<HTMLButtonElement>",
				required: false,
			},
			{
				name: "container",
				type: "DocumentFragment | Element | null",
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
		const first = generateCatalogApiFiles(repoRoot, generateProductionApi());
		const second = generateCatalogApiFiles(repoRoot);
		expect(first).toEqual(second);
		const slugs = Object.keys(first)
			.filter((relative) => relative.startsWith(`${GENERATED_SHARD_DIR}/`))
			.map((relative) => path.basename(relative, ".ts"))
			.sort();
		expect(slugs).toHaveLength(120);
		expect(Object.keys(first)).toHaveLength(121);
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
		expect(joined).toContain('name: "SectionRule"');
		expect(joined).toContain('name: "StatStrip"');
		expect(joined).toContain('name: "ConfirmDialog"');
		expect(joined).toContain('name: "useConfirm"');
		expect(joined).toContain('name: "TablePager"');
		expect(joined).toContain('name: "Fab"');
		expect(joined).toContain('name: "Dock"');
		expect(joined).toContain('name: "DockBody"');
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
		expect(joined).toContain('name: "SelectLabel"');
		expect(joined).toContain('name: "Combobox"');
		expect(joined).toContain('name: "Autocomplete"');
		expect(joined).toContain('name: "DatePicker"');
		expect(joined).toContain('name: "Toolbar"');
		expect(joined).toContain('name: "Toolbar.Button"');
		expect(joined).toContain('name: "Tabs"');
		expect(joined).toContain('name: "TabsContent"');
		expect(joined).toContain('name: "SidebarItem"');
		expect(joined).toContain('name: "CommandPalette"');
		expect(joined).toContain('name: "SidebarProvider"');
		expect(joined).toContain('name: "Popover"');
		expect(joined).toContain('name: "DropdownMenu"');
		expect(joined).toContain('name: "Collapsible"');
		expect(joined).toContain('name: "Table"');
		expect(joined).toContain('name: "TableCaption"');
		expect(joined).toContain('name: "TableHead"');
		expect(joined).toContain('name: "TableCell"');
		expect(joined).toContain('name: "TableSortableHeader"');
		expect(joined).toContain('name: "DataTable"');
		expect(joined).toContain('name: "Pagination"');
		expect(joined).toContain('name: "TableOfContents"');
		expect(joined).toContain('name: "CodeHighlighted"');
		expect(joined).toContain('name: "CodeBlock"');
		expect(joined).toContain('type: "(row: T, index: number) => string"');
		expect(joined).toContain('name: "Flow"');
		expect(joined).toContain('name: "Grid"');
		expect(joined).toContain('name: "LineChart"');
		expect(joined).toContain('name: "DonutChart"');
		expect(joined).toContain('name: "StatCard"');
		expect(joined).toContain('name: "HeatmapCalendar"');
		expect(joined).toContain('name: "HeatmapCalendar.Year"');
		expect(joined).toContain('name: "SlotBarChart.Items"');
		expect(joined).toContain('name: "Timeline.Events"');
		expect(joined).toContain('name: "DateNavigation"');
		expect(joined).toContain('name: "DateNavigation.Display"');
		expect(joined).toContain('name: "StatGrid"');
		expect(joined).toContain('name: "ChartPalette"');
		expect(joined).toContain('name: "ResourceList"');
		expect(joined).toContain('name: "DeleteResource"');
		expect(joined).toContain('type: "ChartSeriesDescriptor[]"');
		expect(joined).toContain('name: "dismissLabel"');
		const digest = createHash("sha256");
		for (const relative of Object.keys(first).sort()) {
			digest.update(relative);
			digest.update("\n");
			digest.update(first[relative] ?? "");
		}
		expect(digest.digest("hex")).toBe(
			"b0c0ad54724e7d74bc7be33cb53f4f8febdd155d3452af6a03af1e53e548076b",
		);
	}, 60_000);

	it("checks the complete generated API set and rejects extra shards", () => {
		const root = fixture({});
		const files = generateCatalogApiFiles(repoRoot, generateProductionApi());
		expect(() => checkCatalogApiFiles(root, files)).toThrow(/missing catalog API/);
		writeCatalogApiFiles(root, files);
		expect(() => checkCatalogApiFiles(root, files)).not.toThrow();
		writeFileSync(path.join(root, GENERATED_SHARD_DIR, "extra.ts"), "export const API = [];\n");
		expect(() => checkCatalogApiFiles(root, files)).toThrow(/extra catalog API shards extra.ts/);
	}, 60_000);

	it("enforces documented justification and strategy for native-only className and empty surfaces", () => {
		const sampleClassNameData = (name: string) => ({
			widget: [
				{
					name,
					props: [
						{
							name: "className",
							type: "string",
							required: false,
						},
					],
				},
			],
		});
		const sampleEmptyData = (name: string) => ({
			widget: [
				{
					name,
					props: [],
				},
			],
		});

		// 1. Unknown native-only surface without entry fails
		expect(() =>
			generateCatalogApiFiles(repoRoot, sampleClassNameData("UnregisteredWidget")),
		).toThrow(
			/surface 'UnregisteredWidget' in 'widget' is className-only without valid justification/,
		);
		expect(() => generateCatalogApiFiles(repoRoot, sampleEmptyData("UnregisteredWidget"))).toThrow(
			/surface 'UnregisteredWidget' in 'widget' is empty without valid justification/,
		);

		// 2. Temporarily corrupted or blank justification fails
		const originalCode = DOCUMENTED_NATIVE_ONLY_SURFACES.Code;
		try {
			// Blank justification
			DOCUMENTED_NATIVE_ONLY_SURFACES.Code = {
				...originalCode,
				justification: "   ",
			};
			expect(() => generateCatalogApiFiles(repoRoot, sampleClassNameData("Code"))).toThrow(
				/surface 'Code' in 'widget' is className-only without valid justification/,
			);
			expect(() => generateCatalogApiFiles(repoRoot, sampleEmptyData("Code"))).toThrow(
				/surface 'Code' in 'widget' is empty without valid justification/,
			);

			// Blank inheritedElement
			DOCUMENTED_NATIVE_ONLY_SURFACES.Code = {
				...originalCode,
				inheritedElement: "   ",
			};
			expect(() => generateCatalogApiFiles(repoRoot, sampleClassNameData("Code"))).toThrow(
				/surface 'Code' in 'widget' is className-only without valid justification/,
			);
			expect(() => generateCatalogApiFiles(repoRoot, sampleEmptyData("Code"))).toThrow(
				/surface 'Code' in 'widget' is empty without valid justification/,
			);

			// Invalid boolean flag
			DOCUMENTED_NATIVE_ONLY_SURFACES.Code = {
				...originalCode,
				forwardsRef: undefined as unknown as boolean,
			};
			expect(() => generateCatalogApiFiles(repoRoot, sampleClassNameData("Code"))).toThrow(
				/surface 'Code' in 'widget' is className-only without valid justification/,
			);
			expect(() => generateCatalogApiFiles(repoRoot, sampleEmptyData("Code"))).toThrow(
				/surface 'Code' in 'widget' is empty without valid justification/,
			);

			// Deleted entry fails
			delete (DOCUMENTED_NATIVE_ONLY_SURFACES as Record<string, unknown>).Code;
			expect(() => generateCatalogApiFiles(repoRoot, sampleClassNameData("Code"))).toThrow(
				/surface 'Code' in 'widget' is className-only without valid justification/,
			);
			expect(() => generateCatalogApiFiles(repoRoot, sampleEmptyData("Code"))).toThrow(
				/surface 'Code' in 'widget' is empty without valid justification/,
			);
		} finally {
			DOCUMENTED_NATIVE_ONLY_SURFACES.Code = originalCode;
		}

		// 3. Valid registered entry succeeds for both className-only and empty props
		expect(() => generateCatalogApiFiles(repoRoot, sampleClassNameData("Code"))).not.toThrow();
		expect(() => generateCatalogApiFiles(repoRoot, sampleEmptyData("Code"))).not.toThrow();
		// Also verify a documented empty surface with false ref policy
		expect(() =>
			generateCatalogApiFiles(repoRoot, sampleEmptyData("LayerCard.Secondary")),
		).not.toThrow();
	});

	it("reliably encodes string values with exact syntax and semantic roundtrip", () => {
		const testCases = [
			"Ordinary description",
			'Use the "selected" option.\nKeep the second line.',
			String.raw`Use "path" C:\temp\file.`,
			'Use "selected" and don\'t drop\nline breaks.',
			'🎉 Emoji test: 🚀 and "quotes" with `backticks` and \n newlines',
			"Type with \"quotes\" and <Generics<string>> and 'single'",
			'{"key": "value", "escaped": "\\n"}',
		];

		for (const [index, description] of testCases.entries()) {
			const shardContent = renderCatalogApiShard([
				{
					name: `Surface${index}`,
					props: [
						{
							name: "prop",
							type: "string",
							required: false,
							default: description,
							description,
						},
					],
				},
			]);

			const sourceFile = ts.createSourceFile(
				`fixture-${index}.ts`,
				shardContent,
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.TS,
			);

			const parseDiagnostics =
				(sourceFile as unknown as { parseDiagnostics?: tsApi.Diagnostic[] }).parseDiagnostics ?? [];
			expect(parseDiagnostics).toHaveLength(0);

			let extractedDefault: string | undefined;
			let extractedDescription: string | undefined;

			const visit = (node: tsApi.Node) => {
				if (ts.isPropertyAssignment(node)) {
					const propName = node.name.getText(sourceFile);
					if (propName === "default" && ts.isStringLiteral(node.initializer)) {
						extractedDefault = node.initializer.text;
					} else if (propName === "description" && ts.isStringLiteral(node.initializer)) {
						extractedDescription = node.initializer.text;
					}
				}
				ts.forEachChild(node, visit);
			};

			visit(sourceFile);

			expect(extractedDefault).toBe(description);
			expect(extractedDescription).toBe(description);
		}
	});

	it("extracts and formats callable surfaces with signatures, parameters, and options", () => {
		const root = fixture({
			"callable-widget.ts": `
				export type SimpleOptions = {
					/** Option count */
					count?: number;
				};
				/** Root callable description */
				export function notify(
					message: string,
					options: SimpleOptions = {},
				): string {
					return message;
				}
				notify.dismiss = (id?: string): void => {};
			`,
			"callable-undefined-return.ts": `
				export type SimpleOptions = { count?: number };
				export function notify(message: string): string | undefined { return message; }
			`,
			"callable-undefined-param.ts": `
				export type SimpleOptions = { count?: number };
				export function notify(message: string, options: SimpleOptions | undefined): string { return message; }
			`,
			"callable-param-tag.ts": `
				export type SimpleOptions = { count?: number };
				function rawDismiss(id?: string): string { return id ?? ""; }
				/**
				 * Dismiss function
				 */
				export const notify = Object.assign(() => {}, {
					/**
					 * Dismiss function
					 * @param id Unique target identifier.
					 */
					dismiss: rawDismiss,
				});
			`,
		});

		const result = generateCatalogApi({
			repoRoot: root,
			tsconfigPath: "tsconfig.json",
			targets: [
				{
					slug: "notify",
					sourceFile: "callable-widget.ts",
					propsType: "SimpleOptions",
					surface: "Widget",
					callableExport: "notify",
				},
				{
					slug: "notify-undefined-return",
					sourceFile: "callable-undefined-return.ts",
					propsType: "SimpleOptions",
					surface: "Widget",
					callableExport: "notify",
				},
				{
					slug: "notify-undefined-param",
					sourceFile: "callable-undefined-param.ts",
					propsType: "SimpleOptions",
					surface: "Widget",
					callableExport: "notify",
				},
				{
					slug: "notify-param-tag",
					sourceFile: "callable-param-tag.ts",
					propsType: "SimpleOptions",
					surface: "Widget",
					callableExport: "notify",
				},
			],
		});

		const surfaces = result.notify;
		expect(surfaces).toBeDefined();
		expect(surfaces?.map((s) => s.name)).toEqual(["Widget", "notify", "notify.dismiss"]);

		const rootCall = surfaces?.find((s) => s.name === "notify");
		expect(rootCall?.callSignature).toBe(
			"notify(message: string, options?: SimpleOptions): string",
		);
		expect(rootCall?.description).toBe("Root callable description");
		expect(rootCall?.parameters).toEqual([
			{ name: "message", type: "string", required: true },
			{ name: "options", type: "SimpleOptions", required: false },
		]);
		expect(rootCall?.returns).toEqual({ type: "string" });
		expect(rootCall?.options?.name).toBe("SimpleOptions");
		expect(rootCall?.options?.props).toEqual([
			{ name: "count", type: "number", required: false, description: "Option count" },
		]);

		const dismissCall = surfaces?.find((s) => s.name === "notify.dismiss");
		expect(dismissCall?.callSignature).toBe("notify.dismiss(id?: string | undefined): void");
		expect(dismissCall?.parameters).toEqual([
			{ name: "id", type: "string | undefined", required: false },
		]);
		expect(dismissCall?.returns).toEqual({ type: "void" });
		expect(dismissCall?.options).toBeUndefined();

		// Freshness & fidelity regressions:
		// 1. Preserves declared undefined in return types without stripping it
		const undefinedReturnCall = result["notify-undefined-return"]?.find((s) => s.name === "notify");
		expect(undefinedReturnCall?.returns?.type).toBe("string | undefined");

		// 2. Preserves parameter type unions with undefined on required parameters
		const undefinedParamCall = result["notify-undefined-param"]?.find((s) => s.name === "notify");
		expect(undefinedParamCall?.parameters?.[1]?.type).toBe("SimpleOptions | undefined");
		expect(undefinedParamCall?.parameters?.[1]?.required).toBe(true);

		// 3. Fallback to @param tag documentation on member methods
		const taggedDismissCall = result["notify-param-tag"]?.find((s) => s.name === "notify.dismiss");
		expect(taggedDismissCall?.parameters?.[0]?.description).toBe("Unique target identifier.");

		// Negative check: missing callable export fails fast
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{
						slug: "notify",
						sourceFile: "callable-widget.ts",
						propsType: "SimpleOptions",
						surface: "Widget",
						callableExport: "nonExistentCallable",
					},
				],
			}),
		).toThrow(/callable export nonExistentCallable not found/);
	}, 30_000);
});
