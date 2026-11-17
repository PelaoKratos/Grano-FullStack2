import Boton from "../Boton.jsx";
import { useState } from "react";
// Muestra los mensajes de contacto y permite marcar como leídos los que siguen
// pendientes.
function AdminMensajes({ mensajes, onMarcar }) {
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");
  async function marcar(id) {
    if (guardando) return;
    setGuardando(true);
    try {
      setAviso(
        (await onMarcar(id))
          ? "Mensaje marcado como leído."
          : "No pudimos marcar el mensaje. Vuelve a intentar.",
      );
    } catch {
      setAviso("No pudimos marcar el mensaje. Vuelve a intentar.");
    } finally {
      setGuardando(false);
    }
  }
  return (
    <section className="panel-formulario">
      <h2>Mensajes recibidos</h2>
      <p role="status">{guardando ? "Guardando…" : aviso}</p>
      {mensajes.length === 0 ? (
        <p>Aún no hay mensajes recibidos.</p>
      ) : (
        <ul className="lista-admin">
          {mensajes.map((mensaje, indice) => (
            <li key={mensaje.id || `${mensaje.fecha}-${indice}`}>
              <strong>{mensaje.nombre}</strong> · {mensaje.correo} ·{" "}
              {mensaje.fecha} · {mensaje.estado}
              <p>{mensaje.texto}</p>
              {mensaje.estado !== "Leído" && (
                <Boton
                  variante="secundario"

                  type="button"
                  disabled={guardando}
                  onClick={() => marcar(mensaje.id ?? indice)}
                >
                  Marcar como leído
                </Boton>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminMensajes;
