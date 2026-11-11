import Boton from "../Boton.jsx";
import { useState } from "react";

// Lista las categorías y ofrece controles para crearlas, renombrarlas o
// eliminarlas.
export default function AdminCategorias({
  categorias,
  productos,
  onGuardar,
  onEliminar,
}) {
  const [editada, setEditada] = useState("");
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  // Solicita crear o renombrar la categoría y reinicia el formulario si se
  // guardó.
  function guardar(evento) {
    evento.preventDefault();
    if (!onGuardar(editada, nombre)) {
      setMensaje("Revisa el nombre: no puede estar vacío ni repetido.");
      return;
    }
    setNombre("");
    setEditada("");
    setMensaje("Categoría guardada.");
  }
  return (
    <section className="panel-formulario">
      <h2>Categorías del catálogo</h2>
      <ul className="lista-admin">
        {categorias.map((categoria) => (
          <li key={categoria}>
            <strong>{categoria}</strong> · Productos:{" "}
            {
              productos.filter((producto) => producto.categoria === categoria)
                .length
            }
            <div className="acciones-admin">
              <Boton
                variante="secundario"
                type="button"

                onClick={() => {
                  setEditada(categoria);
                  setNombre(categoria);
                }}
              >
                Editar
              </Boton>
              <Boton
                variante="secundario"
                type="button"

                disabled={productos.some(
                  (producto) => producto.categoria === categoria,
                )}
                onClick={() => {
                  if (onEliminar(categoria)) {
                    if (editada === categoria) {
                      setEditada("");
                      setNombre("");
                    }
                    setMensaje("Categoría eliminada.");
                  } else {
                    setMensaje(
                      "No se puede eliminar una categoría con productos.",
                    );
                  }
                }}
              >
                Eliminar
              </Boton>
            </div>
          </li>
        ))}
      </ul>
      <h3>{editada ? "Editar categoría" : "Nueva categoría"}</h3>
      <form onSubmit={guardar}>
        <label htmlFor="categoria-nombre">Nombre</label>
        <input
          id="categoria-nombre"
          value={nombre}
          maxLength={60}
          onChange={(evento) => setNombre(evento.target.value)}
          required
        />
        <Boton type="submit">Guardar categoría</Boton>
        {editada && (
          <Boton
            variante="secundario"
            type="button"
            className="mt-2"
            onClick={() => {
              setEditada("");
              setNombre("");
            }}
          >
            Cancelar
          </Boton>
        )}
      </form>
      <p className="mensaje-formulario" role="status">
        {mensaje}
      </p>
    </section>
  );
}
