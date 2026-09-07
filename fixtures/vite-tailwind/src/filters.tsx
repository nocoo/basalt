import "./index.css";
import { createRoot } from "react-dom/client";
import FiltersApp from "./filters-app";

const root = document.getElementById("filters-root");
if (!root) throw new Error("filters-root missing");
createRoot(root).render(<FiltersApp />);
