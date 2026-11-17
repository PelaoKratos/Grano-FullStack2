import { precioCLP } from "../../datos/formato.js";
import { Link } from "react-router-dom";
import { useState } from "react";
import ResumenPedido from "../ResumenPedido.jsx";

// Lista los pedidos con un enlace al comprobante y un control para cambiar su
// estado.
function AdminPedidos({
  pedidos,
  onCambiarEstado,
  mostrarDetalle = true,
  titulo = "Pedidos de clientes",
}) {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  async function cambiar(id, estado) {
    if (guardando) return;
    setGuardando(true);
    try {
      const guardado = await onCambiarEstado(id, estado);
      setMensaje(
        guardado
          ? "Estado del pedido actualizado."
          : "No pudimos actualizar el estado. Vuelve a intentar.",
      );
    } catch {
      setMensaje("No pudimos actualizar el estado. Vuelve a intentar.");
    } finally {
      setGuardando(false);
    }
  }
  return (
    <section className="panel-formulario">
      <h2>{titulo}</h2>
      <p role="status">{guardando ? "Guardando estado…" : mensaje}</p>
      {pedidos.length === 0 ? (
        <p>Aún no hay pedidos realizados.</p>
      ) : (
        <ul className="lista-admin">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <strong>{pedido.id}</strong> · {pedido.comprador} · {pedido.fecha}{" "}
              · {precioCLP(pedido.total)}
              <p>
                {pedido.productos
                  .map(
                    (producto) =>
                      `${producto.nombre} × ${producto.cantidad || 1}`,
                  )
                  .join(", ")}
              </p>
              <label htmlFor={`estado-${pedido.id}`}>Estado</label>
              {mostrarDetalle ? (
                <p>
                  <Link to={`/admin/pedidos/${pedido.id}`}>
                    Ver detalle y comprobante
                  </Link>
                </p>
              ) : (
                <details>
                  <summary>Ver detalle y entrega</summary>
                  <ResumenPedido pedido={pedido} />
                </details>
              )}
              <select
                id={`estado-${pedido.id}`}
                value={pedido.estado}
                disabled={guardando}
                onChange={(evento) => cambiar(pedido.id, evento.target.value)}
              >
                <option>Recibido</option>
                <option>En preparación</option>
                <option>Entregado</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminPedidos;
