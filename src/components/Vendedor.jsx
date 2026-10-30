import { Link } from "react-router-dom";
import { precioCLP } from "../datos/formato.js";

function Vendedor({ productos, pedidos }) {
  return (
    <section className="panel-vendedor">
      <h1>Productos y pedidos</h1>
      <p>
        Desde este panel puedes consultar disponibilidad y revisar pedidos de
        clientes.
      </p>

      <section className="panel-formulario">
        <h2>Disponibilidad de productos</h2>
        <ul className="lista-admin">
          {productos.map((producto) => (
            <li key={producto.id}>
              <strong>{producto.nombre}</strong> · {producto.categoria} ·{" "}
              {precioCLP(producto.precio)}
              <p>
                Stock: {producto.stock}{" "}
                {producto.stock === 1 ? "unidad" : "unidades"}
                {producto.stock <= producto.critico && (
                  <strong className="aviso-stock"> · Stock crítico</strong>
                )}
              </p>
              <Link to={`/producto/${producto.id}`}>Ver producto</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-formulario">
        <h2>Pedidos recibidos</h2>
        {pedidos.length === 0 ? (
          <p>Aún no hay pedidos.</p>
        ) : (
          <ul className="lista-admin">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                <strong>{pedido.id}</strong> · {pedido.fecha} · {pedido.estado}{" "}
                · {precioCLP(pedido.total)}
                <p>Cliente: {pedido.comprador}</p>
                <p>
                  {pedido.productos
                    .map(
                      (producto) =>
                        `${producto.nombre} × ${producto.cantidad || 1}`,
                    )
                    .join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

export default Vendedor;
