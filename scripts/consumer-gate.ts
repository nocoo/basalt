import { type ChildProcess, spawnSync } from "node:child_process";
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
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSync } from "@swc/core";
import {
	assertBrowserCleaned,
	combineErrors,
	createBrowserProfileDir,
	proveNextHydration,
	settleWithCleanup,
} from "./consumer-browser";
import {
	allocatePort,
	assertNextHttpBody,
	assertServerCleaned,
	NEXT_HTTP_MARKER,
	nextStartLaunch,
	startHttpServer,
	stopChild,
} from "./consumer-http";

export const HEAVY_PEERS = [
	"tailwindcss",
	"recharts",
	"react-day-picker",
	"@tanstack/react-table",
] as const;

export const OPTIONAL_HEAVY_PEERS = [
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

export type ConsumerMode = "standalone" | "tailwind" | "next" | "heavy";

export type Manifest = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

export type ConsumerGateConfig = {
	mode: ConsumerMode;
	fixtureDir: string;
	tempPrefix: string;
	styleExport: string;
	cssFileSuffix: string;
	requiredPeers: Readonly<Record<string, string>>;
	forbiddenPeers: readonly string[];
	entryFile: string;
	stylesheet?: string;
	layoutFile?: string;
	pageFile?: string;
	httpMarker?: string;
};

export const STANDALONE_GATE: ConsumerGateConfig = {
	mode: "standalone",
	fixtureDir: "fixtures/vite-standalone",
	tempPrefix: "basalt-gate-b-",
	styleExport: "@nocoo/basalt/styles/standalone",
	cssFileSuffix: `${sep}dist${sep}styles${sep}standalone.css`,
	requiredPeers: {},
	forbiddenPeers: HEAVY_PEERS,
	entryFile: "src/main.tsx",
};

export const TAILWIND_GATE: ConsumerGateConfig = {
	mode: "tailwind",
	fixtureDir: "fixtures/vite-tailwind",
	tempPrefix: "basalt-gate-a-",
	styleExport: "@nocoo/basalt/styles/tailwind",
	cssFileSuffix: `${sep}dist${sep}styles${sep}tailwind.css`,
	requiredPeers: { tailwindcss: "4.3.3", "@tailwindcss/vite": "4.3.3" },
	forbiddenPeers: OPTIONAL_HEAVY_PEERS,
	entryFile: "src/main.tsx",
	stylesheet: "src/index.css",
};

export const NEXT_GATE: ConsumerGateConfig = {
	mode: "next",
	fixtureDir: "fixtures/next19",
	tempPrefix: "basalt-gate-c-",
	styleExport: "@nocoo/basalt/styles/standalone",
	cssFileSuffix: `${sep}dist${sep}styles${sep}standalone.css`,
	requiredPeers: {},
	forbiddenPeers: HEAVY_PEERS,
	entryFile: "app/basalt-app.tsx",
	layoutFile: "app/layout.tsx",
	pageFile: "app/page.tsx",
	httpMarker: NEXT_HTTP_MARKER,
};

export const HEAVY_OPTIONAL_PEERS = {
	recharts: "^3",
	"react-day-picker": "^10",
	"@tanstack/react-table": "^9",
} as const;

export const HEAVY_CONSUMER_VERSIONS = {
	recharts: "3.10.1",
	"react-day-picker": "10.0.1",
	"@tanstack/react-table": "9.1.2",
} as const;

export const HEAVY_SOURCE_SPECIFIERS = [
	"@nocoo/basalt/charts/donut",
	"@nocoo/basalt/components/date-picker",
	"@nocoo/basalt/components/data-table",
	"@nocoo/basalt/styles/standalone",
] as const;

export const HEAVY_GRANULAR_PROBES = [
	{
		spec: "@nocoo/basalt/charts/donut",
		exportName: "DonutChart",
		fileSuffix: `${sep}dist${sep}charts${sep}donut.js`,
	},
	{
		spec: "@nocoo/basalt/components/date-picker",
		exportName: "DatePicker",
		fileSuffix: `${sep}dist${sep}components${sep}date-picker.js`,
	},
	{
		spec: "@nocoo/basalt/components/data-table",
		exportName: "DataTable",
		fileSuffix: `${sep}dist${sep}components${sep}data-table.js`,
	},
] as const;

export const HEAVY_GATE: ConsumerGateConfig = {
	mode: "heavy",
	fixtureDir: "fixtures/vite-heavy",
	tempPrefix: "basalt-gate-d-",
	styleExport: "@nocoo/basalt/styles/standalone",
	cssFileSuffix: `${sep}dist${sep}styles${sep}standalone.css`,
	requiredPeers: HEAVY_CONSUMER_VERSIONS,
	forbiddenPeers: ["tailwindcss"],
	entryFile: "src/main.tsx",
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

export function tailwindCssEvidence(css: string) {
	const base = standaloneCssEvidence(css);
	return {
		...base,
		buttonUtility: css.includes(".text-basalt-primary-foreground"),
		standaloneDump: css.includes("Generated from standalone.source.css"),
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

export function assertOptionalPeerMetadata(manifest: Manifest) {
	const peers = manifest.peerDependencies ?? {};
	const meta = manifest.peerDependenciesMeta ?? {};
	for (const [name, range] of Object.entries(HEAVY_OPTIONAL_PEERS)) {
		if (peers[name] !== range) {
			throw new Error(`optional peer ${name} must be ${range}`);
		}
		if (meta[name]?.optional !== true) {
			throw new Error(`${name} must be an optional peer`);
		}
	}
}

export function assertExactVersion(name: string, actual: string, expected: string) {
	if (actual !== expected) {
		throw new Error(`${name} version ${actual} does not match fixture ${expected}`);
	}
}

type SwcNode = {
	type?: string;
	[key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object";
}

function swcType(node: unknown): string | undefined {
	if (isRecord(node) && typeof node.type === "string") {
		return node.type;
	}
}

function swcString(node: unknown, key: string): string | undefined {
	if (isRecord(node) && typeof node[key] === "string") {
		return node[key];
	}
}

function identifierName(node: unknown): string | undefined {
	const type = swcType(node);
	if (type === "Identifier" || type === "JSXIdentifier") {
		return swcString(node, "value");
	}
}

function literalModuleSpecifier(node: unknown): string | undefined {
	const type = swcType(node);
	if (type === "StringLiteral") {
		return swcString(node, "value");
	}
	if (type === "TemplateLiteral" && isRecord(node)) {
		const expressions = node.expressions;
		const quasis = node.quasis;
		if (Array.isArray(expressions) && expressions.length === 0 && Array.isArray(quasis)) {
			return swcString(quasis[0], "cooked");
		}
	}
}

function isBasaltModule(specifier: string): boolean {
	return specifier === "@nocoo/basalt" || specifier.startsWith("@nocoo/basalt/");
}

function walkSwc(node: unknown, visit: (node: SwcNode) => void): void {
	if (!node || typeof node !== "object") {
		return;
	}
	if (Array.isArray(node)) {
		for (const item of node) {
			walkSwc(item, visit);
		}
		return;
	}
	const current = node as SwcNode;
	if (typeof current.type === "string") {
		visit(current);
	}
	for (const value of Object.values(current)) {
		walkSwc(value, visit);
	}
}

const HEAVY_BINDING_NAMES = new Set(HEAVY_GRANULAR_PROBES.map((probe) => probe.exportName));
const WALK_SKIP_KEYS = new Set([
	"span",
	"ctxt",
	"typeAnnotation",
	"returnType",
	"typeParameters",
	"typeArguments",
	"typeParams",
	"decorators",
]);

function parseHeavyTsx(source: string): SwcNode {
	try {
		return parseSync(source, { syntax: "typescript", tsx: true }) as SwcNode;
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(`heavy consumer has syntax errors: ${detail}`);
	}
}

function addLocalBinding(locals: Set<string>, name: string | undefined) {
	if (name && HEAVY_BINDING_NAMES.has(name)) {
		locals.add(name);
	}
}

function collectPatternNames(node: unknown, names: Set<string>): void {
	const type = swcType(node);
	if (!type || !isRecord(node)) {
		return;
	}
	if (type === "Identifier" || type === "JSXIdentifier") {
		const name = identifierName(node);
		if (name) {
			names.add(name);
		}
		return;
	}
	if (type === "Parameter" || type === "TsParameterProperty") {
		collectPatternNames(node.pat ?? node.parameter, names);
		return;
	}
	if (type === "AssignmentPattern") {
		collectPatternNames(node.left, names);
		return;
	}
	if (type === "RestElement") {
		collectPatternNames(node.argument, names);
		return;
	}
	if (type === "ObjectPattern" && Array.isArray(node.properties)) {
		for (const property of node.properties) {
			collectPatternNames(property, names);
		}
		return;
	}
	if (type === "ArrayPattern" && Array.isArray(node.elements)) {
		for (const element of node.elements) {
			collectPatternNames(element, names);
		}
		return;
	}
	if (type === "AssignmentPatternProperty") {
		collectPatternNames(node.key, names);
		return;
	}
	if (type === "KeyValuePatternProperty") {
		collectPatternNames(node.value, names);
	}
}

function addPatternBindings(locals: Set<string>, node: unknown) {
	const names = new Set<string>();
	collectPatternNames(node, names);
	for (const name of names) {
		addLocalBinding(locals, name);
	}
}

function collectLocalsAndJsx(node: unknown, locals: Set<string>, jsxNames: Set<string>): void {
	if (!node || typeof node !== "object") {
		return;
	}
	if (Array.isArray(node)) {
		for (const item of node) {
			collectLocalsAndJsx(item, locals, jsxNames);
		}
		return;
	}
	if (!isRecord(node)) {
		return;
	}
	const type = swcType(node);
	if (!type) {
		for (const value of Object.values(node)) {
			collectLocalsAndJsx(value, locals, jsxNames);
		}
		return;
	}
	if (type === "ImportDeclaration") {
		return;
	}
	if (type === "JSXOpeningElement") {
		const name = identifierName(node.name);
		if (name && HEAVY_BINDING_NAMES.has(name)) {
			jsxNames.add(name);
		}
		collectLocalsAndJsx(node.attributes, locals, jsxNames);
		return;
	}
	if (
		type === "FunctionDeclaration" ||
		type === "FunctionExpression" ||
		type === "ClassDeclaration" ||
		type === "ClassExpression"
	) {
		addLocalBinding(locals, identifierName(node.identifier));
	}
	if (type === "ArrowFunctionExpression" && Array.isArray(node.params)) {
		for (const param of node.params) {
			addPatternBindings(locals, param);
		}
	}
	if (type === "VariableDeclarator") {
		addPatternBindings(locals, node.id);
	}
	if (type === "Parameter" || type === "TsParameterProperty") {
		addPatternBindings(locals, node);
	}
	if (type === "CatchClause") {
		addPatternBindings(locals, node.param);
	}
	for (const [key, value] of Object.entries(node)) {
		if (WALK_SKIP_KEYS.has(key)) {
			continue;
		}
		collectLocalsAndJsx(value, locals, jsxNames);
	}
}

type HeavyAstEvidence = {
	specifiers: string[];
	imports: SwcNode[];
	jsxNames: Set<string>;
	localBindings: Set<string>;
	dynamicModules: string[];
	requireModules: string[];
};

function collectHeavyAst(source: string): HeavyAstEvidence {
	const file = parseHeavyTsx(source);
	const specifiers: string[] = [];
	const imports: SwcNode[] = [];
	const dynamicModules: string[] = [];
	const requireModules: string[] = [];
	walkSwc(file, (node) => {
		if (
			node.type === "ImportDeclaration" ||
			node.type === "ExportNamedDeclaration" ||
			node.type === "ExportAllDeclaration"
		) {
			const spec = literalModuleSpecifier(node.source);
			if (spec && isBasaltModule(spec)) {
				specifiers.push(spec);
			}
			if (node.type === "ImportDeclaration") {
				imports.push(node);
			}
		}
		if (node.type === "CallExpression") {
			const args = Array.isArray(node.arguments) ? node.arguments : [];
			const first = args[0];
			const spec = literalModuleSpecifier(isRecord(first) ? first.expression : undefined);
			if (spec && isBasaltModule(spec)) {
				const calleeType = swcType(node.callee);
				if (calleeType === "Import") {
					dynamicModules.push(spec);
				} else if (calleeType === "Identifier" && swcString(node.callee, "value") === "require") {
					requireModules.push(spec);
				}
			}
		}
		if (node.type === "TsImportEqualsDeclaration") {
			const moduleRef = node.moduleRef;
			if (swcType(moduleRef) === "TsExternalModuleReference" && isRecord(moduleRef)) {
				const spec = literalModuleSpecifier(moduleRef.expression);
				if (spec && isBasaltModule(spec)) {
					requireModules.push(spec);
				}
			}
		}
	});
	const localBindings = new Set<string>();
	const jsxNames = new Set<string>();
	collectLocalsAndJsx(file.body, localBindings, jsxNames);
	return { specifiers, imports, jsxNames, localBindings, dynamicModules, requireModules };
}

function importSource(decl: SwcNode): string | undefined {
	return literalModuleSpecifier(decl.source);
}

function namedImportKind(decl: SwcNode, expectedName: string): "ok" | "alias" | "missing" {
	if (decl.typeOnly === true) {
		return "missing";
	}
	const specifiers = Array.isArray(decl.specifiers) ? decl.specifiers : [];
	if (specifiers.length !== 1 || swcType(specifiers[0]) !== "ImportSpecifier") {
		return "missing";
	}
	const spec = specifiers[0];
	if (!isRecord(spec) || spec.isTypeOnly === true) {
		return "missing";
	}
	const local = identifierName(spec.local);
	const imported = spec.imported == null ? local : identifierName(spec.imported);
	if (imported !== expectedName) {
		return "missing";
	}
	if (spec.imported != null || local !== expectedName) {
		return "alias";
	}
	return "ok";
}

function isSideEffectImport(decl: SwcNode): boolean {
	if (decl.typeOnly === true) {
		return false;
	}
	const specifiers = Array.isArray(decl.specifiers) ? decl.specifiers : [];
	return specifiers.length === 0;
}

export function staticBasaltSpecifiers(source: string): string[] {
	return collectHeavyAst(source).specifiers;
}

export function assertHeavyConsumerSource(source: string) {
	const evidence = collectHeavyAst(source);
	const approved = new Set<string>(HEAVY_SOURCE_SPECIFIERS);
	const counts = new Map<string, number>();
	for (const spec of evidence.specifiers) {
		counts.set(spec, (counts.get(spec) ?? 0) + 1);
		if (!approved.has(spec)) {
			if (spec === "@nocoo/basalt") {
				throw new Error("heavy consumer must not import the package root");
			}
			throw new Error(`heavy consumer has extra specifier ${spec}`);
		}
	}
	for (const spec of HEAVY_SOURCE_SPECIFIERS) {
		const count = counts.get(spec) ?? 0;
		if (count === 0) {
			throw new Error(`heavy consumer missing specifier ${spec}`);
		}
		if (count !== 1) {
			throw new Error(`heavy consumer duplicate specifier ${spec}`);
		}
	}
	if (evidence.dynamicModules[0]) {
		throw new Error(`heavy consumer has dynamic import of ${evidence.dynamicModules[0]}`);
	}
	if (evidence.requireModules[0]) {
		throw new Error(`heavy consumer has require of ${evidence.requireModules[0]}`);
	}
	for (const probe of HEAVY_GRANULAR_PROBES) {
		const decl = evidence.imports.find((node) => importSource(node) === probe.spec);
		const kind = decl ? namedImportKind(decl, probe.exportName) : "missing";
		if (kind === "alias") {
			throw new Error(`heavy consumer aliased named import ${probe.exportName}`);
		}
		if (kind !== "ok") {
			throw new Error(`heavy consumer missing named import ${probe.exportName}`);
		}
	}
	const standalone = evidence.imports.find((node) => importSource(node) === HEAVY_GATE.styleExport);
	if (!standalone || !isSideEffectImport(standalone)) {
		throw new Error(`heavy consumer must side-effect import ${HEAVY_GATE.styleExport}`);
	}
	for (const probe of HEAVY_GRANULAR_PROBES) {
		if (evidence.localBindings.has(probe.exportName)) {
			throw new Error(`heavy consumer shadows ${probe.exportName}`);
		}
		if (!evidence.jsxNames.has(probe.exportName)) {
			throw new Error(`heavy consumer does not render ${probe.exportName}`);
		}
	}
}

export function assertGranularResolution(options: {
	spec: string;
	resolved: string;
	real: string;
	exportName: string;
	hasExport: boolean;
	expectedRoot: string;
	repoRoot: string;
	fileSuffix: string;
}) {
	if (!options.hasExport) {
		throw new Error(`missing named export ${options.exportName} from ${options.spec}`);
	}
	const resolvedPath = fileURLToPath(new URL(options.resolved));
	const realPath = resolve(options.real);
	if (
		!isPathInside(options.expectedRoot, resolvedPath) ||
		!isPathInside(options.expectedRoot, realPath)
	) {
		throw new Error(
			`${options.spec} resolved outside consumer node_modules: resolved=${options.resolved} real=${realPath}`,
		);
	}
	if (isPathInside(options.repoRoot, realPath) || isPathInside(options.repoRoot, resolvedPath)) {
		throw new Error(`${options.spec} resolved into the repository`);
	}
	if (!realPath.endsWith(options.fileSuffix)) {
		throw new Error(`${options.spec} did not resolve to tarball file: ${realPath}`);
	}
}

export function assertRootConsumerSource(source: string, mode: ConsumerMode = "standalone") {
	if (mode === "heavy") {
		assertHeavyConsumerSource(source);
		return;
	}
	if (/@nocoo\/basalt\/(?:components|providers|charts)\//.test(source)) {
		throw new Error("consumer must not import granular paths");
	}
	if (mode === "standalone") {
		if (source.includes("tailwind") || source.includes("@nocoo/basalt/styles/tailwind")) {
			throw new Error("standalone consumer must not import Tailwind");
		}
		if (!/from\s+"@nocoo\/basalt"/.test(source)) {
			throw new Error("consumer must import from @nocoo/basalt root");
		}
		if (!source.includes("@nocoo/basalt/styles/standalone")) {
			throw new Error("consumer must import standalone styles");
		}
	} else if (mode === "tailwind") {
		if (source.includes("@nocoo/basalt/styles/")) {
			throw new Error("tailwind consumer must not import package styles from main");
		}
		if (/\bstandalone\b/.test(source)) {
			throw new Error("tailwind consumer must not import standalone");
		}
		if (!/from\s+"@nocoo\/basalt"/.test(source)) {
			throw new Error("consumer must import from @nocoo/basalt root");
		}
		if (!source.includes("./index.css")) {
			throw new Error("tailwind consumer must import ./index.css");
		}
	} else {
		if (!source.includes('"use client"')) {
			throw new Error("next client boundary must be explicit");
		}
		if (source.includes("tailwind") || source.includes("@nocoo/basalt/styles/")) {
			throw new Error("next client boundary must not import package styles");
		}
		if (!/from\s+"@nocoo\/basalt"/.test(source)) {
			throw new Error("consumer must import from @nocoo/basalt root");
		}
		if (!/\btoast\b/.test(source)) {
			throw new Error("next client boundary must import toast");
		}
		if (!source.includes("data-basalt-root")) {
			throw new Error("next client boundary must mark the app root");
		}
	}
	for (const name of ROOT_EXPORTS) {
		if (!source.includes(name)) {
			throw new Error(`consumer must use ${name}`);
		}
	}
}

export function assertNoSuppressHydrationWarning(source: string) {
	if (source.includes("suppressHydrationWarning")) {
		throw new Error("consumer must not suppress hydration warnings");
	}
}

export function assertNextLayout(source: string) {
	assertNoSuppressHydrationWarning(source);
	if (source.includes('"use client"')) {
		throw new Error("next layout must stay on the server");
	}
	if (/@nocoo\/basalt\/(?:components|providers|charts)\//.test(source)) {
		throw new Error("consumer must not import granular paths");
	}
	if (source.includes("tailwind") || source.includes("@nocoo/basalt/styles/tailwind")) {
		throw new Error("next layout must not import Tailwind");
	}
	if (!source.includes("@nocoo/basalt/styles/standalone")) {
		throw new Error("next layout must import standalone styles");
	}
	if (/from\s+"@nocoo\/basalt"/.test(source)) {
		throw new Error("next layout must not import the package root");
	}
	if (!source.includes("<html") || !source.includes("<body")) {
		throw new Error("next layout must render html and body");
	}
}

export function assertNextPage(source: string, marker: string) {
	assertNoSuppressHydrationWarning(source);
	if (!source.includes(marker)) {
		throw new Error(`next page must include HTTP marker ${marker}`);
	}
}

export async function assertHttpClosed(url: string) {
	try {
		const response = await fetch(url);
		throw new Error(`expected closed server, got HTTP ${response.status} for ${url}`);
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("expected closed server")) {
			throw error;
		}
	}
}

export const TARBALL_SOURCE_GLOB = "../node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}";
const TARBALL_SOURCE_PATTERN = "/**/*.{js,jsx,ts,tsx}";

export type SourceContext = {
	fromDir: string;
	consumerRoot: string;
};

export function consumerSourceGlobs(css: string) {
	return [...css.matchAll(/@source\s+["']([^"']+)["']/g)].map((match) => match[1]);
}

export function splitSourceGlob(glob: string) {
	const posix = posixPath(glob);
	const star = posix.indexOf("/**");
	if (star < 0) {
		return { dir: posix, pattern: "" };
	}
	return { dir: posix.slice(0, star), pattern: posix.slice(star) };
}

export function assertTarballDistSource(globs: string[], context: SourceContext) {
	if (globs.length === 0) {
		throw new Error("missing @source");
	}
	if (globs.length !== 1) {
		throw new Error("extra @source");
	}
	const glob = posixPath(globs[0]);
	if (!glob.startsWith(".")) {
		throw new Error(`@source must be relative: ${glob}`);
	}
	const { dir, pattern } = splitSourceGlob(glob);
	if (pattern !== TARBALL_SOURCE_PATTERN) {
		throw new Error(`@source glob must scan dist js/ts: ${glob}`);
	}
	const expectedDist = resolve(context.consumerRoot, "node_modules/@nocoo/basalt/dist");
	const resolved = resolve(context.fromDir, dir);
	if (resolved !== expectedDist) {
		throw new Error(`@source must resolve to tarball dist, got ${resolved}`);
	}
}

export function packageStyleImportCount(css: string) {
	return [...css.matchAll(/@import\s+["']@nocoo\/basalt\/styles\/tailwind["']/g)].length;
}

export function assertTailwindStylesheet(css: string, context: SourceContext) {
	assertTarballDistSource(consumerSourceGlobs(css), context);
	if (css.includes("standalone")) {
		throw new Error("tailwind stylesheet must not import standalone");
	}
	const styleImports = packageStyleImportCount(css);
	if (styleImports === 0) {
		throw new Error("tailwind stylesheet must import @nocoo/basalt/styles/tailwind");
	}
	if (styleImports !== 1) {
		throw new Error("tailwind stylesheet must import @nocoo/basalt/styles/tailwind once");
	}
	if (!css.includes('@import "tailwindcss"') && !css.includes("@import 'tailwindcss'")) {
		throw new Error("tailwind stylesheet must import tailwindcss");
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

function installedVersion(nodeModules: string, name: string) {
	const pkg = join(nodeModules, ...name.split("/"), "package.json");
	if (!existsSync(pkg)) {
		throw new Error(`required package missing: ${name}`);
	}
	return (JSON.parse(readFileSync(pkg, "utf8")) as { version?: string }).version ?? "";
}

function assertFixtureSources(fixtureRoot: string, config: ConsumerGateConfig) {
	assertTemplateManifest(readFileSync(join(fixtureRoot, "package.json"), "utf8"));
	assertRootConsumerSource(readFileSync(join(fixtureRoot, config.entryFile), "utf8"), config.mode);
	assertStandaloneTypecheckGate(
		readFileSync(join(fixtureRoot, "tsconfig.json"), "utf8"),
		readFileSync(join(fixtureRoot, "package.json"), "utf8"),
	);
	if (config.layoutFile) {
		assertNextLayout(readFileSync(join(fixtureRoot, config.layoutFile), "utf8"));
	}
	if (config.pageFile && config.httpMarker) {
		assertNextPage(readFileSync(join(fixtureRoot, config.pageFile), "utf8"), config.httpMarker);
	}
	for (const file of walkFiles(fixtureRoot).filter((path) => /\.(tsx|ts|jsx|js)$/.test(path))) {
		assertNoSuppressHydrationWarning(readFileSync(file, "utf8"));
	}
	if (config.stylesheet) {
		assertTailwindStylesheet(readFileSync(join(fixtureRoot, config.stylesheet), "utf8"), {
			fromDir: join(fixtureRoot, "src"),
			consumerRoot: fixtureRoot,
		});
	}
}

export async function cleanupConsumerGate(options: {
	profileDir?: string;
	child?: ChildProcess;
	nextUrl?: string;
	tempRoot: string;
}) {
	const errors: unknown[] = [];
	try {
		if (options.profileDir) {
			rmSync(options.profileDir, { recursive: true, force: true });
			assertBrowserCleaned(options.profileDir);
		}
	} catch (error) {
		errors.push(error);
	} finally {
		try {
			if (options.child) {
				await stopChild(options.child);
			}
		} catch (error) {
			errors.push(error);
		} finally {
			try {
				assertServerCleaned(options.child?.pid, [options.tempRoot, basename(options.tempRoot)]);
				if (options.nextUrl) {
					await assertHttpClosed(options.nextUrl);
				}
			} catch (error) {
				errors.push(error);
			} finally {
				try {
					rmSync(options.tempRoot, { recursive: true, force: true });
					if (existsSync(options.tempRoot)) {
						errors.push(new Error(`temp still exists: ${options.tempRoot}`));
					}
				} catch (error) {
					errors.push(error);
				}
			}
		}
	}
	if (errors.length > 0) {
		throw errors.slice(1).reduce((acc, error) => combineErrors(acc, error), errors[0]);
	}
}

export async function runConsumerGate(repoRoot: string, config: ConsumerGateConfig) {
	const packageRoot = join(repoRoot, "packages/basalt");
	const fixtureRoot = join(repoRoot, config.fixtureDir);
	assertFixtureSources(fixtureRoot, config);

	run("bun", ["run", "--cwd", "packages/basalt", "build"], repoRoot);

	const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), config.tempPrefix)));
	if (!isOutsideRepo(tempRoot, realpathSync(repoRoot))) {
		rmSync(tempRoot, { recursive: true, force: true });
		throw new Error(`temp root is inside the repository: ${tempRoot}`);
	}

	let child: ChildProcess | undefined;
	let profileDir: string | undefined;
	let nextUrl: string | undefined;
	return settleWithCleanup(
		async () => {
			run("npm", ["pack", "--pack-destination", tempRoot], packageRoot);
			const tarballs = readdirSync(tempRoot).filter((name) => name.endsWith(".tgz"));
			if (tarballs.length !== 1) {
				throw new Error(`expected one tarball, got ${tarballs.join(", ") || "(none)"}`);
			}
			const tarballPath = join(tempRoot, tarballs[0]);
			const consumerRoot = join(tempRoot, "consumer");
			cpSync(fixtureRoot, consumerRoot, { recursive: true });
			if (config.stylesheet) {
				assertTailwindStylesheet(readFileSync(join(consumerRoot, config.stylesheet), "utf8"), {
					fromDir: join(consumerRoot, "src"),
					consumerRoot,
				});
			}
			const manifest = JSON.parse(
				readFileSync(join(consumerRoot, "package.json"), "utf8"),
			) as Manifest;
			const injected = injectTarballDependency(manifest, tarballPath);
			writeFileSync(
				join(consumerRoot, "package.json"),
				`${JSON.stringify(injected, null, "\t")}\n`,
			);
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
			const heavy = findInstalledPackages(nodeModules, config.forbiddenPeers);
			if (heavy.length > 0) {
				throw new Error(`heavy peers installed: ${heavy.join(", ")}`);
			}
			const requiredVersions: Record<string, string> = {};
			for (const [name, version] of Object.entries(config.requiredPeers)) {
				const actual = installedVersion(nodeModules, name);
				assertExactVersion(name, actual, version);
				requiredVersions[name] = actual;
			}

			const probe = run(
				"node",
				[
					"--input-type=module",
					"-e",
					`import { realpathSync } from "node:fs";
const resolved = import.meta.resolve("@nocoo/basalt");
const css = import.meta.resolve(${JSON.stringify(config.styleExport)});
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
					`style export resolved outside consumer node_modules: css=${resolution.css} real=${cssReal}`,
				);
			}
			if (!cssReal.endsWith(config.cssFileSuffix)) {
				throw new Error(`style export did not resolve to tarball css: ${cssReal}`);
			}
			if (
				isPathInside(realpathSync(repoRoot), realPath) ||
				isPathInside(realpathSync(repoRoot), resolvedPath) ||
				isPathInside(realpathSync(repoRoot), cssReal)
			) {
				throw new Error("@nocoo/basalt resolved into the repository");
			}

			const granular: Array<Record<string, unknown>> = [];
			if (config.mode === "heavy") {
				assertOptionalPeerMetadata(
					JSON.parse(readFileSync(join(expectedRoot, "package.json"), "utf8")) as Manifest,
				);
				for (const item of HEAVY_GRANULAR_PROBES) {
					const probeOut = run(
						"node",
						[
							"--input-type=module",
							"-e",
							`import { realpathSync } from "node:fs";
const spec = ${JSON.stringify(item.spec)};
const resolved = import.meta.resolve(spec);
const mod = await import(spec);
const real = realpathSync(new URL(resolved));
console.log(JSON.stringify({
  spec,
  resolved,
  real,
  hasExport: ${JSON.stringify(item.exportName)} in mod,
  exportType: typeof mod[${JSON.stringify(item.exportName)}],
}));`,
						],
						consumerRoot,
					);
					const parsed = JSON.parse(probeOut.stdout.trim()) as {
						spec: string;
						resolved: string;
						real: string;
						hasExport: boolean;
						exportType: string;
					};
					assertGranularResolution({
						spec: item.spec,
						resolved: parsed.resolved,
						real: parsed.real,
						exportName: item.exportName,
						hasExport: parsed.hasExport && parsed.exportType === "function",
						expectedRoot,
						repoRoot: realpathSync(repoRoot),
						fileSuffix: item.fileSuffix,
					});
					granular.push(parsed);
				}
			}

			const typecheck = run("npm", ["run", "typecheck"], consumerRoot);
			run("npm", ["run", "build"], consumerRoot);

			const evidence: Record<string, unknown> = {
				mode: config.mode,
				tempRoot,
				tarball: tarballs[0],
				resolved: resolution.resolved,
				realpath: realPath,
				css: resolution.css,
				cssReal,
				typecheck: typecheck.stdout.trim() || "ok",
				requiredVersions,
				missingHeavyPeers: config.forbiddenPeers.filter((name) => !heavy.includes(name)),
				...(granular.length > 0 ? { granular } : {}),
			};

			if (config.mode === "next" && config.httpMarker) {
				const port = await allocatePort();
				const url = `http://127.0.0.1:${port}/`;
				nextUrl = url;
				const launch = nextStartLaunch(consumerRoot, port);
				const started = await startHttpServer({
					cwd: consumerRoot,
					command: launch.command,
					args: launch.args,
					url,
					env: { PORT: String(port) },
					needles: [tempRoot, basename(tempRoot)],
				});
				child = started.child;
				const body = await started.response.text();
				assertNextHttpBody(started.response.status, body, config.httpMarker);
				profileDir = createBrowserProfileDir();
				const hydration = await proveNextHydration(url, profileDir);
				evidence.port = port;
				evidence.httpStatus = started.response.status;
				evidence.marker = true;
				evidence.launch = `${launch.command} ${launch.args[0]}`;
				evidence.hydration = hydration;
			} else {
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
				const cssEvidence =
					config.mode === "tailwind" ? tailwindCssEvidence(css) : standaloneCssEvidence(css);
				if (cssEvidence.empty || !cssEvidence.token || !cssEvidence.buttonClass) {
					throw new Error(
						`${config.mode} CSS evidence failed empty=${cssEvidence.empty} token=${cssEvidence.token} buttonClass=${cssEvidence.buttonClass}`,
					);
				}
				if ("buttonUtility" in cssEvidence && !cssEvidence.buttonUtility) {
					throw new Error("tailwind CSS missing Button utility .text-basalt-primary-foreground");
				}
				if ("standaloneDump" in cssEvidence && cssEvidence.standaloneDump) {
					throw new Error("tailwind CSS is a standalone dump");
				}
				evidence.distFiles = distFiles.map((file) => posixPath(relative(distRoot, file))).sort();
				evidence.cssBytes = Buffer.byteLength(css);
				evidence.cssEvidence = cssEvidence;
			}

			console.log(`consumer ${config.mode} ok ${JSON.stringify(evidence, null, 2)}`);
			return evidence;
		},
		async () => {
			await cleanupConsumerGate({ profileDir, child, nextUrl, tempRoot });
		},
	);
}

export function runStandaloneConsumerGate(repoRoot: string) {
	return runConsumerGate(repoRoot, STANDALONE_GATE);
}

export function gateConfigFromArgv(argv: string[]) {
	if (argv.includes("next")) {
		return NEXT_GATE;
	}
	if (argv.includes("tailwind")) {
		return TAILWIND_GATE;
	}
	if (argv.includes("heavy")) {
		return HEAVY_GATE;
	}
	return STANDALONE_GATE;
}

if (import.meta.main) {
	const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
	runConsumerGate(repoRoot, gateConfigFromArgv(process.argv.slice(2))).catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
