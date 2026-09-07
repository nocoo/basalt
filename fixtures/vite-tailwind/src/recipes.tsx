import "./index.css";
import { createRoot } from "react-dom/client";
import RecipesApp from "./recipes-app";

const root = document.getElementById("recipes-root");
if (!root) throw new Error("Missing recipes root");
createRoot(root).render(<RecipesApp />);
