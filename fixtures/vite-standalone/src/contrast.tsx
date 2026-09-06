import { createRoot } from "react-dom/client";
import { ContrastApp } from "./contrast-app";
import "@nocoo/basalt/styles/standalone";

const root = document.getElementById("contrast-root");
if (!root) {
	throw new Error("contrast-root element missing");
}

createRoot(root).render(<ContrastApp />);
