import { useState } from "react";

function CambiarContrasena({ onCambiar }) {
  const [mensaje, setMensaje] = useState("");

  function guardar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const correcto = onCambiar(datos.get("correo").trim().toLowerCase(), datos.get("actual"), datos.get("nueva"));
    if (!correcto) {
      setMensaje("No pudimos validar el correo y la contraseña actual.");
      return;
    }
    evento.currentTarget.reset();
    setMensaje("Contraseña actualizada.");
  }

  return (
    <section className="pantalla-formularios">
      <div className="titulo-pantalla"><h1>Cambiar contraseña</h1></div>
      <div className="panel-formulario formulario-centrado">
        <form onSubmit={guardar}>
          <label htmlFor="clave-correo">Correo electrónico</label>
          <input id="clave-correo" name="correo" type="email" required />
          <label htmlFor="clave-actual">Contraseña actual</label>
          <input id="clave-actual" name="actual" type="password" required />
          <label htmlFor="clave-nueva">Nueva contraseña</label>
          <input id="clave-nueva" name="nueva" type="password" minLength="6" required />
          <button type="submit">Actualizar contraseña</button>
        </form>
        <p className="mensaje-formulario" role="status">{mensaje}</p>
        <a href="#login">Volver al inicio de sesión</a>
      </div>
    </section>
  );
}

export default CambiarContrasena;
