import { Link } from "react-router-dom";

// Muestra una salida hacia el catálogo cuando la dirección no coincide con
// ninguna ruta.
export default function PaginaNoEncontrada() {
  return (
    <section>
      <h1>No encontramos esta página.</h1>
      <p>Puedes seguir explorando nuestra colección.</p>
      <Link className="btn btn-success" to="/productos">
        Ver la colección
      </Link>
    </section>
  );
}
