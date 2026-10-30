import { Link } from "react-router-dom";
import { claveCategoria } from "../datos/categorias.js";

export default function Categorias({ categorias, productos }) {
  return (
    <section>
      <div className="encabezado mb-4">
        <h1>Categorías</h1>
        <p>Encuentra café, métodos y accesorios para tu próximo ritual.</p>
      </div>
      <ul className="lista-admin">
        {categorias.map((categoria) => (
          <li key={categoria}>
            <h2 className="h4">
              <Link to={`/productos?categoria=${claveCategoria(categoria)}`}>
                {categoria}
              </Link>
            </h2>
            <p>
              Productos en esta categoría:{" "}
              {
                productos.filter((producto) => producto.categoria === categoria)
                  .length
              }
              .
            </p>
          </li>
        ))}
      </ul>
      <Link className="btn btn-outline-success mt-4" to="/productos">
        Ver toda la colección
      </Link>
    </section>
  );
}
