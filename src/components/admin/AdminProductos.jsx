import Boton from "../Boton.jsx";
import { useEffect, useRef, useState } from "react";
import { precioCLP } from "../../datos/formato.js";

// Reúne el formulario de productos y los controles para administrar el catálogo
// y el stock.
function AdminProductos({
  productos,
  categorias = ["Café en grano", "Métodos", "Accesorios"],
  onGuardar,
  onEliminar,
}) {
  const formularioRef = useRef(null);
  const [editado, setEditado] = useState(null);
  useEffect(() => {
    if (editado) {
      formularioRef.current?.querySelector("input")?.focus();
    }
  }, [editado]);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Prepara los datos del producto y convierte la imagen si supera la validación.
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
      precioAnterior: datos.get("precioAnterior"),
      stock: datos.get("stock"),
      critico: datos.get("critico"),
    };

    // Envía el producto con la imagen disponible y limpia el formulario si se
    // guardó.
    async function terminar(imagen) {
      setGuardando(true);
      try {
        if (!(await onGuardar({ ...producto, imagen }))) {
          setMensaje(
            "Revisa los datos o el error que aparece arriba e inténtalo otra vez.",
          );
          return;
        }
        setEditado(null);
        formulario.reset();
        setMensaje("Producto guardado correctamente.");
      } catch {
        setMensaje(
          "No se pudo guardar el producto. Tus datos siguen en el formulario.",
        );
      } finally {
        setGuardando(false);
      }
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
    setGuardando(true);
    lector.onload = () => terminar(lector.result);
    lector.onerror = () => {
      setGuardando(false);
      setMensaje("No se pudo leer la imagen.");
    };
    lector.readAsDataURL(archivo);
  }

  // Pide confirmación para quitar un producto y cierra su edición si se
  // eliminó.
  async function eliminar(producto) {
    if (!window.confirm(`¿Quitar ${producto.nombre} del catálogo?`)) {
      return;
    }
    setGuardando(true);
    try {
      if (!(await onEliminar(producto.id))) {
        setMensaje("No se pudo quitar el producto. Vuelve a intentarlo.");
        return;
      }
      if (editado?.id === producto.id) setEditado(null);
      setMensaje("Producto quitado del catálogo.");
    } catch {
      setMensaje("No se pudo quitar el producto. Vuelve a intentarlo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="panel-formulario">
      <h2>Productos y stock</h2>
      <form ref={formularioRef} key={editado?.id || "nuevo"} onSubmit={guardar}>
        <fieldset disabled={guardando} className="border-0 p-0 m-0">
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
            {categorias.map((categoria) => (
              <option key={categoria}>{categoria}</option>
            ))}
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
          <label htmlFor="producto-precio-anterior">
            Precio anterior para oferta (opcional)
          </label>
          <input
            id="producto-precio-anterior"
            name="precioAnterior"
            type="number"
            min="0"
            step="1"
            defaultValue={editado?.precioAnterior || ""}
          />
          <p className="ayuda-formulario">
            Para activar una oferta, el precio anterior debe ser mayor al precio
            actual. Déjalo vacío para quitar la oferta.
          </p>
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
          <Boton type="submit">
            {editado ? "Guardar cambios" : "Agregar producto"}
          </Boton>
          {editado && (
            <Boton
              variante="secundario"

              type="button"
              onClick={() => setEditado(null)}
            >
              Cancelar edición
            </Boton>
          )}
        </fieldset>
      </form>
      <p className="mensaje-formulario" role="status">
        {guardando ? "Guardando cambios…" : mensaje}
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
              <Boton
                variante="secundario"

                type="button"
                aria-label={`Editar ${producto.nombre}`}
                disabled={guardando}
                onClick={() => {
                  setEditado(producto);
                  setMensaje("");
                }}
              >
                Editar
              </Boton>
              <Boton
                variante="secundario"

                type="button"
                aria-label={`Quitar ${producto.nombre}`}
                disabled={guardando}
                onClick={() => eliminar(producto)}
              >
                Quitar
              </Boton>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminProductos;
