import Icono from "./Icono.jsx";
export default function TarjetaProducto({
  producto,
  onAgregar,
  portada = false,
}) {
  const Heading = portada ? "h3" : "h2";
  return (
    <article className={portada ? "cafe-producto" : "card h-100 producto"}>
      <a
        className={portada ? "cafe-imagen" : ""}
        href={`#/producto/${producto.id}`}
      >
        <img
          className={portada ? "" : "card-img-top"}
          src={producto.imagen}
          alt={producto.nombre}
          width="1200"
          height="1200"
          loading="lazy"
          decoding="async"
        />
        {portada && <span className="sabor-etiqueta">{producto.notas}</span>}
      </a>
      <div className={portada ? "cafe-info" : "card-body d-flex flex-column"}>
        <p className={portada ? "" : "etiqueta"}>{producto.categoria}</p>
        <Heading className={portada ? "" : "h4"}>
          <a href={`#/producto/${producto.id}`}>{producto.nombre}</a>
        </Heading>
        {!portada && (
          <p className="text-secondary">
            {producto.notas || producto.descripcion}
          </p>
        )}
        <p className="stock-producto">
          {producto.stock === 0
            ? "Agotado"
            : `${producto.stock} ${producto.stock === 1 ? "disponible" : "disponibles"}`}
        </p>
        {portada ? (
          <div className="cafe-compra">
            <span className="precio">
              ${producto.precio.toLocaleString("es-CL")} <small>CLP</small>
            </span>
            <button
              className="btn btn-success"
              disabled={producto.stock === 0}
              onClick={() => onAgregar(producto)}
              aria-label={`Añadir ${producto.nombre} al carrito`}
            >
              {producto.stock === 0 ? "Agotado" : "Añadir"} <Icono />
            </button>
          </div>
        ) : (
          <>
            <p className="precio mt-auto">
              ${producto.precio.toLocaleString("es-CL")} <small>CLP</small>
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <a
                className="btn btn-outline-success"
                href={`#/producto/${producto.id}`}
              >
                Ver detalle
              </a>
              <button
                className="btn btn-success"
                disabled={producto.stock === 0}
                onClick={() => onAgregar(producto)}
                aria-label={`Añadir ${producto.nombre} al carrito`}
              >
                {producto.stock === 0 ? "Agotado" : "Añadir"}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
