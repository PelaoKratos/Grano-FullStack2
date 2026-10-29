import { useState } from "react";

function Contacto({ usuario, onEnviar }) {
  const [mensaje, setMensaje] = useState("");

  function enviarMensaje(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.target);
    const enviado = onEnviar({
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
    evento.target.reset();
    setMensaje("Mensaje enviado. Gracias por escribirnos.");
  }

  return (
    <section className="pantalla-contacto">
      <h1>Nos gustaría leerte.</h1>
      <p>Cuéntanos qué te gustaría saber de nuestros cafés y accesorios.</p>

      <form className="panel-formulario" onSubmit={enviarMensaje}>
        {!usuario && (
          <>
            <label htmlFor="contacto-nombre">Nombre</label>
            <input id="contacto-nombre" name="nombre" required />
            <label htmlFor="contacto-correo">Correo electrónico</label>
            <input id="contacto-correo" name="correo" type="email" required />
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
        <button type="submit">Enviar mensaje</button>
        <p className="mensaje-formulario" role="status">
          {mensaje}
        </p>
      </form>
    </section>
  );
}

export default Contacto;
