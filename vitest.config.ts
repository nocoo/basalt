import { readFileSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}", "packages/basalt/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			// AST-aware remapping is built into vitest v4+; no opt-in needed.
			reporter: ["text", "text-summary", "lcov"],
			include: [
				"src/models/**/*.ts",
				"src/viewmodels/**/*.ts",
				"src/lib/**/*.ts",
				"packages/basalt/src/**/*.{ts,tsx}",
			],
			exclude: [
				// Test setup, fixtures, and helpers — exercised by the tests themselves,
				// not production code paths we want to gate on coverage.
				"src/test/**",
				"packages/basalt/**/*.test.ts",
				"packages/basalt/**/*.test.tsx",
				"packages/basalt/src/index.ts",
				// Type-only declaration files have no runtime behavior to cover.
				"src/**/*.d.ts",
				// Pure type definitions for model shapes; covered implicitly via the
				// model implementations that consume them.
				"src/models/types.ts",
			],
			thresholds: {
				statements: 95,
				branches: 95,
				functions: 95,
				lines: 95,
			},
		},
	},
	resolve: {
		alias: [
			{
				find: "@nocoo/basalt/components",
				replacement: path.resolve(__dirname, "./packages/basalt/src/components"),
			},
			{
				find: "@nocoo/basalt/providers",
				replacement: path.resolve(__dirname, "./packages/basalt/src/providers"),
			},
			{
				find: "@nocoo/basalt/charts",
				replacement: path.resolve(__dirname, "./packages/basalt/src/charts"),
			},
			{
				find: "@nocoo/basalt",
				replacement: path.resolve(__dirname, "./packages/basalt/src/index.ts"),
			},
			{ find: "@", replacement: path.resolve(__dirname, "./src") },
		],
	},
});
