function TarjetaProducto({ producto }) {
  return (
    <article className="card h-100 producto">
      <a href={`./producto.html?id=${producto.id}`}>
        <img
          className="card-img-top"
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          width="600"
          height="500"
        />
      </a>
      <div className="card-body d-flex flex-column">
        <p className="etiqueta">{producto.categoria}</p>
        <h3 className="h4">
          <a href={`./producto.html?id=${producto.id}`}>{producto.nombre}</a>
        </h3>
        <p className="text-secondary">{producto.resumen}</p>
        <p className="precio mt-auto">
          ${producto.precio.toLocaleString("es-CL")} <small>CLP</small>
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <a className="btn btn-outline-success" href={`./producto.html?id=${producto.id}`}>
            Ver detalle
          </a>
          <button
            className="btn btn-success"
            type="button"
            data-agregar-carrito
            data-id={producto.id}
            data-nombre={producto.nombre}
            data-precio={producto.precio}
            data-imagen={producto.imagen}
          >
            Añadir
          </button>
        </div>
      </div>
    </article>
  );
}

export default TarjetaProducto;
