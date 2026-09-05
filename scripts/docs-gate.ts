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
import { join } from "node:path";
import { CATALOG, catalogBarrelImport, catalogGranularImport } from "../src/pages/ui/catalog";
import { CATALOG_PAGE_STATUS } from "../src/pages/ui/generated/catalog-page-status";

export type CodeFenceKind = "compile" | "excerpt";

export type ScannedDocFence = {
	file: string;
	line: number;
	lang: string;
	kind: CodeFenceKind;
	id: string;
	reason?: string;
	rawHeader: string;
	code: string;
};

export const REQUIRED_DOC_FILES = [
	"README.md",
	"packages/basalt/README.md",
	"INTEGRATION.md",
] as const;

/**
 * Scans markdown files by line looking for opening (```lang ...) and closing (```) fences.
 * Every tsx or jsx code fence must be explicitly classified as:
 *   - compile:<unique-id>
 *   - excerpt:<reason-or-id>
 * Fails fast if any file is missing, any fence is unclosed, any tsx/jsx fence lacks classification,
 * or if any compile/excerpt ID is duplicated.
 */
export function scanDocFences(repoRoot = process.cwd()): ScannedDocFence[] {
	const allFences: ScannedDocFence[] = [];
	const seenIds = new Set<string>();

	for (const relFile of REQUIRED_DOC_FILES) {
		const absPath = join(repoRoot, relFile);
		if (!existsSync(absPath)) {
			throw new Error(`required documentation file missing: ${relFile}`);
		}

		const content = readFileSync(absPath, "utf8");
		const lines = content.split("\n");

		let inFence = false;
		let startLine = 0;
		let rawHeader = "";
		let codeLines: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith("```")) {
				if (!inFence) {
					inFence = true;
					startLine = i + 1;
					rawHeader = line.slice(3).trim();
					codeLines = [];
				} else {
					inFence = false;
					const parts = rawHeader.split(/\s+/).filter(Boolean);
					const lang = parts[0] || "";
					const tag = parts[1] || "";

					if (lang === "tsx" || lang === "jsx") {
						let kind: CodeFenceKind | undefined;
						let id: string | undefined;
						let reason: string | undefined;

						if (tag.startsWith("compile:")) {
							kind = "compile";
							id = tag.slice("compile:".length);
						} else if (tag.startsWith("excerpt:")) {
							kind = "excerpt";
							id = tag.slice("excerpt:".length);
							reason = parts.slice(2).join(" ") || id;
						}

						if (!kind || !id) {
							throw new Error(
								`unclassified ${lang} code block in ${relFile}:${startLine} (must be tagged 'compile:<id>' or 'excerpt:<id>')`,
							);
						}

						if (seenIds.has(id)) {
							throw new Error(`duplicate code block id '${id}' found in ${relFile}:${startLine}`);
						}
						seenIds.add(id);

						allFences.push({
							file: relFile,
							line: startLine,
							lang,
							kind,
							id,
							reason,
							rawHeader,
							code: codeLines.join("\n"),
						});
					}
				}
			} else if (inFence) {
				codeLines.push(line);
			}
		}

		if (inFence) {
			throw new Error(`unclosed code fence in ${relFile} starting at line ${startLine}`);
		}
	}

	return allFences;
}

export function extractCompilableDocModules(repoRoot = process.cwd()): ScannedDocFence[] {
	const fences = scanDocFences(repoRoot);
	const compilable = fences.filter((f) => f.kind === "compile");
	if (compilable.length === 0) {
		throw new Error("no compilable documentation modules found across markdown sources");
	}
	return compilable;
}

export function generateCatalogInstallationSnippets() {
	const ready = CATALOG.filter((e) => CATALOG_PAGE_STATUS[e.slug] === "ready");
	const lines = [
		`import "@nocoo/basalt/styles/standalone";`,
		`// Generated verification harness for all ready catalog installation snippets`,
	];

	let granularCount = 0;
	let barrelCount = 0;

	for (let i = 0; i < ready.length; i++) {
		const e = ready[i];
		const granular = catalogGranularImport(e);
		const barrel = catalogBarrelImport(e);

		lines.push(`// --- ${e.slug} ---`);
		lines.push(
			granular.replace(
				`import { ${e.exportName} }`,
				`import { ${e.exportName} as Granular_${i}_${e.exportName} }`,
			),
		);
		granularCount++;

		if (barrel) {
			lines.push(
				barrel.replace(
					`import { ${e.exportName} }`,
					`import { ${e.exportName} as Barrel_${i}_${e.exportName} }`,
				),
			);
			barrelCount++;
		}
	}

	return {
		readyCount: ready.length,
		granularCount,
		barrelCount,
		code: lines.join("\n"),
	};
}

export function runDocsGate(repoRoot = process.cwd()) {
	const packageRoot = join(repoRoot, "packages/basalt");
	const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-docs-gate-")));

	try {
		// 1. Pack fresh tarball from built packages/basalt using --ignore-scripts
		const pack = spawnSync("npm", ["pack", "--ignore-scripts", "--pack-destination", tempRoot], {
			cwd: packageRoot,
			stdio: "pipe",
			encoding: "utf8",
		});
		if (pack.status !== 0) {
			throw new Error(`npm pack failed:\n${pack.stderr}`);
		}

		const tarballs = readdirSync(tempRoot).filter((name) => name.endsWith(".tgz"));
		if (tarballs.length !== 1) {
			throw new Error(`expected 1 tarball, found: ${tarballs.join(", ")}`);
		}
		const tarballPath = join(tempRoot, tarballs[0]);

		// 2. Extract compilable doc modules and fail-fast if none
		const compilableModules = extractCompilableDocModules(repoRoot);

		// 3. Scaffold clean consumer using fixtures/vite-standalone template
		const consumerDir = join(tempRoot, "consumer");
		cpSync(join(repoRoot, "fixtures/vite-standalone"), consumerDir, { recursive: true });

		const pkgJsonPath = join(consumerDir, "package.json");
		const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8")) as {
			dependencies: Record<string, string>;
		};
		pkgJson.dependencies = {
			...pkgJson.dependencies,
			"@nocoo/basalt": `file:${tarballPath}`,
			recharts: "3.10.1",
			"react-day-picker": "10.0.1",
			"@tanstack/react-table": "9.1.2",
		};
		writeFileSync(pkgJsonPath, `${JSON.stringify(pkgJson, null, "\t")}\n`);

		// 4. Install dependencies in clean consumer
		const install = spawnSync("npm", ["install", "--no-fund", "--no-audit"], {
			cwd: consumerDir,
			stdio: "pipe",
			encoding: "utf8",
		});
		if (install.status !== 0) {
			throw new Error(`consumer npm install failed:\n${install.stderr}`);
		}

		// 5. Generate catalog snippets file
		const catalogData = generateCatalogInstallationSnippets();
		writeFileSync(join(consumerDir, "src/catalog-snippets.tsx"), catalogData.code);

		// 6. Write out exact compilable documentation modules without synthetic modifications
		for (const mod of compilableModules) {
			const safeFilename = `${mod.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.tsx`;
			writeFileSync(join(consumerDir, `src/${safeFilename}`), mod.code);
		}

		// 7. Strict tsc typecheck of consumer
		const tsc = spawnSync("npx", ["tsc", "-p", "tsconfig.json", "--noEmit"], {
			cwd: consumerDir,
			stdio: "pipe",
			encoding: "utf8",
		});
		if (tsc.status !== 0) {
			throw new Error(`consumer tsc --noEmit failed:\n${tsc.stdout}\n${tsc.stderr}`);
		}

		return {
			tarball: tarballs[0],
			consumerDir,
			readyCount: catalogData.readyCount,
			granularCount: catalogData.granularCount,
			barrelCount: catalogData.barrelCount,
			compilableCount: compilableModules.length,
			compilableIds: compilableModules.map((m) => m.id),
		};
	} finally {
		rmSync(tempRoot, { recursive: true, force: true });
	}
}

if (import.meta.main) {
	const result = runDocsGate();
	console.log(`consumer docs ok ${JSON.stringify(result, null, 2)}`);
}
