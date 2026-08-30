import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	assertRootConsumerSource,
	assertTemplateManifest,
	distArtifactKinds,
	fileDependencyPaths,
	findInstalledPackages,
	forbiddenInstallRefs,
	injectTarballDependency,
	isOutsideRepo,
	isPathInside,
	standaloneCssEvidence,
} from "./consumer-gate";

describe("standalone consumer gate helpers", () => {
	it("rejects a temp path inside the repository", () => {
		expect(isPathInside("/repo", "/repo/fixtures")).toBe(true);
		expect(isPathInside("/repo", "/tmp/basalt-gate-b-1")).toBe(false);
		expect(isOutsideRepo("/tmp/basalt-gate-b-1", "/repo")).toBe(true);
		expect(isOutsideRepo("/repo/tmp", "/repo")).toBe(false);
	});

	it("injects a file tarball without workspace or repo paths", () => {
		const injected = injectTarballDependency(
			{ dependencies: { react: "19.2.8" } },
			"/tmp/basalt-gate-b-1/nocoo-basalt-0.0.0.tgz",
		);
		expect(injected.dependencies?.["@nocoo/basalt"]).toBe(
			"file:/tmp/basalt-gate-b-1/nocoo-basalt-0.0.0.tgz",
		);
		expect(injected.dependencies?.react).toBe("19.2.8");
		const raw = JSON.stringify(injected);
		expect(forbiddenInstallRefs(raw, "/Users/nocoo/workspace/personal/basalt")).toEqual([]);
		expect(fileDependencyPaths(injected)).toEqual(["/tmp/basalt-gate-b-1/nocoo-basalt-0.0.0.tgz"]);
	});

	it("flags workspace, link, and repository path refs", () => {
		expect(forbiddenInstallRefs('{"x":"workspace:*"}', "/repo")).toEqual(["workspace:"]);
		expect(forbiddenInstallRefs('{"x":"link:../packages/basalt"}', "/repo")).toEqual(["link:"]);
		expect(forbiddenInstallRefs('{"x":"file:/repo/packages/basalt"}', "/repo")).toEqual(["/repo"]);
	});

	it("requires token and button class in non-empty css", () => {
		expect(standaloneCssEvidence("")).toEqual({ empty: true, token: false, buttonClass: false });
		expect(standaloneCssEvidence(":root{color:red}")).toEqual({
			empty: false,
			token: false,
			buttonClass: false,
		});
		expect(
			standaloneCssEvidence(":root{--basalt-background: 0 0% 9%} .bg-basalt-primary{color:white}"),
		).toEqual({ empty: false, token: true, buttonClass: true });
	});

	it("classifies production dist artifacts", () => {
		expect(distArtifactKinds(["index.html", "assets/index.js"])).toEqual({
			html: true,
			js: true,
			css: false,
		});
		expect(distArtifactKinds(["index.html", "assets/index.js", "assets/index.css"])).toEqual({
			html: true,
			js: true,
			css: true,
		});
	});

	it("finds nested forbidden packages and ignores missing ones", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-gate-unit-"));
		try {
			mkdirSync(join(root, "react"), { recursive: true });
			mkdirSync(join(root, "@nocoo/basalt/node_modules/recharts"), { recursive: true });
			mkdirSync(join(root, "@tanstack/query-core"), { recursive: true });
			expect(
				findInstalledPackages(root, [
					"tailwindcss",
					"recharts",
					"react-day-picker",
					"@tanstack/react-table",
				]),
			).toEqual(["recharts"]);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects an in-repo template that already depends on the package", () => {
		expect(() =>
			assertTemplateManifest('{"dependencies":{"@nocoo/basalt":"workspace:*"}}'),
		).toThrow(/@nocoo\/basalt/);
		expect(() => assertTemplateManifest('{"name":"basalt-fixture-vite-standalone"}')).not.toThrow();
	});

	it("rejects granular or tailwind consumer source", () => {
		const valid = `import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast } from "@nocoo/basalt";
import "@nocoo/basalt/styles/standalone";
`;
		expect(() => assertRootConsumerSource(valid)).not.toThrow();
		expect(() =>
			assertRootConsumerSource(`import { Button } from "@nocoo/basalt/components/button";
import "@nocoo/basalt/styles/standalone";`),
		).toThrow(/granular/);
		expect(() =>
			assertRootConsumerSource(`import { Button } from "@nocoo/basalt";
import "@nocoo/basalt/styles/tailwind";`),
		).toThrow(/Tailwind/);
	});

	it("keeps the committed standalone fixture inside the gate contract", () => {
		const manifest = readFileSync("fixtures/vite-standalone/package.json", "utf8");
		assertTemplateManifest(manifest);
		expect(manifest).toContain('"react": "19.2.8"');
		expect(manifest).toContain('"react-dom": "19.2.8"');
		expect(manifest).toContain('"lucide-react": "1.34.0"');
		expect(manifest).toContain('"vite": "8.2.2"');
		assertRootConsumerSource(readFileSync("fixtures/vite-standalone/src/main.tsx", "utf8"));
	});
});
