import { readFileSync } from "node:fs";
import path from "node:path";
import { build, type InlineConfig, type PluginOption } from "vite";
import { CATALOG_COMPONENT_GUIDES } from "../src/pages/ui/catalog-guides";
import { prerenderHtml } from "./prerender";
import { prerenderMarkdown, verifyMarkdownCoverage } from "./prerender-markdown";

export function shellRuntimeChunk(id: string): string | undefined {
	if (
		id.includes("/node_modules/react/") ||
		id.includes("/node_modules/react-dom/") ||
		id.includes("/node_modules/scheduler/")
	) {
		return "react-runtime";
	}
}

export function showcaseBuildConfig({
	write = true,
	plugins = [],
}: {
	write?: boolean;
	plugins?: PluginOption[];
} = {}): InlineConfig {
	return {
		configFile: path.resolve("vite.config.ts"),
		plugins,
		build: {
			write,
			manifest: true,
			rollupOptions: {
				output: {
					manualChunks: shellRuntimeChunk,
				},
			},
		},
	};
}

if (import.meta.main) {
	await build(showcaseBuildConfig());
	const distDir = path.resolve("dist");
	prerenderHtml(distDir, readFileSync(path.join(distDir, "index.html"), "utf8"));
	await prerenderMarkdown({
		distDir,
		repoRoot: path.resolve("."),
		guides: CATALOG_COMPONENT_GUIDES,
	});
	verifyMarkdownCoverage(distDir);
}
