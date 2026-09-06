import { createRoot } from "react-dom/client";
import { ToastApp } from "./toast-app";
import "@nocoo/basalt/styles/standalone";

const root = document.getElementById("toast-root");
if (!root) {
	throw new Error("toast-root element missing");
}

createRoot(root).render(<ToastApp />);
