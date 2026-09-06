import { createRoot } from "react-dom/client";
import { ChartsApp } from "./charts-app";
import "@nocoo/basalt/styles/standalone";

const root = document.getElementById("charts-root");
if (!root) {
	throw new Error("charts-root element missing");
}

createRoot(root).render(<ChartsApp />);
