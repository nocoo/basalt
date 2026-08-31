import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	CATALOG_API_TARGETS,
	checkCatalogApiFile,
	DEFAULT_TSCONFIG,
	GENERATE_COMMAND,
	GENERATED_RELATIVE_PATH,
	generateCatalogApi,
	renderCatalogApiModule,
	writeCatalogApiFile,
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
		targets: [{ slug, sourceFile, propsType: "WidgetProps" }],
	});
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
			},
			{
				slug: "link-button",
				sourceFile: "packages/basalt/src/components/button.tsx",
				propsType: "LinkButtonProps",
			},
			{
				slug: "text",
				sourceFile: "packages/basalt/src/components/text.tsx",
				propsType: "TextProps",
			},
		]);
		const source = readFileSync("scripts/catalog-api.ts", "utf8");
		expect(source).not.toMatch(/allowlist|propNames|props:\s*\[/);
	});

	it("extracts Button props from ButtonProps in source order with CVA literals and null", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
		expect(Object.keys(generated)).toEqual(["button", "link-button", "text"]);
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

	it("extracts LinkButton props from the same file without Button-only or DOM fields", () => {
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
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
		const generated = generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		});
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
		expect(generateFixture(root).widget).toEqual([
			{ name: "tone", type: '"a" | "b"', required: false },
		]);
	});

	it("sorts props by source declaration position, not name", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	zebra?: boolean;
	alpha?: boolean;
}
`,
		});
		expect(generateFixture(root).widget?.map((prop) => prop.name)).toEqual(["zebra", "alpha"]);
	});

	it("strips top-level undefined and keeps null", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	value?: string | null | undefined;
	label: string | undefined;
}
`,
		});
		expect(generateFixture(root).widget).toEqual([
			{ name: "value", type: "string | null", required: false },
			{ name: "label", type: "string", required: true },
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
		expect(generateFixture(root).widget).toEqual([
			{
				name: "loading",
				type: "boolean",
				required: false,
				description: "Enables the spinner.",
			},
		]);
	});

	it("fails when the tsconfig is missing", () => {
		expect(() =>
			generateCatalogApi({
				repoRoot: fixture({ "widget.ts": "export interface WidgetProps { a?: boolean }" }),
				tsconfigPath: "missing.json",
				targets: [{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps" }],
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
				targets: [{ slug: "widget", sourceFile: "missing.ts", propsType: "WidgetProps" }],
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

	it("fails on duplicate slugs", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps" },
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps" },
				],
			}),
		).toThrow(/duplicate slug widget/);
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
		expect(generateFixture(root).widget).toEqual([
			{ name: "tone", type: '"a" | "b"', required: false },
		]);
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
			{ name: "tone", type: '"a" | "b"', required: false },
		]);
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
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
		expect(generateFixture(root).widget).toEqual([
			{ name: "flag", type: "boolean", required: false },
		]);
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
		expect(generateFixture(root).widget).toEqual([
			{ name: "vessel", type: "Vessel<string>", required: false },
		]);
	});

	it("renders deterministic modules and rejects missing or stale artifacts", () => {
		const data = {
			button: [
				{
					name: "variant",
					type: '"default" | null',
					required: false,
				},
			],
		};
		const first = renderCatalogApiModule(data);
		const second = renderCatalogApiModule(data);
		expect(first).toBe(second);
		expect(first.startsWith("// Generated by scripts/catalog-api.ts. Do not edit.\n")).toBe(true);
		expect(first).toContain('name: "variant"');
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

	it("produces the same Button module on a second generation", () => {
		const first = renderCatalogApiModule(
			generateCatalogApi({
				repoRoot,
				tsconfigPath: DEFAULT_TSCONFIG,
				targets: CATALOG_API_TARGETS,
			}),
		);
		const second = renderCatalogApiModule(
			generateCatalogApi({
				repoRoot,
				tsconfigPath: DEFAULT_TSCONFIG,
				targets: CATALOG_API_TARGETS,
			}),
		);
		expect(first).toBe(second);
		expect(first).toContain('"variant"');
		expect(first).toContain("| null");
		expect(first).toContain('\t"link-button": [');
		expect(first).toContain("\tbutton: [");
		expect(first).toContain("\ttext: [");
		expect(createHash("sha256").update(first, "utf8").digest("hex")).toBe(
			"1e5fffe4f0001a7eb196998a3b1d2e445751fad9e965d865383137338b415c2a",
		);
	}, 20_000);
});
