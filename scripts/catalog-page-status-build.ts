import path from "node:path";
import { build, type InlineConfig, type PluginOption } from "vite";

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
}
