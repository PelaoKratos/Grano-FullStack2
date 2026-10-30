import { Link } from "react-router-dom";
import { totalCarrito } from "../datos/almacenamiento.js";
export default function Carrito({
  carrito,
  sesion,
  mensajeCompra,
  onQuitar,
  onCantidad,
  onComprar,
}) {
  const stockInsuficiente = carrito.some(
    (productoCatalogo) => productoCatalogo.cantidad > productoCatalogo.stock,
  );
  return (
    <>
      <h1>Carrito</h1>
      <p className="text-secondary mb-4">
        Aquí se guardan los productos que agregaste.
      </p>
      <section className="panel">
        {carrito.length ? (
          carrito.map((productoCatalogo) => (
            <article className="item-carrito" key={productoCatalogo.id}>
              <img
                src={productoCatalogo.imagen}
                alt={productoCatalogo.nombre}
              />
              <div>
                <h2 className="h5">{productoCatalogo.nombre}</h2>
                <p className="mb-0">
                  ${productoCatalogo.precio.toLocaleString("es-CL")} CLP ·{" "}
                  {productoCatalogo.stock} disponibles
                </p>
                <div
                  className="cantidad-carrito"
                  role="group"
                  aria-label={`Cantidad de ${productoCatalogo.nombre}`}
                >
                  <button
                    type="button"
                    aria-label={`Disminuir ${productoCatalogo.nombre}`}
                    disabled={
                      productoCatalogo.cantidad <= 1 ||
                      productoCatalogo.stock === 0
                    }
                    onClick={() => onCantidad(productoCatalogo.id, -1)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span aria-live="polite">{productoCatalogo.cantidad}</span>
                  <button
                    type="button"
                    aria-label={`Aumentar ${productoCatalogo.nombre}`}
                    disabled={
                      productoCatalogo.cantidad >= productoCatalogo.stock
                    }
                    onClick={() => onCantidad(productoCatalogo.id, 1)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M12 5v14" />
                    </svg>
                  </button>
                </div>
                {productoCatalogo.cantidad > productoCatalogo.stock && (
                  <p className="aviso-stock" role="alert">
                    El stock cambió. Ajusta la cantidad o quita este producto.
                  </p>
                )}
              </div>
              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => onQuitar(productoCatalogo.id)}
                aria-label={`Quitar ${productoCatalogo.nombre}`}
              >
                Quitar
              </button>
            </article>
          ))
        ) : (
          <p className="mb-0">Todavía no agregas productos al carrito.</p>
        )}
      </section>
      {mensajeCompra && (
        <p className="alert alert-success mt-4" role="status">
          {mensajeCompra} <Link to="/cuenta">Ver mis pedidos</Link>
        </p>
      )}
      {carrito.length > 0 && (
        <section className="panel mt-4 resumen-compra">
          <div>
            <p className="mb-1">Total del pedido</p>
            <strong className="precio">
              ${totalCarrito(carrito).toLocaleString("es-CL")} CLP
            </strong>
          </div>
          {sesion?.rol === "comprador" ? (
            <Link
              className="btn btn-success"
              to={stockInsuficiente ? "/carrito" : "/checkout"}
              aria-disabled={stockInsuficiente}
              onClick={(evento) => {
                if (stockInsuficiente) {
                  evento.preventDefault();
                }
              }}
            >
              Realizar compra
            </Link>
          ) : !sesion ? (
            <Link className="btn btn-success" to="/acceso?destino=carrito">
              Inicia sesión para comprar
            </Link>
          ) : (
            <p className="mb-0">
              Ingresa con una cuenta de comprador para realizar el pedido.
            </p>
          )}
        </section>
      )}
      <Link className="btn btn-outline-success mt-4" to="/productos">
        Seguir viendo productos
      </Link>
    </>
  );
}
