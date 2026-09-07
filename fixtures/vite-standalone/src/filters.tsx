import "@nocoo/basalt/styles/standalone";
import { createRoot } from "react-dom/client";
import FiltersApp from "./filters-app";

const root = document.getElementById("filters-root");
if (!root) throw new Error("filters-root missing");
createRoot(root).render(<FiltersApp />);
