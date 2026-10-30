import { resumirVentas } from "../../datos/compra.js";
import { precioCLP } from "../../datos/formato.js";

export default function AdminReportes({ pedidos, productos }) {
  const reporte = resumirVentas(pedidos, productos);
  return (
    <section className="panel-formulario">
      <h2>Reportes de la tienda</h2>
      <p>
        Resumen de los pedidos de demostración registrados en este navegador.
      </p>
      <dl className="mt-4">
        <dt>Pedidos registrados</dt>
        <dd>{reporte.cantidad}</dd>
        <dt>Total de pedidos</dt>
        <dd>{precioCLP(reporte.total)}</dd>
        <dt>Unidades vendidas</dt>
        <dd>{reporte.unidades}</dd>
      </dl>
      <h3>Pedidos por estado</h3>
      <ul className="lista-admin">
        {reporte.estados.map(({ estado, cantidad }) => (
          <li key={estado}>
            {estado}: {cantidad}
          </li>
        ))}
      </ul>
      <h3>Stock crítico</h3>
      {reporte.stockCritico.length ? (
        <ul className="lista-admin">
          {reporte.stockCritico.map((producto) => (
            <li key={producto.id}>
              {producto.nombre}: {producto.stock} unidades
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay productos en stock crítico.</p>
      )}
    </section>
  );
}
