import { createRoot } from "react-dom/client";
import { SliderApp } from "./slider-app";
import "@nocoo/basalt/styles/standalone";

const root = document.getElementById("slider-root");
if (!root) {
	throw new Error("slider-root element missing");
}

createRoot(root).render(<SliderApp />);
