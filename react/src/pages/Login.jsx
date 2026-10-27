import { useState } from "react";

function Login({ onIniciar }) {
  const [mensaje, setMensaje] = useState("");

  function ingresar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const usuario = onIniciar(datos.get("correo"), datos.get("contrasena"));
    if (!usuario) setMensaje("Correo o contraseña incorrectos, o cuenta desactivada.");
  }

  return (
    <section className="pantalla-formularios">
      <div className="titulo-pantalla">
        <p className="etiqueta">TU CUENTA GRANO</p>
        <h1>Iniciar sesión</h1>
      </div>
      <div className="panel-formulario formulario-centrado">
        <form onSubmit={ingresar}>
          <label htmlFor="login-correo">Correo electrónico</label>
          <input id="login-correo" name="correo" type="email" autoComplete="username" required />
          <label htmlFor="login-contrasena">Contraseña</label>
          <input id="login-contrasena" name="contrasena" type="password" autoComplete="current-password" required />
          <button type="submit">Ingresar</button>
        </form>
        <p className="mensaje-formulario" role="alert">{mensaje}</p>
        <p>¿No tienes cuenta? <a href="#registro">Crea una aquí</a>.</p>
        <p><a href="#cambiar-clave">Cambiar contraseña</a></p>
        <p className="ayuda-formulario">Acceso de prueba: admin@duocuc.cl · 1234</p>
      </div>
    </section>
  );
}

export default Login;
