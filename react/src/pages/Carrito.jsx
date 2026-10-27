function Carrito({ carrito, productos, sesion, mensajeCompra, onQuitar, onCantidad, onComprar, onIrAcceso }) {
  const lineas = carrito.map((item) => ({
    ...item,
    producto: productos.find((producto) => String(producto.id) === String(item.id)),
  })).filter((item) => item.producto);
  const total = lineas.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
  const stockInsuficiente = lineas.some((item) => item.cantidad > item.producto.stock);

  return (
    <section className="carrito">
      <h1>Mi carrito</h1>

      {lineas.length === 0 ? (
        <p>{mensajeCompra || "El carrito está vacío."}</p>
      ) : (
        <>
          <ul className="lista-carrito">
            {lineas.map(({ id, cantidad, producto }) => (
              <li className="producto-carrito" key={id}>
                <img src={producto.imagen} alt={producto.nombre} />
                <div className="datos-producto-carrito">
                  <h2>{producto.nombre}</h2>
                  <p>${producto.precio.toLocaleString("es-CL")} CLP</p>
                  <div className="cantidad-carrito">
                    <button type="button" onClick={() => onCantidad(id, -1)} disabled={cantidad <= 1} aria-label={`Quitar una unidad de ${producto.nombre}`}>−</button>
                    <span>{cantidad}</span>
                    <button type="button" onClick={() => onCantidad(id, 1)} disabled={cantidad >= producto.stock} aria-label={`Agregar una unidad de ${producto.nombre}`}>+</button>
                  </div>
                  {cantidad > producto.stock && <p>Solo quedan {producto.stock} unidades.</p>}
                </div>
                <button
                  className="boton-secundario"
                  type="button"
                  onClick={() => onQuitar(id)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <div className="resumen-carrito">
            <p>Total: <strong>${total.toLocaleString("es-CL")} CLP</strong></p>
            {sesion?.rol === "comprador" ? (
              <button type="button" onClick={onComprar} disabled={stockInsuficiente}>Realizar compra</button>
            ) : !sesion ? (
              <button type="button" onClick={onIrAcceso}>Inicia sesión para comprar</button>
            ) : (
              <p>Ingresa con una cuenta de comprador para realizar el pedido.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Carrito;
