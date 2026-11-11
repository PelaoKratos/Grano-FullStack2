import { Link, useParams } from "react-router-dom";
import DetalleProducto from "../components/DetalleProducto.jsx";

// El parámetro :id de la URL permite compartir el detalle de un producto.
export default function PaginaProducto({ productos, onAgregar }) {
  const { id } = useParams();
  const producto = productos.find(
    (productoCatalogo) => productoCatalogo.id === id,
  );
  return producto ? (
    <DetalleProducto producto={producto} onAgregar={onAgregar} />
  ) : (
    <section>
      <h1>Este producto no está disponible.</h1>
      <Link className="btn btn-success mt-4" to="/productos">
        Volver a la colección
      </Link>
    </section>
  );
}
