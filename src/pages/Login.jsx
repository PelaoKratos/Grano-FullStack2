import Boton from "../components/Boton.jsx";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CuentasDemostracion from "../components/CuentasDemostracion.jsx";

// Esta página solo se encarga del inicio de sesión.
export default function Login({ onIniciar }) {
  const [parametros] = useSearchParams();
  const destino =
    parametros.get("destino") === "carrito" ? "?destino=carrito" : "";
  const [mensajeLogin, setMensajeLogin] = useState("");
  // Lee el correo y la contraseña del formulario y muestra un mensaje si se
  // rechaza el acceso.
  function iniciarSesion(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.target);
    const usuario = onIniciar(datos.get("correo"), datos.get("contrasena"));

    if (!usuario) {
      setMensajeLogin("Correo o contraseña incorrectos, o cuenta desactivada.");
      return;
    }

    setMensajeLogin("");
  }

  return (
    <section className="pantalla-formularios acceso-individual">
      <div className="titulo-pantalla">
        <h1>Iniciar sesión</h1>
      </div>
      <section className="panel-formulario">
        <form onSubmit={iniciarSesion}>
          <label htmlFor="login-correo">Correo electrónico</label>
          <input
            id="login-correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
          />

          <label htmlFor="login-contrasena">Contraseña</label>
          <input
            id="login-contrasena"
            name="contrasena"
            type="password"
            autoComplete="current-password"
            required
          />

          <Boton type="submit">Iniciar sesión</Boton>
        </form>
        <p className="mensaje-formulario" role="status">
          {mensajeLogin}
        </p>
        <p>
          ¿No tienes cuenta?{" "}
          <Link to={`/registro${destino}`}>Crear una cuenta</Link>
        </p>
        <Link to={`/cambiar-clave${destino}`}>Cambiar contraseña</Link>
      </section>
      <CuentasDemostracion />
    </section>
  );
}
