import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	type BaselineDoc,
	resolvePackageExportTarget,
	runPublicApiVerification,
} from "../scripts/verify-public-api";

const pkgRoot = join(process.cwd(), "packages/basalt");
const baseline = JSON.parse(
	readFileSync(join(pkgRoot, "public-api-baseline.json"), "utf8"),
) as BaselineDoc;

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

describe("public API baseline verification", () => {
	it("verifies all 110 baseline paths and 572 symbols successfully", () => {
		const result = runPublicApiVerification();
		expect(result.errors).toEqual([]);
		expect(result.checkedPaths).toBe(110);
		expect(result.checkedSymbols).toBe(572);
	});

	it("fails fast if a public symbol is removed or renamed", () => {
		const mutatedBaseline: BaselineDoc = {
			...baseline,
			entries: baseline.entries.map((entry) => {
				if (entry.path === "@nocoo/basalt") {
					return {
						...entry,
						symbols: [...entry.symbols, { name: "NonExistentComponent", value: true, type: false }],
					};
				}
				return entry;
			}),
		};

		const result = runPublicApiVerification(mutatedBaseline);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors.some((e) => e.includes("NonExistentComponent"))).toBe(true);
	});

	it("fails fast if a value symbol is falsely expected as type (Button has value=true, type=false)", () => {
		const mutatedBaseline: BaselineDoc = {
			...baseline,
			entries: baseline.entries.map((entry) => {
				if (entry.path === "@nocoo/basalt") {
					return {
						...entry,
						symbols: entry.symbols.map((s) => {
							if (s.name === "Button") {
								// Expect Button to be a type, which must fail since Button is a runtime component
								return { ...s, type: true, value: false };
							}
							return s;
						}),
					};
				}
				return entry;
			}),
		};

		const result = runPublicApiVerification(mutatedBaseline);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(
			result.errors.some((e) => e.includes("Button") && e.includes("expected type=true")),
		).toBe(true);
	});

	it("fails fast if symbol type/value identity is degraded (BarChartProps expected value=true)", () => {
		const mutatedBaseline: BaselineDoc = {
			...baseline,
			entries: baseline.entries.map((entry) => {
				if (entry.path === "@nocoo/basalt/charts/bar") {
					return {
						...entry,
						symbols: entry.symbols.map((s) => {
							if (s.name === "BarChartProps") {
								// BarChartProps is an interface/type; require it to be a value
								return { ...s, value: true };
							}
							return s;
						}),
					};
				}
				return entry;
			}),
		};

		const result = runPublicApiVerification(mutatedBaseline);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors.some((e) => e.includes("BarChartProps") && e.includes("value=true"))).toBe(
			true,
		);
	});

	it("fails fast if package export target points to non-existent files", () => {
		const mutatedPkg = {
			exports: {
				".": { types: "./dist/missing.d.ts", import: "./dist/missing.js" },
				"./components/*": { types: "./dist/components/*.d.ts", import: "./dist/components/*.js" },
				"./providers/*": { types: "./dist/providers/*.d.ts", import: "./dist/providers/*.js" },
				"./charts/*": { types: "./dist/charts/*.d.ts", import: "./dist/charts/*.js" },
				"./styles": "./dist/styles/tailwind.css",
				"./styles/tailwind": "./dist/styles/tailwind.css",
				"./styles/standalone": "./dist/styles/standalone.css",
			},
		};

		const result = runPublicApiVerification(baseline, mutatedPkg);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors.some((e) => e.includes("missing types file for @nocoo/basalt"))).toBe(
			true,
		);
	});

	it("fails fast if a package export target is completely missing", () => {
		const mutatedPkg = {
			exports: {
				// Missing the root "." export
				"./components/*": { types: "./dist/components/*.d.ts", import: "./dist/components/*.js" },
				"./providers/*": { types: "./dist/providers/*.d.ts", import: "./dist/providers/*.js" },
				"./charts/*": { types: "./dist/charts/*.d.ts", import: "./dist/charts/*.js" },
				"./styles": "./dist/styles/tailwind.css",
				"./styles/tailwind": "./dist/styles/tailwind.css",
				"./styles/standalone": "./dist/styles/standalone.css",
			},
		};

		const result = runPublicApiVerification(baseline, mutatedPkg);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors.some((e) => e.includes("@nocoo/basalt is not covered"))).toBe(true);
	});

	it("fails fast if a required CSS export points to non-css file or is empty", () => {
		const mutatedBaseline: BaselineDoc = {
			...baseline,
			cssExports: ["@nocoo/basalt/styles"],
		};
		const mutatedPkg = {
			exports: {
				...baseline.entries.reduce(
					(acc, e) => {
						const rel = e.path === "@nocoo/basalt" ? "." : e.path.replace("@nocoo/basalt/", "./");
						acc[rel] = { types: `./dist/${rel}.d.ts`, import: `./dist/${rel}.js` };
						return acc;
					},
					{} as Record<string, unknown>,
				),
				// Point CSS to a JS file
				"./styles": "./dist/index.js",
			},
		};

		const result = runPublicApiVerification(mutatedBaseline, mutatedPkg);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors.some((e) => e.includes("must be a .css file"))).toBe(true);
	});
});
