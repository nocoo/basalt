import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toaster } from "@nocoo/basalt";
import "@nocoo/basalt/styles/standalone";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (!root) {
	throw new Error("root element missing");
}

createRoot(root).render(
	<StrictMode>
		<ThemeProvider>
			<LinkProvider>
				<ThemeToggle aria-label="Toggle theme" />
				<Button>Save</Button>
				<Toaster />
			</LinkProvider>
		</ThemeProvider>
	</StrictMode>,
);
