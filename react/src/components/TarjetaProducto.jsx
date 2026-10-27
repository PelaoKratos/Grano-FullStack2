function TarjetaProducto({ producto, onVerDetalle, onAgregar }) {
  return (
    <article className="tarjeta">
      <img
        className="imagen-producto"
        src={producto.imagen}
        alt={producto.nombre}
      />
      <div className="contenido-tarjeta">
        <p className="etiqueta">{producto.categoria}</p>
        <h3>{producto.nombre}</h3>
        <p>{producto.descripcion}</p>
        <p className="precio">
          ${producto.precio.toLocaleString("es-CL")} CLP
        </p>
        <p className="stock-producto">
          {producto.stock > 0 ? `Disponibles: ${producto.stock}` : "Agotado"}
        </p>
        <button type="button" onClick={() => onVerDetalle(producto)}>
          Ver detalle
        </button>
        <button
          className="boton-secundario"
          type="button"
          onClick={() => onAgregar(producto)}
          disabled={producto.stock === 0}
        >
          Añadir al carrito
        </button>
      </div>
    </article>
  );
}

export default TarjetaProducto;
