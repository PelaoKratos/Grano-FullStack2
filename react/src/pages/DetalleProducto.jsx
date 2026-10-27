function DetalleProducto({ producto, volver, onAgregar }) {
  return (
    <section className="detalle-producto">
      <img src={producto.imagen} alt={producto.nombre} />
      <div>
        <p className="etiqueta">{producto.categoria}</p>
        <h1>{producto.nombre}</h1>
        <p>{producto.descripcion}</p>
        <p>{producto.detalle}</p>
        <p className="precio">${producto.precio.toLocaleString("es-CL")} CLP</p>
        <p>{producto.stock > 0 ? `Disponibles: ${producto.stock}` : "Agotado"}</p>
        <button type="button" onClick={() => onAgregar(producto)} disabled={producto.stock === 0}>
          Añadir al carrito
        </button>
        <button className="boton-secundario" type="button" onClick={volver}>
          Volver a nuestros productos
        </button>
      </div>
    </section>
  );
}

export default DetalleProducto;
