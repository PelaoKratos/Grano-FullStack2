import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// El cambio de contraseña se abre desde el enlace del login.
export default function CambiarContrasena({ onCambiarContrasena }) {
  const [parametros] = useSearchParams();
  const destino =
    parametros.get("destino") === "carrito" ? "?destino=carrito" : "";
  const [mensajeClave, setMensajeClave] = useState("");
  // Envía las credenciales y la nueva contraseña, y limpia el formulario si se
  // guardó el cambio.
  function cambiarContrasena(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.target);
    const cambioCorrecto = onCambiarContrasena(
      datos.get("correo").trim().toLowerCase(),
      datos.get("actual"),
      datos.get("nueva"),
    );

    if (!cambioCorrecto) {
      setMensajeClave("No pudimos validar el correo y la contraseña actual.");
      return;
    }

    evento.target.reset();
    setMensajeClave("Contraseña actualizada.");
  }

  return (
    <section className="pantalla-formularios acceso-individual">
      <div className="titulo-pantalla">
        <h1>Cambia tu contraseña.</h1>
      </div>
      <section className="panel-formulario">
        <form onSubmit={cambiarContrasena}>
          <label htmlFor="clave-correo">Correo electrónico</label>
          <input id="clave-correo" name="correo" type="email" required />
          <label htmlFor="clave-actual">Contraseña actual</label>
          <input id="clave-actual" name="actual" type="password" required />
          <label htmlFor="clave-nueva">Nueva contraseña</label>
          <input
            id="clave-nueva"
            name="nueva"
            type="password"
            minLength="6"
            required
          />
          <button type="submit">Actualizar contraseña</button>
        </form>
        <p className="mensaje-formulario" role="status">
          {mensajeClave}
        </p>
      </section>
      <Link to={`/acceso${destino}`}>Volver a iniciar sesión</Link>
    </section>
  );
}
