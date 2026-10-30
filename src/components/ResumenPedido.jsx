import { precioCLP } from "../datos/formato.js";

export default function ResumenPedido({ pedido }) {
  return (
    <section className="panel-formulario">
      <h2>Resumen {pedido.id ? `del pedido ${pedido.id}` : "de la compra"}</h2>
      {pedido.fecha && (
        <p>
          {pedido.fecha} · {pedido.estado}
        </p>
      )}
      <ul className="lista-pedidos">
        {pedido.productos.map((producto) => (
          <li key={producto.id}>
            {producto.nombre} × {producto.cantidad} ·{" "}
            {precioCLP(producto.precio * producto.cantidad)}
          </li>
        ))}
      </ul>
      <p className="precio mt-4">Total: {precioCLP(pedido.total)}</p>
      {pedido.entrega && (
        <div className="mt-4">
          <h3 className="h5">Datos de entrega</h3>
          <p className="text-break">
            {pedido.entrega.nombre} · {pedido.entrega.correo}
            <br />
            {pedido.entrega.telefono}
          </p>
          <p className="text-break">
            {pedido.entrega.metodo === "retiro"
              ? "Retiro en tienda"
              : [
                  pedido.entrega.direccion,
                  pedido.entrega.comuna,
                  pedido.entrega.region,
                ]
                  .filter(Boolean)
                  .join(", ") || "Completa la dirección de entrega."}
          </p>
          {pedido.entrega.indicaciones && (
            <p className="text-break">{pedido.entrega.indicaciones}</p>
          )}
        </div>
      )}
      {!pedido.entrega && (
        <p>Este pedido anterior no tiene datos de entrega registrados.</p>
      )}
      <p className="ayuda-formulario mt-4">
        {pedido.id ? "Comprobante" : "Operación"} de demostración, sin validez
        tributaria. No se realizó ningún cobro real.
      </p>
    </section>
  );
}
