import "./index.css";
import { createRoot } from "react-dom/client";
import EditingApp from "./editing-app";

const root = document.getElementById("editing-root");
if (!root) throw new Error("Missing editing root");
createRoot(root).render(<EditingApp />);
