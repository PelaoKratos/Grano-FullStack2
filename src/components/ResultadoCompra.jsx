import { Link, useLocation, useParams } from "react-router-dom";
import ResumenPedido from "./ResumenPedido.jsx";

export default function ResultadoCompra({ pedidos, sesion, error = false }) {
  const { id } = useParams();
  const { state } = useLocation();
  const pedido = error
    ? state?.resumen
    : pedidos.find(
        (pedido) => pedido.id === id && pedido.comprador === sesion.correo,
      );
  if (!pedido) {
    return (
      <section>
        <h1>No encontramos el resumen de esta compra.</h1>
        <Link className="btn btn-success mt-4" to="/cuenta">
          Ver mis pedidos
        </Link>
        <Link className="btn btn-outline-success mt-4 ms-2" to="/carrito">
          Volver al carrito
        </Link>
      </section>
    );
  }
  return (
    <section>
      <div className="encabezado mb-4">
        <h1>
          {error
            ? "No pudimos completar la compra."
            : "Tu pedido quedó registrado."}
        </h1>
        <p role={error ? "alert" : "status"}>
          {error
            ? state.mensaje
            : "Gracias por elegir Grano. Puedes revisar el estado en tu cuenta."}
        </p>
      </div>
      <ResumenPedido pedido={pedido} />
      {error ? (
        <Link
          className="btn btn-success"
          to="/checkout"
          state={{ entrega: pedido.entrega }}
        >
          Volver a intentar
        </Link>
      ) : (
        <Link className="btn btn-success" to="/cuenta">
          Ver mis pedidos
        </Link>
      )}
      <Link
        className="btn btn-outline-success ms-2"
        to={error ? "/carrito" : "/productos"}
      >
        {error ? "Revisar carrito" : "Seguir explorando"}
      </Link>
    </section>
  );
}
