import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast } from "@nocoo/basalt";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

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
				<Toast />
			</LinkProvider>
		</ThemeProvider>
	</StrictMode>,
);
