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

function fixture(files: Record<string, string>): string {
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
		expect(Object.keys(generated)).toEqual(["button"]);
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
	}, 20_000);
});
