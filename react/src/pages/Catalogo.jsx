import TarjetaProducto from "../components/TarjetaProducto.jsx";
import { productos } from "../data/productos.js";

function Catalogo() {
  return (
    <main id="contenido" className="container py-5">
      <div className="encabezado mb-4">
        <p className="etiqueta">LA COLECCIÓN</p>
        <h1>Encuentra tu próximo ritual.</h1>
        <p className="text-secondary">Cafés, métodos y accesorios. Precios en pesos chilenos.</p>
      </div>
      {/* Bootstrap acomoda las tarjetas según el espacio disponible en la pantalla. */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {productos.map((producto) => (
          <div className="col" key={producto.id}>
            <TarjetaProducto producto={producto} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default Catalogo;
