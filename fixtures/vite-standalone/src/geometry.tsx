import "@nocoo/basalt/styles/standalone";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GeometryApp } from "./geometry-app";

const root = document.getElementById("geometry-root");
if (!root) {
	throw new Error("geometry-root element missing");
}

createRoot(root).render(
	<StrictMode>
		<GeometryApp />
	</StrictMode>,
);
