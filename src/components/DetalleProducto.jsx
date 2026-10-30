export default function DetalleProducto({ producto, onAgregar }) {
  return (
    <>
      <nav aria-label="Ruta de navegación" className="mb-4">
        <a href="#/">Inicio</a> / <a href="#/productos">Colección</a> /{" "}
        <span aria-current="page">{producto.nombre}</span>
      </nav>
      <section className="producto-detalle">
        <div>
          <img
            className="img-fluid rounded-4"
            src={producto.imagen}
            alt={producto.nombre}
            width="1200"
            height="1200"
            decoding="async"
          />
        </div>
        <div>
          <h1>{producto.nombre}</h1>
          <p className="lead mt-4">{producto.notas || producto.descripcion}</p>
          <p>{producto.detalle}</p>
          <p className="precio my-4">
            ${producto.precio.toLocaleString("es-CL")} CLP
          </p>
          <p className="stock-producto">
            {producto.stock
              ? `${producto.stock} ${producto.stock === 1 ? "unidad disponible" : "unidades disponibles"}`
              : "Producto agotado"}
          </p>
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-success"
              disabled={producto.stock === 0}
              onClick={() => onAgregar(producto)}
            >
              Añadir al carrito
            </button>
            <a className="btn btn-outline-success" href="#/productos">
              Volver a la colección
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
