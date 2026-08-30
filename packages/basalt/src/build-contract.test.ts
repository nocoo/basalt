import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const pkgRoot = "packages/basalt";

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
		const verifyAt = build.search(/scripts\/verify-dist/);
		expect(cssAt).toBeGreaterThanOrEqual(0);
		expect(viteAt).toBeGreaterThan(cssAt);
		expect(tscAt).toBeGreaterThan(viteAt);
		expect(verifyAt).toBeGreaterThan(tscAt);
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
		},
	);
});
