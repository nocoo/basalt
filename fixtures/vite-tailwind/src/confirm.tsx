import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfirmApp } from "./confirm-app";
import "./index.css";

const root = document.getElementById("confirm-root");
if (!root) {
	throw new Error("confirm-root element missing");
}

createRoot(root).render(
	<StrictMode>
		<ConfirmApp />
	</StrictMode>,
);
