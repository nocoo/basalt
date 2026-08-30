import { copyFileSync, globSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(root, "src");
const publishCss = ["tailwind.css", "tokens.css", "standalone.css"] as const;

const entry = Object.fromEntries(
	globSync("**/*.{ts,tsx}", { cwd: src })
		.filter((file) => !/\.(test|spec)\./.test(file) && !file.startsWith("styles/"))
		.map((file) => [file.replace(/\.(ts|tsx)$/, ""), path.resolve(src, file)]),
);

function copyPublishCss(): Plugin {
	return {
		name: "basalt-copy-publish-css",
		closeBundle() {
			const dest = path.resolve(root, "dist/styles");
			mkdirSync(dest, { recursive: true });
			for (const file of publishCss) {
				copyFileSync(path.resolve(src, "styles", file), path.join(dest, file));
			}
		},
	};
}

export default defineConfig({
	plugins: [react(), copyPublishCss()],
	build: {
		lib: {
			entry,
			formats: ["es"],
			fileName: (_format, name) => `${name}.js`,
		},
		rollupOptions: {
			external: [
				/^react($|\/)/,
				/^react-dom($|\/)/,
				/^@radix-ui\//,
				"class-variance-authority",
				"clsx",
				"tailwind-merge",
				"lucide-react",
				"cmdk",
				"sonner",
				/^recharts($|\/)/,
			],
			output: {
				banner: '"use client";',
			},
		},
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
	},
});
