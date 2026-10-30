import { useEffect, useRef, useState } from "react";
import { precioCLP } from "../../datos/formato.js";

function AdminProductos({ productos, onGuardar, onEliminar }) {
  const formularioRef = useRef(null);
  const [editado, setEditado] = useState(null);
  useEffect(() => {
    if (editado) {
      formularioRef.current?.querySelector("input")?.focus();
    }
  }, [editado]);
  const [mensaje, setMensaje] = useState("");

  function guardar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    const archivo = datos.get("imagen");
    const producto = {
      id: editado?.id,
      nombre: datos.get("nombre"),
      categoria: datos.get("categoria"),
      descripcion: datos.get("descripcion"),
      detalle: datos.get("detalle"),
      precio: datos.get("precio"),
      stock: datos.get("stock"),
      critico: datos.get("critico"),
    };

    function terminar(imagen) {
      if (!onGuardar({ ...producto, imagen })) {
        setMensaje(
          "Revisa los datos, el nombre repetido o el espacio del navegador.",
        );
        return;
      }
      setEditado(null);
      formulario.reset();
      setMensaje("Producto guardado correctamente.");
    }

    if (!archivo || archivo.size === 0) {
      terminar("");
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(archivo.type) ||
      archivo.size > 500000
    ) {
      setMensaje("Elige una imagen JPG, PNG o WebP de hasta 500 KB.");
      return;
    }
    const lector = new FileReader();
    lector.onload = () => terminar(lector.result);
    lector.onerror = () => setMensaje("No se pudo leer la imagen.");
    lector.readAsDataURL(archivo);
  }

  function eliminar(producto) {
    if (!window.confirm(`¿Quitar ${producto.nombre} del catálogo?`)) {
      return;
    }
    if (!onEliminar(producto.id)) {
      setMensaje("No se pudo quitar el producto. Vuelve a intentarlo.");
      return;
    }
    if (editado?.id === producto.id) {
      setEditado(null);
    }
    setMensaje("Producto quitado del catálogo.");
  }

  return (
    <section className="panel-formulario">
      <h2>Productos y stock</h2>
      <form ref={formularioRef} key={editado?.id || "nuevo"} onSubmit={guardar}>
        <label htmlFor="producto-nombre">Nombre</label>
        <input
          id="producto-nombre"
          name="nombre"
          defaultValue={editado?.nombre || ""}
          maxLength="80"
          required
        />
        <label htmlFor="producto-categoria">Categoría</label>
        <select
          id="producto-categoria"
          name="categoria"
          defaultValue={editado?.categoria || "Café en grano"}
        >
          <option>Café en grano</option>
          <option>Métodos</option>
          <option>Accesorios</option>
        </select>
        <label htmlFor="producto-descripcion">Descripción corta</label>
        <input
          id="producto-descripcion"
          name="descripcion"
          defaultValue={editado?.descripcion || ""}
          maxLength="120"
          required
        />
        <label htmlFor="producto-detalle">Detalle</label>
        <textarea
          id="producto-detalle"
          name="detalle"
          defaultValue={editado?.detalle || ""}
          rows="3"
          maxLength="500"
          required
        />
        <label htmlFor="producto-precio">Precio en pesos</label>
        <input
          id="producto-precio"
          name="precio"
          type="number"
          min="1"
          step="1"
          defaultValue={editado?.precio || ""}
          required
        />
        <label htmlFor="producto-stock">Stock disponible</label>
        <input
          id="producto-stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          defaultValue={editado?.stock ?? 10}
          required
        />
        <label htmlFor="producto-critico">Avisar cuando queden</label>
        <input
          id="producto-critico"
          name="critico"
          type="number"
          min="0"
          step="1"
          defaultValue={editado?.critico ?? 3}
          required
        />
        <label htmlFor="producto-imagen">Imagen del producto</label>
        <input
          id="producto-imagen"
          name="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        <p className="ayuda-formulario">
          JPG, PNG o WebP de hasta 500 KB. Al editar, deja el campo vacío para
          conservar la imagen.
        </p>
        <button type="submit">
          {editado ? "Guardar cambios" : "Agregar producto"}
        </button>
        {editado && (
          <button
            className="boton-secundario"
            type="button"
            onClick={() => setEditado(null)}
          >
            Cancelar edición
          </button>
        )}
      </form>
      <p className="mensaje-formulario" role="status">
        {mensaje}
      </p>
      <h3>Catálogo actual</h3>
      <ul className="lista-productos-admin">
        {productos.map((producto) => (
          <li key={producto.id}>
            <span>
              {producto.nombre} · {precioCLP(producto.precio)} ·{" "}
              {producto.stock} {producto.stock === 1 ? "unidad" : "unidades"}{" "}
              {producto.stock <= producto.critico && (
                <strong className="aviso-stock">Stock crítico</strong>
              )}
            </span>
            <span className="acciones-admin">
              <button
                className="boton-secundario"
                type="button"
                aria-label={`Editar ${producto.nombre}`}
                onClick={() => {
                  setEditado(producto);
                  setMensaje("");
                }}
              >
                Editar
              </button>
              <button
                className="boton-secundario"
                type="button"
                aria-label={`Quitar ${producto.nombre}`}
                onClick={() => eliminar(producto)}
              >
                Quitar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminProductos;
