import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				geometry: resolve(__dirname, "geometry.html"),
				dock: resolve(__dirname, "dock.html"),
				confirm: resolve(__dirname, "confirm.html"),
				portal: resolve(__dirname, "portal.html"),
				toast: resolve(__dirname, "toast.html"),
				slider: resolve(__dirname, "slider.html"),
				calendar: resolve(__dirname, "calendar.html"),
			},
		},
	},
});
