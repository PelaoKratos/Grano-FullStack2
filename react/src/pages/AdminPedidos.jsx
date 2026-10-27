import { precioCLP } from "../utils/formato.js";

function AdminPedidos({ pedidos, onCambiarEstado }) {
  return (
    <section className="panel-formulario">
      <h2>Pedidos de clientes</h2>
      {pedidos.length === 0 ? <p>Aún no hay pedidos realizados.</p> : (
        <ul className="lista-admin">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <strong>{pedido.id}</strong> · {pedido.comprador} · {pedido.fecha} · {precioCLP(pedido.total)}
              <p>{pedido.productos.map((producto) => `${producto.nombre} × ${producto.cantidad || 1}`).join(", ")}</p>
              <label htmlFor={`estado-${pedido.id}`}>Estado</label>
              <select id={`estado-${pedido.id}`} value={pedido.estado} onChange={(evento) => onCambiarEstado(pedido.id, evento.target.value)}>
                <option>Recibido</option><option>En preparación</option><option>Entregado</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminPedidos;
