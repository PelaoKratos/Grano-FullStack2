import { Link } from "react-router-dom";
import TarjetaProducto from "./TarjetaProducto.jsx";
import { estaEnOferta } from "../datos/compra.js";

export default function Ofertas({ productos, onAgregar }) {
  const ofertas = productos.filter(estaEnOferta);
  return (
    <section>
      <div className="encabezado mb-4">
        <h1>Ofertas</h1>
        <p>Productos con un precio especial dentro de nuestra colección.</p>
      </div>
      {ofertas.length ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {ofertas.map((producto) => (
            <div className="col" key={producto.id}>
              <TarjetaProducto producto={producto} onAgregar={onAgregar} />
            </div>
          ))}
        </div>
      ) : (
        <p className="panel">
          Por ahora no hay ofertas disponibles. Puedes seguir explorando la
          colección.
        </p>
      )}
      <Link className="btn btn-outline-success mt-4" to="/productos">
        Ver la colección
      </Link>
    </section>
  );
}
