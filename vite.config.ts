import { readFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type PluginOption } from "vite";

function getVersion(): string {
	const pkg = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf-8"));
	return pkg.version as string;
}

function applyPreviewHeaders(res: { setHeader: (name: string, value: string) => void }) {
	res.setHeader("X-Robots-Tag", "noindex");
	res.setHeader("Link", '<https://basaltui.com/llms.txt>; rel="service-doc"; type="text/plain"');
}

/** Dev-server middleware that serves GET /api/live and preview crawler headers */
function apiLivePlugin(): PluginOption {
	return {
		name: "api-live",
		configureServer(server) {
			server.middlewares.use((_req, res, next) => {
				applyPreviewHeaders(res);
				next();
			});
			server.middlewares.use("/api/live", (_req, res) => {
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ status: "ok", version: getVersion() }));
			});
		},
		configurePreviewServer(server) {
			server.middlewares.use((_req, res, next) => {
				applyPreviewHeaders(res);
				next();
			});
		},
	};
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
	server: {
		host: "::",
		port: 7003,
		allowedHosts: ["basalt.dev.hexly.ai"],
		hmr: {
			overlay: false,
		},
	},
	plugins: [tailwindcss(), react(), apiLivePlugin()],
	resolve: {
		alias: [
			{
				find: "@nocoo/basalt/components",
				replacement: path.resolve(import.meta.dirname, "./packages/basalt/src/components"),
			},
			{
				find: "@nocoo/basalt/providers",
				replacement: path.resolve(import.meta.dirname, "./packages/basalt/src/providers"),
			},
			{
				find: "@nocoo/basalt/charts",
				replacement: path.resolve(import.meta.dirname, "./packages/basalt/src/charts"),
			},
			{
				find: "@nocoo/basalt",
				replacement: path.resolve(import.meta.dirname, "./packages/basalt/src/index.ts"),
			},
			{ find: "@", replacement: path.resolve(import.meta.dirname, "./src") },
		],
		dedupe: ["react", "react-dom", "react/jsx-runtime", "@radix-ui/react-tooltip"],
	},
}));
