import Boton from "./Boton.jsx";
import { useState } from "react";

// Muestra el formulario de contacto y usa los datos de la sesión cuando están
// disponibles.
function Contacto({ usuario, onEnviar }) {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Arma el mensaje con fecha y estado inicial y limpia el formulario cuando se
  // guarda.
  async function enviarMensaje(evento) {
    evento.preventDefault();
    if (enviando) return;
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    setEnviando(true);
    try {
      const enviado = await onEnviar({
        nombre: usuario ? usuario.nombre : datos.get("nombre").trim(),
        correo: usuario ? usuario.correo : datos.get("correo").trim(),
        texto: datos.get("mensaje").trim(),
        fecha: new Date().toLocaleDateString("es-CL"),
        estado: "Nuevo",
      });
      if (!enviado) {
        setMensaje(
          "No pudimos guardar el mensaje. Revisa el texto y vuelve a intentarlo.",
        );
        return;
      }
      formulario.reset();
      setMensaje("Mensaje enviado. Gracias por escribirnos.");
    } catch {
      setMensaje(
        "No pudimos enviar el mensaje. Tus datos siguen en el formulario.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="pantalla-contacto">
      <h1>Nos gustaría leerte.</h1>
      <p>Cuéntanos qué te gustaría saber de nuestros cafés y accesorios.</p>

      <form className="panel-formulario" onSubmit={enviarMensaje}>
        <fieldset disabled={enviando} className="border-0 p-0 m-0">
          {!usuario && (
            <>
              <label htmlFor="contacto-nombre">Nombre</label>
              <input
                id="contacto-nombre"
                name="nombre"
                maxLength="80"
                required
              />
              <label htmlFor="contacto-correo">Correo electrónico</label>
              <input
                id="contacto-correo"
                name="correo"
                type="email"
                maxLength="120"
                required
              />
            </>
          )}

          <label htmlFor="contacto-mensaje">Mensaje</label>
          <textarea
            id="contacto-mensaje"
            name="mensaje"
            rows="5"
            maxLength="500"
            required
          />
          <p className="ayuda-formulario">Máximo 500 caracteres.</p>
          <Boton type="submit">
            {enviando ? "Enviando…" : "Enviar mensaje"}
          </Boton>
          <p className="mensaje-formulario" role="status">
            {mensaje}
          </p>
        </fieldset>
      </form>
    </section>
  );
}

export default Contacto;
