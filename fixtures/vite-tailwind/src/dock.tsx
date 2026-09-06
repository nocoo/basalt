import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DockApp } from "./dock-app";
import "./index.css";

const root = document.getElementById("dock-root");
if (!root) {
	throw new Error("dock-root element missing");
}

createRoot(root).render(
	<StrictMode>
		<DockApp />
	</StrictMode>,
);
