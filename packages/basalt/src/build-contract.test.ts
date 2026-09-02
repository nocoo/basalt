import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectEsmClosure, rootBoundaryViolations } from "../scripts/root-boundary";

const pkgRoot = "packages/basalt";
const fixtureManifests = [
	"fixtures/vite-tailwind/package.json",
	"fixtures/vite-standalone/package.json",
	"fixtures/next19/package.json",
	"fixtures/vite-heavy/package.json",
] as const;

const REQUIRED_PREPUBLISH_STEPS = [
	"typecheck",
	"lint",
	"coverage",
	"package-build",
	"package-types",
	"package-pack",
	"package-publint",
	"gate-a",
	"gate-b",
	"gate-c",
	"gate-d",
] as const;

function classifyPrepublishSegment(segment: string) {
	switch (segment.trim()) {
		case "bun run typecheck":
			return "typecheck";
		case "bun run lint":
			return "lint";
		case "bun run test:coverage":
			return "coverage";
		case "bun run --cwd packages/basalt build":
			return "package-build";
		case "bun run --cwd packages/basalt types:check":
			return "package-types";
		case "bun run --cwd packages/basalt pack:check":
			return "package-pack";
		case "bun run --cwd packages/basalt publint":
			return "package-publint";
		case "bun run consumer:tailwind":
			return "gate-a";
		case "bun run consumer:standalone":
			return "gate-b";
		case "bun run consumer:next":
			return "gate-c";
		case "bun run consumer:heavy":
			return "gate-d";
		default:
			return undefined;
	}
}

function assertPrepublishPipeline(script: string) {
	if (/\b(npm|bun|pnpm|yarn)\s+publish\b/.test(script)) {
		throw new Error("lifecycle must not publish");
	}
	if (/\bnpx\b|\bbunx\b/.test(script)) {
		throw new Error("lifecycle must not bypass via npx/bunx");
	}
	if (/[;|]/.test(script) || /(?:^|[^&])&(?:[^&]|$)/.test(script)) {
		throw new Error("lifecycle must be fail-fast");
	}
	const steps = script.split(/\s*&&\s*/).map((segment) => {
		const id = classifyPrepublishSegment(segment);
		if (!id) {
			throw new Error(`lifecycle bypass via unknown step: ${segment}`);
		}
		return id;
	});
	const seen = new Set<string>();
	for (const step of steps) {
		if (seen.has(step)) {
			throw new Error(`duplicate step: ${step}`);
		}
		seen.add(step);
	}
	for (const required of REQUIRED_PREPUBLISH_STEPS) {
		if (!seen.has(required)) {
			throw new Error(`missing step: ${required}`);
		}
	}
	if (steps.length !== REQUIRED_PREPUBLISH_STEPS.length) {
		throw new Error("lifecycle step count mismatch");
	}
	if (steps.some((step, index) => step !== REQUIRED_PREPUBLISH_STEPS[index])) {
		throw new Error("reordered steps");
	}
	return steps;
}

describe("package build contract", () => {
	it("runs css, js, declarations, and dist verification in order", () => {
		const pkg = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8")) as {
			scripts: Record<string, string>;
		};
		expect(pkg.scripts["build:css"]).toContain("build-basalt-standalone");
		const build = pkg.scripts.build;
		const cssAt = build.indexOf("build:css");
		const viteAt = build.indexOf("vite build");
		const tscAt = build.indexOf("tsc -p tsconfig.build.json");
		const rewriteAt = build.search(/scripts\/rewrite-declarations/);
		const verifyAt = build.search(/scripts\/verify-dist/);
		const closureAt = build.search(/scripts\/root-boundary/);
		const runtimeAt = build.search(/node scripts\/verify-runtime\.mjs/);
		expect(cssAt).toBeGreaterThanOrEqual(0);
		expect(viteAt).toBeGreaterThan(cssAt);
		expect(tscAt).toBeGreaterThan(viteAt);
		expect(rewriteAt).toBeGreaterThan(tscAt);
		expect(verifyAt).toBeGreaterThan(rewriteAt);
		expect(closureAt).toBeGreaterThan(verifyAt);
		expect(runtimeAt).toBeGreaterThan(closureAt);
		expect(build).not.toContain("bun scripts/verify-runtime");
		expect(pkg.scripts["types:check"]).toContain("type-tests/tsconfig.bundler.json");
		expect(pkg.scripts["types:check"]).toContain("type-tests/tsconfig.nodenext.json");
	});

	it("empties dist and copies only publish css", () => {
		const config = readFileSync(path.join(pkgRoot, "vite.config.ts"), "utf8");
		expect(config).toContain("emptyOutDir: true");
		expect(config).toContain("sourcemap: true");
		expect(config).toContain('"use client"');
		expect(config).toContain("tailwind.css");
		expect(config).toContain("tokens.css");
		expect(config).toContain("standalone.css");
		expect(config).not.toContain("standalone.source.css");
	});

	it("emits declaration files from the package tsconfig", () => {
		const config = readFileSync(path.join(pkgRoot, "tsconfig.build.json"), "utf8");
		expect(config).toContain('"declaration": true');
		expect(config).toContain('"emitDeclarationOnly": true');
	});

	it("keeps an executable dist verifier", () => {
		expect(existsSync(path.join(pkgRoot, "scripts/verify-dist.ts"))).toBe(true);
		expect(existsSync(path.join(pkgRoot, "scripts/root-boundary.ts"))).toBe(true);
		expect(existsSync(path.join(pkgRoot, "scripts/verify-runtime.mjs"))).toBe(true);
		const runtime = readFileSync(path.join(pkgRoot, "scripts/verify-runtime.mjs"), "utf8");
		expect(runtime).toContain('import("@nocoo/basalt")');
		expect(runtime).toContain('import("@nocoo/basalt/components/button")');
		expect(runtime).toContain('import("@nocoo/basalt/providers/theme")');
		expect(runtime).toContain('import("@nocoo/basalt/charts/donut")');
		expect(runtime).toContain('import("@nocoo/basalt/components/date-picker")');
		expect(runtime).toContain('import("@nocoo/basalt/components/data-table")');
		expect(runtime).toContain("process.versions.bun");
		expect(runtime).not.toContain("../src/");
		expect(runtime).not.toContain("workspace:");
	});

	it("keeps the dist pack whitelist and publishable manifest", () => {
		const raw = readFileSync(path.join(pkgRoot, "package.json"), "utf8");
		const root = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
		const pkg = JSON.parse(raw) as {
			name: string;
			version: string;
			type: string;
			publishConfig?: { access?: string };
			files?: string[];
			scripts: Record<string, string>;
			exports: Record<string, string | { types?: string; import?: string }>;
		};
		expect(pkg.name).toBe("@nocoo/basalt");
		expect(pkg.version).toBe(root.version);
		expect(pkg).not.toHaveProperty("private");
		expect(raw).not.toMatch(/"private"\s*:/);
		expect(pkg.type).toBe("module");
		expect(pkg.publishConfig?.access).toBe("public");
		expect(pkg.files).toEqual(["dist", "README.md", "LICENSE"]);
		expect(pkg.scripts["pack:check"]).toContain("verify-pack");
		expect(pkg.scripts.publint).toBe("publint --strict --pack npm");
		expect(pkg.scripts.prepublishOnly).toBe("bun run --cwd ../.. package:prepublish");
		expect(pkg.scripts.prepublishOnly.split("&&")).toHaveLength(1);
		expect(pkg.scripts.prepublishOnly).not.toContain("consumer:");
		expect(pkg.scripts.prepublishOnly).not.toContain("npx");
		expect(pkg.scripts.prepublishOnly).not.toContain("bunx");
		const verifier = readFileSync(path.join(pkgRoot, "scripts/verify-pack.ts"), "utf8");
		expect(verifier).toContain('"private" in pkg');
		expect(verifier).toContain("publish package must not contain private");
		expect(verifier).not.toContain("private must stay true");
		expect(JSON.stringify(pkg.exports)).not.toContain("./src/");
		expect(Object.keys(pkg.exports)).toEqual([
			".",
			"./components/*",
			"./providers/*",
			"./charts/*",
			"./styles",
			"./styles/tailwind",
			"./styles/standalone",
		]);
		expect(pkg.exports["."]).toEqual({
			types: "./dist/index.d.ts",
			import: "./dist/index.js",
		});
		expect(pkg.exports["./components/*"]).toEqual({
			types: "./dist/components/*.d.ts",
			import: "./dist/components/*.js",
		});
		expect(pkg.exports["./providers/*"]).toEqual({
			types: "./dist/providers/*.d.ts",
			import: "./dist/providers/*.js",
		});
		expect(pkg.exports["./charts/*"]).toEqual({
			types: "./dist/charts/*.d.ts",
			import: "./dist/charts/*.js",
		});
		expect(pkg.exports["./styles"]).toBe("./dist/styles/tailwind.css");
		expect(pkg.exports["./styles/tailwind"]).toBe("./dist/styles/tailwind.css");
		expect(pkg.exports["./styles/standalone"]).toBe("./dist/styles/standalone.css");
		for (const key of [".", "./components/*", "./providers/*", "./charts/*"] as const) {
			const value = pkg.exports[key];
			expect(typeof value).toBe("object");
			if (typeof value === "string") {
				continue;
			}
			expect(Object.keys(value)).toEqual(["types", "import"]);
		}
		expect(readFileSync(path.join(pkgRoot, "LICENSE"), "utf8")).toBe(
			readFileSync("LICENSE", "utf8"),
		);
	});

	it("keeps root and consumer fixtures private", () => {
		const root = JSON.parse(readFileSync("package.json", "utf8")) as {
			private?: boolean;
			devDependencies: Record<string, string>;
		};
		expect(root.private).toBe(true);
		expect(root.devDependencies.publint).toBe("0.3.24");
		expect(root.devDependencies.publint).not.toMatch(/[\^~]|latest/);
		for (const manifest of fixtureManifests) {
			const fixture = JSON.parse(readFileSync(manifest, "utf8")) as { private?: boolean };
			expect(fixture.private, manifest).toBe(true);
		}
	});

	it("locks the fail-fast package:prepublish pipeline in unique order", () => {
		const root = JSON.parse(readFileSync("package.json", "utf8")) as {
			scripts: Record<string, string>;
		};
		const pipeline = root.scripts["package:prepublish"];
		expect(pipeline).toBeTruthy();
		expect(pipeline).not.toContain("npx");
		expect(pipeline).not.toContain("bunx");
		expect(assertPrepublishPipeline(pipeline)).toEqual([...REQUIRED_PREPUBLISH_STEPS]);
	});

	it("rejects prepublish pipelines that skip, duplicate, reorder, bypass, or publish", () => {
		const root = JSON.parse(readFileSync("package.json", "utf8")) as {
			scripts: Record<string, string>;
		};
		const good = root.scripts["package:prepublish"];
		const withoutCoverage = good.replace(" && bun run test:coverage", "");
		expect(withoutCoverage).not.toBe(good);
		expect(() => assertPrepublishPipeline(withoutCoverage)).toThrow(/missing step: coverage/);
		const duplicated = `${good} && bun run lint`;
		expect(() => assertPrepublishPipeline(duplicated)).toThrow(/duplicate step: lint/);
		const reordered = good.replace(
			"bun run consumer:tailwind && bun run consumer:standalone",
			"bun run consumer:standalone && bun run consumer:tailwind",
		);
		expect(reordered).not.toBe(good);
		expect(() => assertPrepublishPipeline(reordered)).toThrow(/reordered steps/);
		const bypassOr = good.replace(" && bun run lint && ", " || bun run lint && ");
		expect(bypassOr).not.toBe(good);
		expect(() => assertPrepublishPipeline(bypassOr)).toThrow(/fail-fast/);
		const unknown = `${good} && bun run build`;
		expect(() => assertPrepublishPipeline(unknown)).toThrow(/unknown step/);
		const publishes = `${good} && npm publish`;
		expect(() => assertPrepublishPipeline(publishes)).toThrow(/must not publish/);
	});

	it.skipIf(!existsSync(path.join(pkgRoot, "dist/index.js")))(
		"built dist matches the publish contract",
		() => {
			const dist = path.join(pkgRoot, "dist");
			expect(readFileSync(path.join(dist, "index.js"), "utf8").startsWith('"use client"')).toBe(
				true,
			);
			expect(existsSync(path.join(dist, "index.d.ts"))).toBe(true);
			expect(readdirSync(path.join(dist, "styles")).sort()).toEqual([
				"standalone.css",
				"tailwind.css",
				"tokens.css",
			]);
			expect(
				readFileSync(path.join(dist, "styles/tailwind.css"), "utf8").includes("./tokens.css"),
			).toBe(true);
			for (const rel of [
				"components/button.js.map",
				"providers/theme.js.map",
				"charts/donut.js.map",
				"utils/cn.js.map",
			]) {
				const map = JSON.parse(readFileSync(path.join(dist, rel), "utf8")) as {
					version: number;
					sources: unknown[];
					mappings: string;
				};
				expect(map.version, rel).toBe(3);
				expect(map.sources.length, rel).toBeGreaterThan(0);
				expect(map.mappings.length, rel).toBeGreaterThan(0);
			}
			const closure = collectEsmClosure(path.join(dist, "index.js"));
			expect(rootBoundaryViolations(closure, dist)).toEqual([]);
		},
	);
});
