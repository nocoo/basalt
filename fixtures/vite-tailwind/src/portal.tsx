import { createRoot } from "react-dom/client";
import { PortalApp } from "./portal-app";
import "./index.css";

const root = document.getElementById("portal-root");
if (!root) {
	throw new Error("portal-root element missing");
}

createRoot(root).render(<PortalApp />);
