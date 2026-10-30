import { useState } from "react";
import TarjetaProducto from "./TarjetaProducto.jsx";
import { Link, useSearchParams } from "react-router-dom";
import { categoriasBase, claveCategoria } from "../datos/categorias.js";
export default function Catalogo({
  productos,
  onAgregar,
  categorias = categoriasBase,
}) {
  const filtros = [
    ["todos", "Todo"],
    ...categorias.map((nombre) => [claveCategoria(nombre), nombre]),
  ];
  const [parametros, setParametros] = useSearchParams();
  const categoria = parametros.get("categoria") || "todos";
  const [busqueda, setBusqueda] = useState("");
  const actual = filtros.some(([id]) => id === categoria) ? categoria : "todos";
  const visibles = productos.filter(
    (productoCatalogo) =>
      (actual === "todos" ||
        claveCategoria(productoCatalogo.categoria) === actual) &&
      productoCatalogo.nombre
        .toLocaleLowerCase("es")
        .includes(busqueda.trim().toLocaleLowerCase("es")),
  );
  return (
    <>
      <div className="encabezado mb-4">
        <h1>Encuentra tu próximo ritual.</h1>
        <p className="text-secondary">
          Cafés, métodos y accesorios. Precios en pesos chilenos.
        </p>
        <p className="mt-3">
          <Link to="/categorias">Explorar categorías</Link> ·{" "}
          <Link to="/ofertas">Ver ofertas</Link>
        </p>
      </div>
      <div className="busqueda-catalogo">
        <label htmlFor="buscar-producto">Buscar por nombre</label>
        <input
          id="buscar-producto"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Colombia, taza, prensa…"
        />
      </div>
      <div className="catalogo-herramientas">
        <div
          className="filtros-catalogo"
          role="group"
          aria-label="Filtrar colección"
        >
          {filtros.map(([id, label]) => (
            <button
              type="button"
              key={id}
              aria-pressed={actual === id}
              onClick={() => {
                const siguientes = new URLSearchParams(parametros);
                if (id === "todos") {
                  siguientes.delete("categoria");
                } else {
                  siguientes.set("categoria", id);
                }
                setParametros(siguientes);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p role="status" data-resultados>
          {visibles.length} {visibles.length === 1 ? "producto" : "productos"}
        </p>
      </div>
      {!visibles.length && (
        <p className="panel">
          No encontramos productos con esos filtros. Prueba otro nombre o
          categoría.
        </p>
      )}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {visibles.map((productoCatalogo) => (
          <div className="col" key={productoCatalogo.id}>
            <TarjetaProducto
              producto={productoCatalogo}
              onAgregar={onAgregar}
            />
          </div>
        ))}
      </div>
    </>
  );
}
