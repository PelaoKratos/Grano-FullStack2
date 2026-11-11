import BotonAgregar from "./BotonAgregar.jsx";
import { Link } from "react-router-dom";
import { estaEnOferta } from "../datos/compra.js";
// Reutiliza la ficha breve en portada y catálogo con su precio, enlace y botón
// de compra.
export default function TarjetaProducto({
  producto,
  onAgregar,
  portada = false,
}) {
  const Heading = portada ? "h3" : "h2";
  return (
    <article className={portada ? "cafe-producto" : "card h-100 producto"}>
      <Link
        className={portada ? "cafe-imagen" : ""}
        to={`/producto/${producto.id}`}
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
      </Link>
      <div className={portada ? "cafe-info" : "card-body d-flex flex-column"}>
        {estaEnOferta(producto) && (
          <p className="stock-producto">
            Oferta · antes{" "}
            <del>${producto.precioAnterior.toLocaleString("es-CL")} CLP</del>
          </p>
        )}
        <p className={portada ? "" : "etiqueta"}>{producto.categoria}</p>
        <Heading className={portada ? "" : "h4"}>
          <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
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
            <BotonAgregar producto={producto} onAgregar={onAgregar} conIcono />
          </div>
        ) : (
          <>
            <p className="precio mt-auto">
              ${producto.precio.toLocaleString("es-CL")} <small>CLP</small>
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <Link
                className="btn btn-outline-success"
                to={`/producto/${producto.id}`}
              >
                Ver detalle
              </Link>
              <BotonAgregar producto={producto} onAgregar={onAgregar} />
            </div>
          </>
        )}
      </div>
    </article>
  );
}
