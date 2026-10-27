import { useState } from "react";
import { usuariosDemostracion } from "../data/usuarios.js";

function Login({ onIniciar }) {
  const [mensaje, setMensaje] = useState("");

  async function copiarCuenta(usuario) {
    try {
      await navigator.clipboard.writeText(`${usuario.correo}\n${usuario.contrasena}`);
      setMensaje(`Datos de ${nombreRol(usuario.rol)} copiados.`);
    } catch {
      setMensaje("Selecciona y copia el correo y la contraseña que aparecen aquí.");
    }
  }

  function nombreRol(rol) {
    if (rol === "admin") return "administrador";
    if (rol === "vendedor") return "vendedor";
    return "comprador";
  }

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
      </div>

      <section className="cuentas-demostracion">
        <h2>Cuentas para probar</h2>
        <p>Usa estas cuentas académicas. No ingreses contraseñas personales.</p>
        {usuariosDemostracion.map((usuario) => (
          <article className="cuenta-demostracion" key={usuario.correo}>
            <div>
              <h3>{nombreRol(usuario.rol)}</h3>
              <p><strong>Correo:</strong> <code>{usuario.correo}</code></p>
              <p><strong>Contraseña:</strong> <code>{usuario.contrasena}</code></p>
            </div>
            <button type="button" className="boton-secundario" onClick={() => copiarCuenta(usuario)}>
              Copiar datos
            </button>
          </article>
        ))}
      </section>
    </section>
  );
}

export default Login;
