import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	type BaselineDoc,
	resolvePackageExportTarget,
	runPublicApiVerification,
} from "../scripts/verify-public-api";

describe("resolvePackageExportTarget", () => {
	const exportsField = {
		".": {
			types: "./dist/index.d.ts",
			import: "./dist/index.js",
		},
		"./components/*": {
			types: "./dist/components/*.d.ts",
			import: "./dist/components/*.js",
		},
		"./styles/tailwind": "./dist/styles/tailwind.css",
	};

	it("resolves exact matches with precedence over wildcards", () => {
		const target = resolvePackageExportTarget(".", exportsField);
		expect(target).toEqual({
			typesTarget: "./dist/index.d.ts",
			importTarget: "./dist/index.js",
		});
	});

	it("resolves wildcard matches", () => {
		const target = resolvePackageExportTarget("components/button", exportsField);
		expect(target).toEqual({
			typesTarget: "./dist/components/button.d.ts",
			importTarget: "./dist/components/button.js",
		});
	});

	it("returns null for unmatched paths", () => {
		const target = resolvePackageExportTarget("unknown/path", exportsField);
		expect(target).toBeNull();
	});
});

describe("public API baseline verification with isolated fixtures", () => {
	let tempRoot: string;

	const baseline: BaselineDoc = {
		packageVersion: "2.0.3",
		sourceBaseline: "isolated-probe",
		entries: [
			{
				path: "@nocoo/basalt",
				symbols: [
					{ name: "Control", value: true, type: false },
					{ name: "ControlProps", value: false, type: true },
				],
			},
		],
		cssExports: ["@nocoo/basalt/styles"],
	};

	const pkg = {
		name: "@nocoo/basalt",
		type: "module",
		exports: {
			".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
			"./styles": "./dist/style.css",
		},
	};

	const declarations =
		"export interface ControlProps { value: string; }\nexport declare const Control: (props: ControlProps) => string;\n";
	const runtime = "export const Control = props => props.value;\n";
	const validCss = ".control { box-sizing: border-box; }\n";

	beforeAll(() => {
		tempRoot = mkdtempSync(join(tmpdir(), "basalt-api-test-"));
		mkdirSync(join(tempRoot, "dist"));
		writeFileSync(join(tempRoot, "package.json"), JSON.stringify(pkg, null, 2));
		writeFileSync(join(tempRoot, "dist/index.d.ts"), declarations);
		writeFileSync(join(tempRoot, "dist/index.js"), runtime);
		writeFileSync(join(tempRoot, "dist/style.css"), validCss);
	});

	afterAll(() => {
		if (tempRoot) {
			rmSync(tempRoot, { recursive: true, force: true });
		}
	});

	it("verifies a valid minimal package successfully without relying on repo dist", () => {
		const result = runPublicApiVerification(baseline, pkg, tempRoot);
		expect(result.errors).toEqual([]);
		expect(result.checkedPaths).toBe(1);
		expect(result.checkedSymbols).toBe(2);
	});

	it("fails fast when a runtime symbol is removed from JS but kept in d.ts", () => {
		writeFileSync(join(tempRoot, "dist/index.js"), "export const Other = () => null;\n");
		try {
			const result = runPublicApiVerification(baseline, pkg, tempRoot);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors.some((e) => e.includes('runtime symbol "Control" missing'))).toBe(true);
		} finally {
			writeFileSync(join(tempRoot, "dist/index.js"), runtime);
		}
	});

	it("fails fast when actual export targets point to missing files", () => {
		const wrongPkg = {
			...pkg,
			exports: {
				...pkg.exports,
				".": { types: "./dist/missing.d.ts", import: "./dist/missing.js" },
			},
		};
		const result = runPublicApiVerification(baseline, wrongPkg, tempRoot);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors.some((e) => e.includes("missing types file"))).toBe(true);
		expect(result.errors.some((e) => e.includes("missing JS file"))).toBe(true);
	});

	it("fails fast when a type-only interface is replaced by a value-only symbol in d.ts", () => {
		writeFileSync(
			join(tempRoot, "dist/index.d.ts"),
			"export declare const Control: () => string;\nexport declare const ControlProps: string;\n",
		);
		try {
			const result = runPublicApiVerification(baseline, pkg, tempRoot);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(
				result.errors.some(
					(e) => e.includes('symbol "ControlProps"') && e.includes("expected type=true"),
				),
			).toBe(true);
		} finally {
			writeFileSync(join(tempRoot, "dist/index.d.ts"), declarations);
		}
	});

	it("fails fast when a value symbol is falsely expected as type", () => {
		const mutatedBaseline: BaselineDoc = {
			...baseline,
			entries: [
				{
					path: "@nocoo/basalt",
					symbols: [
						{ name: "Control", value: false, type: true },
						{ name: "ControlProps", value: false, type: true },
					],
				},
			],
		};
		const result = runPublicApiVerification(mutatedBaseline, pkg, tempRoot);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(
			result.errors.some((e) => e.includes('symbol "Control"') && e.includes("expected type=true")),
		).toBe(true);
	});

	it("fails fast when a CSS target file is empty", () => {
		writeFileSync(join(tempRoot, "dist/style.css"), "");
		try {
			const result = runPublicApiVerification(baseline, pkg, tempRoot);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors.some((e) => e.includes("CSS export target file is empty"))).toBe(true);
		} finally {
			writeFileSync(join(tempRoot, "dist/style.css"), validCss);
		}
	});

	it("fails fast when a CSS target points to a JavaScript file", () => {
		const wrongCssPkg = {
			...pkg,
			exports: {
				...pkg.exports,
				"./styles": "./dist/index.js",
			},
		};
		const result = runPublicApiVerification(baseline, wrongCssPkg, tempRoot);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors.some((e) => e.includes("must be a .css file"))).toBe(true);
	});
});
