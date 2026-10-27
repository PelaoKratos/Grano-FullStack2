import { useState } from "react";
import TarjetaProducto from "../components/TarjetaProducto.jsx";

function Productos({ productos, onVerDetalle, onAgregar }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const categorias = ["Todas", ...new Set(productos.map((producto) => producto.categoria))];
  const visibles = productos.filter((producto) =>
    (categoria === "Todas" || producto.categoria === categoria) &&
    producto.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  return (
    <section id="productos" className="catalogo">
      <h1>Nuestros productos</h1>
      <div className="filtros-productos">
        <div>
          <label htmlFor="buscar-producto">Buscar producto</label>
          <input id="buscar-producto" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />
        </div>
        <div>
          <label htmlFor="categoria-producto">Categoría</label>
          <select id="categoria-producto" value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
            {categorias.map((opcion) => <option key={opcion}>{opcion}</option>)}
          </select>
        </div>
      </div>
      <p role="status">{visibles.length} productos</p>
      <div className="lista-productos">
        {visibles.map((producto) => (
          <TarjetaProducto
            key={producto.id}
            producto={producto}
            onVerDetalle={onVerDetalle}
            onAgregar={onAgregar}
          />
        ))}
      </div>
      {visibles.length === 0 && <p>No encontramos productos con esa búsqueda.</p>}
    </section>
  );
}

export default Productos;
