import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import {
	assertNoPageFaults,
	attachPageFaults,
	createBrowserProfileDir,
	settleWithCleanup,
	withChromiumPage,
} from "./consumer-browser";
import {
	assertExactVersion,
	assertGranularResolution,
	assertHeavyConsumerSource,
	assertHttpClosed,
	assertNextLayout,
	assertNextPage,
	assertNoSuppressHydrationWarning,
	assertOptionalPeerMetadata,
	assertRootConsumerSource,
	assertStandaloneTypecheckGate,
	assertTailwindStylesheet,
	assertTarballDistSource,
	assertTemplateManifest,
	cleanupConsumerGate,
	consumerSourceGlobs,
	distArtifactKinds,
	fileDependencyPaths,
	findInstalledPackages,
	forbiddenInstallRefs,
	gateConfigFromArgv,
	HEAVY_CONSUMER_VERSIONS,
	HEAVY_GATE,
	HEAVY_SOURCE_SPECIFIERS,
	injectTarballDependency,
	isOutsideRepo,
	isPathInside,
	type Manifest,
	NEXT_GATE,
	OPTIONAL_HEAVY_PEERS,
	STANDALONE_GATE,
	standaloneCssEvidence,
	staticBasaltSpecifiers,
	TAILWIND_GATE,
	TARBALL_SOURCE_GLOB,
	tailwindCssEvidence,
} from "./consumer-gate";
import { allocatePort, listPidsMatching, processAlive, startHttpServer } from "./consumer-http";

const sourceCtx = { fromDir: "/consumer/src", consumerRoot: "/consumer" };

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
		expect(forbiddenInstallRefs(raw, "/repo")).toEqual([]);
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
		assertStandaloneTypecheckGate(
			readFileSync("fixtures/vite-standalone/tsconfig.json", "utf8"),
			manifest,
		);
		const runner = readFileSync("scripts/consumer-gate.ts", "utf8");
		const typecheckAt = runner.indexOf('run("npm", ["run", "typecheck"]');
		const buildAt = runner.indexOf('run("npm", ["run", "build"]');
		expect(typecheckAt).toBeGreaterThan(0);
		expect(buildAt).toBeGreaterThan(typecheckAt);
	});

	it("rejects a consumer typecheck gate that skips tarball declarations", () => {
		const tsconfig = readFileSync("fixtures/vite-standalone/tsconfig.json", "utf8");
		expect(() =>
			assertStandaloneTypecheckGate(
				tsconfig.replace('"skipLibCheck": false', '"skipLibCheck": true'),
				"{}",
			),
		).toThrow(/skipLibCheck/);
		expect(() =>
			assertStandaloneTypecheckGate(tsconfig, '{"scripts":{"build":"vite build"}}'),
		).toThrow(/typecheck/);
	});

	it("does not embed a developer home path in this slice", () => {
		const needle = ["/Users", "nocoo"].join("/");
		const files = [
			"scripts/consumer-gate.ts",
			"scripts/consumer-gate.test.ts",
			"fixtures/README.md",
			"fixtures/vite-standalone/package.json",
			"fixtures/vite-standalone/src/main.tsx",
			"fixtures/vite-standalone/src/css.d.ts",
			"fixtures/vite-standalone/tsconfig.json",
			"fixtures/vite-standalone/vite.config.ts",
			"fixtures/vite-standalone/index.html",
		];
		for (const file of files) {
			expect(readFileSync(file, "utf8").includes(needle), file).toBe(false);
		}
	});
});

describe("tailwind consumer gate helpers", () => {
	it("selects standalone by default and tailwind from argv", () => {
		expect(gateConfigFromArgv([])).toBe(STANDALONE_GATE);
		expect(gateConfigFromArgv(["tailwind"])).toBe(TAILWIND_GATE);
		expect(gateConfigFromArgv(["next"])).toBe(NEXT_GATE);
		expect(gateConfigFromArgv(["heavy"])).toBe(HEAVY_GATE);
		expect(STANDALONE_GATE.forbiddenPeers).toContain("tailwindcss");
		expect(TAILWIND_GATE.forbiddenPeers).toEqual([...OPTIONAL_HEAVY_PEERS]);
		expect(TAILWIND_GATE.requiredPeers.tailwindcss).toBe("4.3.3");
		expect(TAILWIND_GATE.styleExport).toBe("@nocoo/basalt/styles/tailwind");
		expect(NEXT_GATE.forbiddenPeers).toContain("tailwindcss");
		expect(NEXT_GATE.styleExport).toBe("@nocoo/basalt/styles/standalone");
		expect(NEXT_GATE.httpMarker).toBe("basalt-next19-ok");
		expect(HEAVY_GATE.requiredPeers).toEqual(HEAVY_CONSUMER_VERSIONS);
		expect(HEAVY_GATE.forbiddenPeers).toEqual(["tailwindcss"]);
		expect(STANDALONE_GATE.forbiddenPeers).toEqual(
			expect.arrayContaining([...OPTIONAL_HEAVY_PEERS]),
		);
		expect(NEXT_GATE.forbiddenPeers).toEqual(expect.arrayContaining([...OPTIONAL_HEAVY_PEERS]));
	});

	it("keeps the committed tailwind fixture inside the gate contract", () => {
		const manifest = readFileSync("fixtures/vite-tailwind/package.json", "utf8");
		assertTemplateManifest(manifest);
		expect(manifest).toContain('"react": "19.2.8"');
		expect(manifest).toContain('"tailwindcss": "4.3.3"');
		expect(manifest).toContain('"@tailwindcss/vite": "4.3.3"');
		expect(manifest).not.toContain("standalone");
		assertRootConsumerSource(
			readFileSync("fixtures/vite-tailwind/src/main.tsx", "utf8"),
			"tailwind",
		);
		assertStandaloneTypecheckGate(
			readFileSync("fixtures/vite-tailwind/tsconfig.json", "utf8"),
			manifest,
		);
		assertTailwindStylesheet(readFileSync("fixtures/vite-tailwind/src/index.css", "utf8"), {
			fromDir: join("fixtures/vite-tailwind", "src"),
			consumerRoot: "fixtures/vite-tailwind",
		});
		expect(readFileSync("fixtures/vite-tailwind/src/main.tsx", "utf8")).toContain("./index.css");
		expect(readFileSync("fixtures/vite-tailwind/src/main.tsx", "utf8")).not.toContain(
			"@nocoo/basalt/styles/",
		);
		const vite = readFileSync("fixtures/vite-tailwind/vite.config.ts", "utf8");
		expect(vite).toContain("@tailwindcss/vite");
		expect(vite).toContain("tailwindcss()");
	});

	it("fails the gate when @source is missing or points at the repo", () => {
		expect(() => assertTarballDistSource([], sourceCtx)).toThrow(/missing @source/);
		expect(() =>
			assertTarballDistSource(
				["../../packages/basalt/src/**/*.{ts,tsx}", TARBALL_SOURCE_GLOB],
				sourceCtx,
			),
		).toThrow(/extra @source/);
		expect(() =>
			assertTarballDistSource(["../../packages/basalt/src/**/*.{js,jsx,ts,tsx}"], sourceCtx),
		).toThrow(/tarball dist/);
		expect(() => assertTarballDistSource(["./src/**/*.tsx"], sourceCtx)).toThrow(/glob/);
		expect(() => assertTarballDistSource(["/tmp/workspace/dist/**/*"], sourceCtx)).toThrow(
			/relative/,
		);
		expect(() =>
			assertTarballDistSource(
				["../../other/node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}"],
				sourceCtx,
			),
		).toThrow(/tarball dist/);
		expect(() =>
			assertTarballDistSource(
				["../node_modules/@nocoo/basalt/dist-extra/**/*.{js,jsx,ts,tsx}"],
				sourceCtx,
			),
		).toThrow(/tarball dist/);
		expect(() =>
			assertTarballDistSource(
				["../node_modules/@nocoo/basalt/dist/../src/**/*.{js,jsx,ts,tsx}"],
				sourceCtx,
			),
		).toThrow(/tarball dist/);
		expect(() => assertTarballDistSource([TARBALL_SOURCE_GLOB], sourceCtx)).not.toThrow();
		expect(
			consumerSourceGlobs(readFileSync("fixtures/vite-tailwind/src/index.css", "utf8")),
		).toEqual([TARBALL_SOURCE_GLOB]);
		expect(() =>
			assertTailwindStylesheet(
				'@import "@nocoo/basalt/styles/tailwind";\n@import "tailwindcss";\n',
				sourceCtx,
			),
		).toThrow(/missing @source/);
		expect(() =>
			assertTailwindStylesheet(
				'@source "../../packages/basalt/src/**/*.{js,jsx,ts,tsx}";\n@import "@nocoo/basalt/styles/tailwind";\n@import "tailwindcss";\n',
				sourceCtx,
			),
		).toThrow(/tarball dist/);
	});

	it("rejects a package-style import in main and a duplicate CSS import", () => {
		expect(() =>
			assertRootConsumerSource(
				`import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast } from "@nocoo/basalt";
import "@nocoo/basalt/styles/tailwind";
import "./index.css";
`,
				"tailwind",
			),
		).toThrow(/package styles from main/);
		const once = `@source "${TARBALL_SOURCE_GLOB}";
@import "@nocoo/basalt/styles/tailwind";
@import "tailwindcss";
`;
		expect(() => assertTailwindStylesheet(once, sourceCtx)).not.toThrow();
		expect(() =>
			assertTailwindStylesheet(`${once}@import "@nocoo/basalt/styles/tailwind";\n`, sourceCtx),
		).toThrow(/once/);
	});

	it("allows Tailwind while still rejecting other heavy peers", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-gate-tw-"));
		try {
			mkdirSync(join(root, "tailwindcss"), { recursive: true });
			mkdirSync(join(root, "recharts"), { recursive: true });
			expect(findInstalledPackages(root, OPTIONAL_HEAVY_PEERS)).toEqual(["recharts"]);
			expect(findInstalledPackages(root, ["tailwindcss"])).toEqual(["tailwindcss"]);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("requires token and Button utilities and rejects a standalone dump", () => {
		const generated = `
:root { --basalt-background: 220 14% 94%; }
.bg-basalt-primary { color: blue; }
.text-basalt-primary-foreground { color: white; }
`;
		expect(tailwindCssEvidence(generated)).toEqual({
			empty: false,
			token: true,
			buttonClass: true,
			buttonUtility: true,
			standaloneDump: false,
		});
		expect(
			tailwindCssEvidence(
				"/* Generated from standalone.source.css. Do not edit. */\n:root{--basalt-background:0}\n.bg-basalt-primary{}\n.text-basalt-primary-foreground{}",
			).standaloneDump,
		).toBe(true);
		expect(tailwindCssEvidence(":root{--basalt-background:0}").buttonClass).toBe(false);
	});

	it("does not embed a developer home path in the tailwind slice", () => {
		const needle = ["/Users", "nocoo"].join("/");
		const files = [
			"fixtures/vite-tailwind/package.json",
			"fixtures/vite-tailwind/src/main.tsx",
			"fixtures/vite-tailwind/src/index.css",
			"fixtures/vite-tailwind/src/css.d.ts",
			"fixtures/vite-tailwind/tsconfig.json",
			"fixtures/vite-tailwind/vite.config.ts",
			"fixtures/vite-tailwind/index.html",
		];
		for (const file of files) {
			expect(readFileSync(file, "utf8").includes(needle), file).toBe(false);
		}
	});
});

describe("next consumer gate helpers", () => {
	it("keeps the committed next fixture inside the gate contract", () => {
		const manifest = readFileSync("fixtures/next19/package.json", "utf8");
		assertTemplateManifest(manifest);
		expect(manifest).toContain('"next": "16.3.3"');
		expect(manifest).toContain('"react": "19.2.8"');
		expect(manifest).toContain('"react-dom": "19.2.8"');
		expect(manifest).not.toContain("@nocoo/basalt");
		assertRootConsumerSource(readFileSync("fixtures/next19/app/basalt-app.tsx", "utf8"), "next");
		assertNextLayout(readFileSync("fixtures/next19/app/layout.tsx", "utf8"));
		assertNextPage(readFileSync("fixtures/next19/app/page.tsx", "utf8"), "basalt-next19-ok");
		assertStandaloneTypecheckGate(readFileSync("fixtures/next19/tsconfig.json", "utf8"), manifest);
		expect(readFileSync("fixtures/next19/next.config.ts", "utf8")).not.toContain(
			"transpilePackages",
		);
		const app = readFileSync("fixtures/next19/app/basalt-app.tsx", "utf8");
		expect(app).toMatch(/\btoast\b/);
		expect(app).toContain("data-basalt-root");
		expect(app).toContain("data-basalt-save");
		expect(app).toContain("data-basalt-toast");
		expect(app).toContain("data-basalt-toast-host");
		expect(app.indexOf("data-basalt-toast-host")).toBeGreaterThan(app.indexOf("data-basalt-root"));
		expect(app.lastIndexOf("<Toast")).toBeGreaterThan(app.indexOf("data-basalt-toast-host"));
		expect(manifest).not.toContain("playwright");
		const rootManifest = readFileSync("package.json", "utf8");
		expect(rootManifest).toContain('"playwright": "1.62.1"');
		expect(rootManifest).toContain("playwright:install");
		const runner = readFileSync("scripts/consumer-gate.ts", "utf8");
		expect(runner).toContain("nextStartLaunch");
		expect(runner).toContain("proveNextHydration");
		expect(runner).not.toContain('["run", "start"');
	});

	it("rejects a next client module that never imports toast or marks the root", () => {
		const source = `"use client";
import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast } from "@nocoo/basalt";
export function BasaltApp() { return <Button>Save</Button>; }
`;
		expect(() => assertRootConsumerSource(source, "next")).toThrow(/toast/);
		expect(() =>
			assertRootConsumerSource(
				`"use client";
import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast, toast } from "@nocoo/basalt";
export function BasaltApp() { return <Button onClick={() => toast("x")}>Save</Button>; }
`,
				"next",
			),
		).toThrow(/app root/);
	});

	it("treats a refused port as closed", async () => {
		await expect(assertHttpClosed("http://127.0.0.1:1/")).resolves.toBeUndefined();
	});

	it("still stops the server and deletes temp if profile cleanup fails", async () => {
		const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-gate-c-clean-")));
		const profileDir = mkdtempSync(join(tmpdir(), "basalt-pw-"));
		const unique = basename(tempRoot);
		const zombie = spawn("node", ["-e", `setTimeout(() => {}, 20000); // ${profileDir}`], {
			detached: true,
			stdio: "ignore",
		});
		zombie.unref();
		const port = await allocatePort();
		const url = `http://127.0.0.1:${port}/`;
		const started = await startHttpServer({
			cwd: process.cwd(),
			command: "node",
			args: [
				"-e",
				`require("http").createServer((_, res) => { res.writeHead(200); res.end("ok"); }).listen(${port}, "127.0.0.1"); // ${tempRoot}`,
			],
			url,
			timeoutMs: 5000,
			needles: [tempRoot, unique],
		});
		try {
			await expect(
				cleanupConsumerGate({
					profileDir,
					child: started.child,
					nextUrl: url,
					tempRoot,
				}),
			).rejects.toThrow(/leftover Chromium/);
			expect(existsSync(tempRoot)).toBe(false);
			expect(processAlive(started.child.pid as number)).toBe(false);
			await expect(assertHttpClosed(url)).resolves.toBeUndefined();
		} finally {
			if (zombie.pid !== undefined) {
				try {
					process.kill(-zombie.pid, "SIGKILL");
				} catch {
					try {
						process.kill(zombie.pid, "SIGKILL");
					} catch {
						// already gone
					}
				}
			}
		}
	});

	it("cleans server pid, port, profile, and temp when browser proof fails on that server", async () => {
		const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-gate-c-fail-")));
		const unique = basename(tempRoot);
		const profileDir = createBrowserProfileDir();
		const port = await allocatePort();
		const url = `http://127.0.0.1:${port}/`;
		const html = "<!doctype html><script>console.error('basalt-console-fail')</script>";
		const started = await startHttpServer({
			cwd: process.cwd(),
			command: "node",
			args: [
				"-e",
				`require("http").createServer((_, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end(${JSON.stringify(html)}); }).listen(${port}, "127.0.0.1"); // ${tempRoot}`,
			],
			url,
			timeoutMs: 5000,
			needles: [tempRoot, unique],
		});
		await expect(
			settleWithCleanup(
				async () =>
					withChromiumPage(profileDir, async (page) => {
						const faults = attachPageFaults(page);
						await page.goto(url);
						assertNoPageFaults(faults);
					}),
				async () => {
					await cleanupConsumerGate({
						profileDir,
						child: started.child,
						nextUrl: url,
						tempRoot,
					});
				},
			),
		).rejects.toThrow(/basalt-console-fail/);
		expect(existsSync(tempRoot)).toBe(false);
		expect(existsSync(profileDir)).toBe(false);
		expect(listPidsMatching(unique)).toEqual([]);
		expect(listPidsMatching(profileDir)).toEqual([]);
		expect(processAlive(started.child.pid as number)).toBe(false);
		await expect(assertHttpClosed(url)).resolves.toBeUndefined();
	});

	it("rejects suppressHydrationWarning and a client layout", () => {
		expect(() => assertNoSuppressHydrationWarning("<html suppressHydrationWarning>")).toThrow(
			/suppress hydration/,
		);
		expect(() =>
			assertNextLayout(`"use client";
import "@nocoo/basalt/styles/standalone";
export default function RootLayout() { return <html><body /></html>; }
`),
		).toThrow(/server/);
		expect(() =>
			assertRootConsumerSource(
				`import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast } from "@nocoo/basalt";
`,
				"next",
			),
		).toThrow(/explicit/);
	});

	it("does not embed a developer home path in the next slice", () => {
		const needle = ["/Users", "nocoo"].join("/");
		const files = [
			"fixtures/next19/package.json",
			"fixtures/next19/app/layout.tsx",
			"fixtures/next19/app/page.tsx",
			"fixtures/next19/app/basalt-app.tsx",
			"fixtures/next19/tsconfig.json",
			"fixtures/next19/next.config.ts",
			"scripts/consumer-http.ts",
			"scripts/consumer-http.test.ts",
			"scripts/consumer-browser.ts",
			"scripts/consumer-browser.test.ts",
		];
		for (const file of files) {
			expect(readFileSync(file, "utf8").includes(needle), file).toBe(false);
		}
	});
});

describe("heavy consumer gate helpers", () => {
	it("locks optional peer metadata and exact consumer versions", () => {
		const pkg = JSON.parse(readFileSync("packages/basalt/package.json", "utf8")) as Manifest;
		assertOptionalPeerMetadata(pkg);
		expect(pkg.peerDependencies?.recharts).toBe("^3");
		expect(pkg.peerDependencies?.["react-day-picker"]).toBe("^10");
		expect(pkg.peerDependencies?.["@tanstack/react-table"]).toBe("^9");
		expect(() => assertExactVersion("recharts", "3.0.0", "3.10.1")).toThrow(/3\.0\.0/);
		assertExactVersion("recharts", "3.10.1", "3.10.1");
	});

	it("keeps the committed heavy fixture inside the gate contract", () => {
		const manifest = readFileSync("fixtures/vite-heavy/package.json", "utf8");
		assertTemplateManifest(manifest);
		expect(manifest).toContain('"recharts": "3.10.1"');
		expect(manifest).toContain('"react-day-picker": "10.0.1"');
		expect(manifest).toContain('"@tanstack/react-table": "9.1.2"');
		expect(manifest).not.toContain("@nocoo/basalt");
		const entry = readFileSync("fixtures/vite-heavy/src/main.tsx", "utf8");
		assertRootConsumerSource(entry, "heavy");
		expect([...staticBasaltSpecifiers(entry)].sort()).toEqual([...HEAVY_SOURCE_SPECIFIERS].sort());
		assertStandaloneTypecheckGate(
			readFileSync("fixtures/vite-heavy/tsconfig.json", "utf8"),
			manifest,
		);
		const packageReadme = readFileSync("packages/basalt/README.md", "utf8");
		expect(packageReadme).toContain("react-day-picker");
		expect(packageReadme).toContain("the current DatePicker implementation does not call it");
		expect(packageReadme).toContain("the current DataTable implementation does not call it");
		expect(HEAVY_GATE.styleExport).toBe("@nocoo/basalt/styles/standalone");
		expect(HEAVY_GATE.entryFile).toBe("src/main.tsx");
		expect(readFileSync("package.json", "utf8")).toContain("consumer:heavy");
	});

	it("rejects root imports and missing granular heavy source", () => {
		expect(() =>
			assertHeavyConsumerSource(`import { DonutChart } from "@nocoo/basalt";
import "@nocoo/basalt/styles/standalone";
`),
		).toThrow(/package root/);
		expect(() =>
			assertRootConsumerSource(
				`import { DonutChart } from "@nocoo/basalt/charts/donut";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DataTable } from "@nocoo/basalt/components/data-table";
import "@nocoo/basalt/styles/standalone";
import { Button } from "@nocoo/basalt";
`,
				"heavy",
			),
		).toThrow(/package root/);
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}import { Button } from '@nocoo/basalt';
`),
		).toThrow(/package root/);
		expect(() =>
			assertHeavyConsumerSource(`import { DonutChart } from "@nocoo/basalt/charts/donut";
`),
		).toThrow(/missing specifier/);
	});

	it("rejects extra granular, extra styles, and duplicate heavy specifiers", () => {
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}import { Separator } from "@nocoo/basalt/components/separator";
`),
		).toThrow(/extra specifier @nocoo\/basalt\/components\/separator/);
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}import { ThemeProvider } from "@nocoo/basalt/providers/theme";
`),
		).toThrow(/extra specifier @nocoo\/basalt\/providers\/theme/);
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}import { BarChart } from "@nocoo/basalt/charts/bar";
`),
		).toThrow(/extra specifier @nocoo\/basalt\/charts\/bar/);
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}import "@nocoo/basalt/styles";
`),
		).toThrow(/extra specifier @nocoo\/basalt\/styles/);
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}import "@nocoo/basalt/styles/standalone";
`),
		).toThrow(/duplicate specifier @nocoo\/basalt\/styles\/standalone/);
	});

	it("rejects comment-only, string, and template pseudo-imports", () => {
		const source = `// import { DonutChart } from "@nocoo/basalt/charts/donut";
// import { DatePicker } from "@nocoo/basalt/components/date-picker";
// import { DataTable } from "@nocoo/basalt/components/data-table";
// import "@nocoo/basalt/styles/standalone";
const quoted = 'import { DonutChart } from "@nocoo/basalt/charts/donut"';
const templated = \`import { DatePicker } from "@nocoo/basalt/components/date-picker"\`;
function DonutChart() {}
function DatePicker() {}
function DataTable() {}
`;
		expect(staticBasaltSpecifiers(source)).toEqual([]);
		expect(() => assertHeavyConsumerSource(source)).toThrow(/missing specifier/);
	});

	it("rejects side-effect heavy imports plus local shadows", () => {
		expect(() =>
			assertHeavyConsumerSource(`import "@nocoo/basalt/charts/donut";
import "@nocoo/basalt/components/date-picker";
import "@nocoo/basalt/components/data-table";
import "@nocoo/basalt/styles/standalone";
function DonutChart() {}
function DatePicker() {}
function DataTable() {}
`),
		).toThrow(/DonutChart/);
	});

	it("rejects aliased named imports and local shadows of heavy bindings", () => {
		expect(() =>
			assertHeavyConsumerSource(`import { DonutChart as Chart } from "@nocoo/basalt/charts/donut";
import { DatePicker as Picker } from "@nocoo/basalt/components/date-picker";
import { DataTable as Table } from "@nocoo/basalt/components/data-table";
import "@nocoo/basalt/styles/standalone";
export const n = <><Chart /><Picker /><Table /></>;
`),
		).toThrow(/aliased named import DonutChart/);
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}function DonutChart() { return null; }
export const n = <><DonutChart /><DatePicker /><DataTable /></>;
`),
		).toThrow(/shadows DonutChart/);
	});

	it("rejects unrendered heavy bindings and syntax errors", () => {
		expect(() => assertHeavyConsumerSource(heavySource())).toThrow(/does not render DonutChart/);
		expect(() =>
			assertHeavyConsumerSource(`import { DonutChart from "@nocoo/basalt/charts/donut"`),
		).toThrow(/syntax errors/);
	});

	it("rejects dynamic import and require of basalt modules", () => {
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}void import("@nocoo/basalt/charts/donut");
`),
		).toThrow(/dynamic import of @nocoo\/basalt\/charts\/donut/);
		expect(() =>
			assertHeavyConsumerSource(`${heavySource()}require("@nocoo/basalt");
`),
		).toThrow(/require of @nocoo\/basalt/);
	});

	it("preserves a heavy proof error and deletes temp without a server", async () => {
		const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-gate-d-fail-")));
		const proof = new Error("heavy-proof-fail");
		await expect(
			settleWithCleanup(
				async () => {
					throw proof;
				},
				async () => {
					await cleanupConsumerGate({ tempRoot });
				},
			),
		).rejects.toBe(proof);
		expect(existsSync(tempRoot)).toBe(false);
	});

	it("rejects granular resolution into the repository or a missing export", () => {
		expect(() =>
			assertGranularResolution({
				spec: "@nocoo/basalt/charts/donut",
				resolved: "file:///repo/node_modules/@nocoo/basalt/dist/charts/donut.js",
				real: "/repo/node_modules/@nocoo/basalt/dist/charts/donut.js",
				exportName: "DonutChart",
				hasExport: true,
				expectedRoot: "/repo/node_modules/@nocoo/basalt",
				repoRoot: "/repo",
				fileSuffix: `${sep}dist${sep}charts${sep}donut.js`,
			}),
		).toThrow(/repository/);
		expect(() =>
			assertGranularResolution({
				spec: "@nocoo/basalt/charts/donut",
				resolved: "file:///tmp/consumer/node_modules/@nocoo/basalt/dist/charts/donut.js",
				real: "/tmp/consumer/node_modules/@nocoo/basalt/dist/charts/donut.js",
				exportName: "DonutChart",
				hasExport: false,
				expectedRoot: "/tmp/consumer/node_modules/@nocoo/basalt",
				repoRoot: "/repo",
				fileSuffix: `${sep}dist${sep}charts${sep}donut.js`,
			}),
		).toThrow(/named export/);
	});

	it("deletes a heavy temp tree on cleanup", async () => {
		const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-gate-d-")));
		await cleanupConsumerGate({ tempRoot });
		expect(existsSync(tempRoot)).toBe(false);
	});

	it("still requires the three named heavy exports", () => {
		expect(() =>
			assertHeavyConsumerSource(`import "@nocoo/basalt/charts/donut";
import "@nocoo/basalt/components/date-picker";
import "@nocoo/basalt/components/data-table";
import "@nocoo/basalt/styles/standalone";
`),
		).toThrow(/DonutChart/);
	});

	it("does not embed a developer home path in the heavy slice", () => {
		const needle = ["/Users", "nocoo"].join("/");
		const files = [
			"fixtures/vite-heavy/package.json",
			"fixtures/vite-heavy/src/main.tsx",
			"fixtures/vite-heavy/src/css.d.ts",
			"fixtures/vite-heavy/tsconfig.json",
			"fixtures/vite-heavy/vite.config.ts",
			"fixtures/vite-heavy/index.html",
			"packages/basalt/package.json",
			"packages/basalt/README.md",
		];
		for (const file of files) {
			expect(readFileSync(file, "utf8").includes(needle), file).toBe(false);
		}
	});
});

function heavySource() {
	return `import { DonutChart } from "@nocoo/basalt/charts/donut";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DataTable } from "@nocoo/basalt/components/data-table";
import "@nocoo/basalt/styles/standalone";
`;
}
