import { Button } from "@nocoo/basalt/components/button";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
	throw new Error("root element missing");
}

createRoot(root).render(
	<StrictMode>
		<Button>Save</Button>
	</StrictMode>,
);
