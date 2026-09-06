import { createRoot } from "react-dom/client";
import { CalendarApp } from "./calendar-app";
import "@nocoo/basalt/styles/standalone";

const root = document.getElementById("calendar-root");
if (!root) {
	throw new Error("calendar-root element missing");
}

createRoot(root).render(<CalendarApp />);
