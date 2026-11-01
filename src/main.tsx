import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { loadI18n } from "./i18n/load";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");
// Only the landing renders without translations; other routes load them alongside their chunk.
if (window.location.pathname !== "/") void loadI18n();
createRoot(rootElement).render(<App />);
