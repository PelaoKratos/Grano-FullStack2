import { Link } from "react-router-dom";

// El panel se renderiza únicamente si la sesión tiene uno de los roles indicados.
export default function RutaProtegida({ sesion, roles, children }) {
  if (sesion && roles.includes(sesion.rol)) {
    return children;
  }
  return (
    <section>
      <h1>
        {sesion
          ? "No tienes acceso a esta sección."
          : "Inicia sesión para continuar."}
      </h1>
      <Link className="btn btn-success mt-4" to={sesion ? "/" : "/acceso"}>
        {sesion ? "Volver al inicio" : "Ir a iniciar sesión"}
      </Link>
    </section>
  );
}
