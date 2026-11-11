import { Navigate, useLocation } from "react-router-dom";
import { leerRuta } from "../datos/rutas.js";

// Conservamos los enlaces antiguos y enviamos el registro a su propia página.
export default function RutasCompatibles({ children }) {
  const { pathname, search } = useLocation();
  let { path: rutaActual } = leerRuta(`#${pathname}`);
  const parametros = new URLSearchParams(search);

  if (rutaActual === "/acceso" && parametros.has("registro")) {
    rutaActual = "/registro";
    parametros.delete("registro");
  }

  const consulta = parametros.toString();
  const destino = rutaActual + (consulta ? `?${consulta}` : "");
  return destino === pathname + search ? (
    children
  ) : (
    <Navigate to={destino} replace />
  );
}
