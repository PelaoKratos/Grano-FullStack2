import { productos } from "../data/productos.js";

function DetalleProducto() {
  const idProducto = new URLSearchParams(window.location.search).get("id");
  const producto = productos.find((item) => item.id === idProducto);

  if (!producto) {
    return (
      <main id="contenido" className="container py-5">
        <h1>Producto no encontrado</h1>
        <p>Vuelve a la colección para revisar los productos disponibles.</p>
        <a className="btn btn-success" href="./productos.html">Ir a nuestro café</a>
      </main>
    );
  }

  return (
    <main id="contenido" className="container py-5">
      <nav aria-label="Ubicación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="./">Inicio</a></li>
          <li className="breadcrumb-item"><a href="./productos.html">Colección</a></li>
          <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
        </ol>
      </nav>
      <section className="row gx-4 gy-5 align-items-center">
        <div className="col-md-6">
          <img
            className="img-fluid rounded-4"
            src={producto.imagen}
            alt={producto.nombre}
            width="600"
            height="500"
          />
        </div>
        <div className="col-md-6">
          <div className="encabezado mb-4">
            <p className="etiqueta">{producto.categoria}</p>
            <h1>{producto.nombre}</h1>
          </div>
          <p className="lead">{producto.resumen}</p>
          <p>{producto.descripcion}</p>
          <p className="precio">
            ${producto.precio.toLocaleString("es-CL")} CLP
          </p>
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-success"
              type="button"
              data-agregar-carrito
              data-id={producto.id}
              data-nombre={producto.nombre}
              data-precio={producto.precio}
              data-imagen={producto.imagen}
            >
              Añadir al carrito
            </button>
            <a href="./productos.html" className="btn btn-outline-success">
              Volver a la colección
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default DetalleProducto;
