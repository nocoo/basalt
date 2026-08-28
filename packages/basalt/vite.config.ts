import { globSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(root, "src");

const entry = Object.fromEntries(
	globSync("**/*.{ts,tsx}", { cwd: src })
		.filter((file) => !file.includes(".test.") && !file.startsWith("styles/"))
		.map((file) => [file.replace(/\.(ts|tsx)$/, ""), path.resolve(src, file)]),
);

export default defineConfig({
	plugins: [react()],
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
