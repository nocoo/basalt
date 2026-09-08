import { readFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type PluginOption } from "vite";

function getVersion(): string {
	const pkg = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf-8"));
	return pkg.version as string;
}

type HexlyShare = {
	name: string;
	description: { en: string };
	image: { url: string; type: string; width: number; height: number; alt: string };
};

function escapeAttr(value: string): string {
	return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function applyShare(html: string, share: HexlyShare): string {
	return html
		.replace(
			/<meta property="og:title" content="[^"]*" \/>/,
			`<meta property="og:title" content="${escapeAttr(share.name)}" />`,
		)
		.replace(
			/<meta property="og:description" content="[^"]*" \/>/,
			`<meta property="og:description" content="${escapeAttr(share.description.en)}" />`,
		)
		.replaceAll("https://hexly.ai/og/basalt.jpg", share.image.url)
		.replace(
			/<meta property="og:image:type" content="[^"]*" \/>/,
			`<meta property="og:image:type" content="${escapeAttr(share.image.type)}" />`,
		)
		.replace(
			/<meta property="og:image:alt" content="[^"]*" \/>/,
			`<meta property="og:image:alt" content="${escapeAttr(share.image.alt)}" />`,
		)
		.replace(
			/<meta name="twitter:title" content="[^"]*" \/>/,
			`<meta name="twitter:title" content="${escapeAttr(share.name)}" />`,
		)
		.replace(
			/<meta name="twitter:description" content="[^"]*" \/>/,
			`<meta name="twitter:description" content="${escapeAttr(share.description.en)}" />`,
		)
		.replace(
			/<meta name="twitter:image:alt" content="[^"]*" \/>/,
			`<meta name="twitter:image:alt" content="${escapeAttr(share.image.alt)}" />`,
		);
}

function hexlySharePlugin(): PluginOption {
	return {
		name: "hexly-share",
		async transformIndexHtml(html) {
			try {
				const response = await fetch("https://hexly.ai/api/share/basalt.json");
				if (!response.ok) return html;
				return applyShare(html, (await response.json()) as HexlyShare);
			} catch {
				return html;
			}
		},
	};
}

/** Dev-server middleware that serves GET /api/live */
function apiLivePlugin(): PluginOption {
	return {
		name: "api-live",
		configureServer(server) {
			server.middlewares.use("/api/live", (_req, res) => {
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ status: "ok", version: getVersion() }));
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
	plugins: [tailwindcss(), react(), apiLivePlugin(), hexlySharePlugin()],
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
