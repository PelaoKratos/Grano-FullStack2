import { createRoot } from "react-dom/client";
import "./index.css";
import "../../js/carrito.js";
import App from "./App.jsx";

const pagina = document.body.dataset.pagina || "inicio";
const elementoRaiz = document.getElementById("root");

createRoot(elementoRaiz).render(<App pagina={pagina} />);
