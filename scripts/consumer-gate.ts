import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const HEAVY_PEERS = [
	"tailwindcss",
	"recharts",
	"react-day-picker",
	"@tanstack/react-table",
] as const;

export const ROOT_EXPORTS = [
	"Button",
	"ThemeProvider",
	"ThemeToggle",
	"Toast",
	"LinkProvider",
] as const;

export type Manifest = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
};

export function posixPath(value: string) {
	return value.replace(/\\/g, "/");
}

export function isPathInside(parent: string, child: string) {
	const root = resolve(parent);
	const target = resolve(child);
	return target === root || target.startsWith(`${root}${sep}`);
}

export function isOutsideRepo(target: string, repoRoot: string) {
	return !isPathInside(repoRoot, target);
}

export function injectTarballDependency(manifest: Manifest, tarballPath: string): Manifest {
	const spec = `file:${resolve(tarballPath)}`;
	return {
		...manifest,
		dependencies: {
			...manifest.dependencies,
			"@nocoo/basalt": spec,
		},
	};
}

export function forbiddenInstallRefs(text: string, repoRoot: string) {
	const hits: string[] = [];
	if (text.includes("workspace:")) {
		hits.push("workspace:");
	}
	if (/(?:^|[\s"'=])link:/.test(text)) {
		hits.push("link:");
	}
	const repo = resolve(repoRoot);
	if (text.includes(repo)) {
		hits.push(repo);
	}
	return hits;
}

export function fileDependencyPaths(manifest: Manifest) {
	const specs = [
		...Object.values(manifest.dependencies ?? {}),
		...Object.values(manifest.devDependencies ?? {}),
		...Object.values(manifest.optionalDependencies ?? {}),
	];
	return specs
		.filter((value) => value.startsWith("file:"))
		.map((value) => value.slice("file:".length));
}

export function standaloneCssEvidence(css: string) {
	return {
		empty: css.trim().length === 0,
		token: css.includes("--basalt-background"),
		buttonClass: css.includes(".bg-basalt-primary"),
	};
}

export function distArtifactKinds(names: string[]) {
	return {
		html: names.some((name) => name.endsWith(".html")),
		js: names.some((name) => name.endsWith(".js")),
		css: names.some((name) => name.endsWith(".css")),
	};
}

export function findInstalledPackages(
	nodeModulesDir: string,
	names: readonly string[],
	exists: (path: string) => boolean = existsSync,
) {
	const wanted = new Set(names);
	const found = new Set<string>();
	const queue = [nodeModulesDir];
	while (queue.length > 0) {
		const dir = queue.shift();
		if (!dir || !exists(dir)) {
			continue;
		}
		let entries: string[] = [];
		try {
			entries = readdirSync(dir);
		} catch {
			continue;
		}
		for (const name of entries) {
			if (name === ".bin" || name === ".") {
				continue;
			}
			const path = join(dir, name);
			if (name.startsWith("@")) {
				let scoped: string[] = [];
				try {
					scoped = readdirSync(path);
				} catch {
					continue;
				}
				for (const child of scoped) {
					const spec = `${name}/${child}`;
					if (wanted.has(spec)) {
						found.add(spec);
					}
					queue.push(join(path, child, "node_modules"));
				}
				continue;
			}
			if (wanted.has(name)) {
				found.add(name);
			}
			queue.push(join(path, "node_modules"));
		}
	}
	return [...found].sort();
}

export function assertTemplateManifest(raw: string) {
	const hits = ["@nocoo/basalt", "workspace:", "link:"].filter((token) => raw.includes(token));
	if (hits.length > 0) {
		throw new Error(`fixture manifest contains ${hits.join(", ")}`);
	}
}

export type Tsconfig = {
	compilerOptions?: {
		moduleResolution?: string;
		noEmit?: boolean;
		skipLibCheck?: boolean;
		strict?: boolean;
	};
	include?: string[];
};

export function assertStandaloneTypecheckGate(tsconfigRaw: string, packageRaw: string) {
	const tsconfig = JSON.parse(tsconfigRaw) as Tsconfig;
	const options = tsconfig.compilerOptions ?? {};
	if (options.moduleResolution !== "bundler") {
		throw new Error("consumer tsconfig must use bundler moduleResolution");
	}
	if (options.noEmit !== true) {
		throw new Error("consumer tsconfig must set noEmit");
	}
	if (options.skipLibCheck !== false) {
		throw new Error("consumer tsconfig must set skipLibCheck false");
	}
	if (options.strict !== true) {
		throw new Error("consumer tsconfig must be strict");
	}
	const pkg = JSON.parse(packageRaw) as { scripts?: Record<string, string> };
	const typecheck = pkg.scripts?.typecheck ?? "";
	if (!typecheck.includes("tsc") || !typecheck.includes("tsconfig.json")) {
		throw new Error("consumer package must expose a tsc typecheck script");
	}
}

export function assertRootConsumerSource(source: string) {
	if (/@nocoo\/basalt\/(?:components|providers|charts)\//.test(source)) {
		throw new Error("consumer must not import granular paths");
	}
	if (source.includes("tailwind") || source.includes("@nocoo/basalt/styles/tailwind")) {
		throw new Error("standalone consumer must not import Tailwind");
	}
	if (!/from\s+"@nocoo\/basalt"/.test(source)) {
		throw new Error("consumer must import from @nocoo/basalt root");
	}
	if (!source.includes("@nocoo/basalt/styles/standalone")) {
		throw new Error("consumer must import standalone styles");
	}
	for (const name of ROOT_EXPORTS) {
		if (!source.includes(name)) {
			throw new Error(`consumer must use ${name}`);
		}
	}
}

function run(command: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv) {
	const result = spawnSync(command, args, {
		cwd,
		env: { ...process.env, NODE_PATH: "", ...env },
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
	if (result.status !== 0) {
		throw new Error(
			`${command} ${args.join(" ")} failed (${result.status}):\n${result.stdout}\n${result.stderr}`,
		);
	}
	return result;
}

function walkFiles(dir: string): string[] {
	if (!existsSync(dir)) {
		return [];
	}
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkFiles(path));
			continue;
		}
		files.push(path);
	}
	return files;
}

export function runStandaloneConsumerGate(repoRoot: string) {
	const packageRoot = join(repoRoot, "packages/basalt");
	const fixtureRoot = join(repoRoot, "fixtures/vite-standalone");
	assertTemplateManifest(readFileSync(join(fixtureRoot, "package.json"), "utf8"));
	assertRootConsumerSource(readFileSync(join(fixtureRoot, "src/main.tsx"), "utf8"));
	assertStandaloneTypecheckGate(
		readFileSync(join(fixtureRoot, "tsconfig.json"), "utf8"),
		readFileSync(join(fixtureRoot, "package.json"), "utf8"),
	);

	run("bun", ["run", "--cwd", "packages/basalt", "build"], repoRoot);

	const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-gate-b-")));
	if (!isOutsideRepo(tempRoot, realpathSync(repoRoot))) {
		rmSync(tempRoot, { recursive: true, force: true });
		throw new Error(`temp root is inside the repository: ${tempRoot}`);
	}

	try {
		run("npm", ["pack", "--pack-destination", tempRoot], packageRoot);
		const tarballs = readdirSync(tempRoot).filter((name) => name.endsWith(".tgz"));
		if (tarballs.length !== 1) {
			throw new Error(`expected one tarball, got ${tarballs.join(", ") || "(none)"}`);
		}
		const tarballPath = join(tempRoot, tarballs[0]);
		const consumerRoot = join(tempRoot, "consumer");
		cpSync(fixtureRoot, consumerRoot, { recursive: true });
		const manifest = JSON.parse(
			readFileSync(join(consumerRoot, "package.json"), "utf8"),
		) as Manifest;
		const injected = injectTarballDependency(manifest, tarballPath);
		writeFileSync(join(consumerRoot, "package.json"), `${JSON.stringify(injected, null, "\t")}\n`);
		const written = readFileSync(join(consumerRoot, "package.json"), "utf8");
		const manifestHits = forbiddenInstallRefs(written, realpathSync(repoRoot));
		if (manifestHits.length > 0) {
			throw new Error(`injected manifest contains ${manifestHits.join(", ")}`);
		}
		for (const fileDep of fileDependencyPaths(injected)) {
			if (!isOutsideRepo(fileDep, realpathSync(repoRoot))) {
				throw new Error(`file dependency points at the repository: ${fileDep}`);
			}
		}

		run("npm", ["install", "--no-fund", "--no-audit"], consumerRoot);

		const lockPath = join(consumerRoot, "package-lock.json");
		if (!existsSync(lockPath)) {
			throw new Error("npm install did not write package-lock.json");
		}
		const lockHits = forbiddenInstallRefs(readFileSync(lockPath, "utf8"), realpathSync(repoRoot));
		if (lockHits.length > 0) {
			throw new Error(`lockfile contains ${lockHits.join(", ")}`);
		}

		const nodeModules = join(consumerRoot, "node_modules");
		const heavy = findInstalledPackages(nodeModules, HEAVY_PEERS);
		if (heavy.length > 0) {
			throw new Error(`heavy peers installed: ${heavy.join(", ")}`);
		}

		const probe = run(
			"node",
			[
				"--input-type=module",
				"-e",
				`import { realpathSync } from "node:fs";
const resolved = import.meta.resolve("@nocoo/basalt");
const css = import.meta.resolve("@nocoo/basalt/styles/standalone");
const real = realpathSync(new URL(resolved));
const cssReal = realpathSync(new URL(css));
console.log(JSON.stringify({ resolved, real, css, cssReal }));`,
			],
			consumerRoot,
		);
		const resolution = JSON.parse(probe.stdout.trim()) as {
			resolved: string;
			real: string;
			css: string;
			cssReal: string;
		};
		const expectedRoot = realpathSync(join(nodeModules, "@nocoo/basalt"));
		const resolvedPath = fileURLToPath(new URL(resolution.resolved));
		const realPath = realpathSync(resolution.real);
		const cssPath = fileURLToPath(new URL(resolution.css));
		const cssReal = realpathSync(resolution.cssReal);
		if (!isPathInside(expectedRoot, resolvedPath) || !isPathInside(expectedRoot, realPath)) {
			throw new Error(
				`@nocoo/basalt resolved outside consumer node_modules: resolved=${resolution.resolved} real=${realPath}`,
			);
		}
		if (!isPathInside(expectedRoot, cssPath) || !isPathInside(expectedRoot, cssReal)) {
			throw new Error(
				`standalone CSS resolved outside consumer node_modules: css=${resolution.css} real=${cssReal}`,
			);
		}
		if (!cssReal.endsWith(`${sep}dist${sep}styles${sep}standalone.css`)) {
			throw new Error(`standalone CSS did not resolve to tarball css: ${cssReal}`);
		}
		if (
			isPathInside(realpathSync(repoRoot), realPath) ||
			isPathInside(realpathSync(repoRoot), resolvedPath) ||
			isPathInside(realpathSync(repoRoot), cssReal)
		) {
			throw new Error("@nocoo/basalt resolved into the repository");
		}

		const typecheck = run("npm", ["run", "typecheck"], consumerRoot);
		run("npm", ["run", "build"], consumerRoot);

		const distRoot = join(consumerRoot, "dist");
		const distFiles = walkFiles(distRoot);
		const kinds = distArtifactKinds(distFiles);
		if (!kinds.html || !kinds.js || !kinds.css) {
			throw new Error(
				`production dist missing artifacts html=${kinds.html} js=${kinds.js} css=${kinds.css}`,
			);
		}
		const cssFiles = distFiles.filter((file) => file.endsWith(".css"));
		const css = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");
		const cssEvidence = standaloneCssEvidence(css);
		if (cssEvidence.empty || !cssEvidence.token || !cssEvidence.buttonClass) {
			throw new Error(
				`standalone CSS evidence failed empty=${cssEvidence.empty} token=${cssEvidence.token} buttonClass=${cssEvidence.buttonClass}`,
			);
		}

		const evidence = {
			tempRoot,
			tarball: tarballs[0],
			resolved: resolution.resolved,
			realpath: realPath,
			css: resolution.css,
			cssReal,
			typecheck: typecheck.stdout.trim() || "ok",
			distFiles: distFiles.map((file) => posixPath(relative(distRoot, file))).sort(),
			cssBytes: Buffer.byteLength(css),
			cssEvidence,
			missingHeavyPeers: HEAVY_PEERS.filter((name) => !heavy.includes(name)),
		};
		console.log(`consumer standalone ok ${JSON.stringify(evidence, null, 2)}`);
		return evidence;
	} finally {
		rmSync(tempRoot, { recursive: true, force: true });
	}
}

if (import.meta.main) {
	const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
	runStandaloneConsumerGate(repoRoot);
}
