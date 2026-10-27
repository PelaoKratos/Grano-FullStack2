import { useState } from "react";
import { esRutValido, formatearRut } from "../utils/rut.js";

function Registro({ onRegistrar }) {
  const [rut, setRut] = useState("");
  const [mensaje, setMensaje] = useState("");

  function registrar(evento) {
    evento.preventDefault();
    if (!esRutValido(rut)) {
      setMensaje("Revisa el RUT y su dígito verificador.");
      return;
    }
    const datos = new FormData(evento.currentTarget);
    const usuario = {
      nombre: datos.get("nombre").trim(),
      rut: formatearRut(rut),
      correo: datos.get("correo").trim().toLowerCase(),
      contrasena: datos.get("contrasena"),
      rol: "comprador",
    };
    if (!onRegistrar(usuario)) setMensaje("Ya existe una cuenta con ese RUT o correo.");
  }

  return (
    <section className="pantalla-formularios">
      <div className="titulo-pantalla">
        <p className="etiqueta">TU CUENTA GRANO</p>
        <h1>Crear cuenta</h1>
      </div>
      <div className="panel-formulario formulario-centrado panel-registro">
        <form onSubmit={registrar}>
          <label htmlFor="registro-nombre">Nombre completo</label>
          <input id="registro-nombre" name="nombre" maxLength="80" autoComplete="name" required />
          <label htmlFor="registro-rut">RUT</label>
          <input id="registro-rut" name="rut" value={rut} onChange={(evento) => setRut(evento.target.value)} onBlur={() => esRutValido(rut) && setRut(formatearRut(rut))} placeholder="12.345.678-5" maxLength="12" required />
          <label htmlFor="registro-correo">Correo electrónico</label>
          <input id="registro-correo" name="correo" type="email" autoComplete="email" required />
          <label htmlFor="registro-contrasena">Contraseña</label>
          <input id="registro-contrasena" name="contrasena" type="password" minLength="6" autoComplete="new-password" required />
          <button type="submit">Crear cuenta</button>
        </form>
        <p className="mensaje-formulario" role="alert">{mensaje}</p>
        <p>¿Ya tienes cuenta? <a href="#login">Inicia sesión</a>.</p>
      </div>
    </section>
  );
}

export default Registro;
