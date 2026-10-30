import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/bootstrap.min.css";
import "./styles/estilos.css";
import "./styles/componentes.css";
import "./styles/paginas.css";
import "./styles/responsive.css";
import "./styles/diseno.css";
import "./styles/react.css";
import { rutasAnteriores } from "./datos/rutas.js";

const archivoAnterior = location.pathname.split("/").pop();
if (rutasAnteriores[archivoAnterior]) {
  const parametros = new URLSearchParams(location.search);
  let ruta = rutasAnteriores[archivoAnterior];
  if (parametros.has("categoria") && archivoAnterior === "productos.html")
    ruta += `?categoria=${encodeURIComponent(parametros.get("categoria"))}`;
  if (parametros.has("destino") && archivoAnterior === "login.html")
    ruta += `?destino=${encodeURIComponent(parametros.get("destino"))}`;
  history.replaceState(null, "", `./#${ruta}`);
}

const elemento = document.getElementById("root");

createRoot(elemento).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
