import Boton from "../components/Boton.jsx";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { esRutValido, formatearRut } from "../datos/rut.js";

// El registro tiene su propia página y conserva las validaciones de la cuenta.
export default function Registro({ onRegistrar }) {
  const [parametros] = useSearchParams();
  const destino =
    parametros.get("destino") === "carrito" ? "?destino=carrito" : "";
  const [mensajeRegistro, setMensajeRegistro] = useState("");
  const [rut, setRut] = useState("");
  const [mensajeRut, setMensajeRut] = useState("");
  // Valida el RUT y la confirmación de contraseña antes de solicitar una cuenta
  // de comprador.
  function registrarCuenta(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.target);
    setMensajeRut("");
    setMensajeRegistro("");

    if (!esRutValido(rut)) {
      setMensajeRut("Ingresa un RUT válido con su dígito verificador.");
      return;
    }

    if (datos.get("contrasena") !== datos.get("confirmacion")) {
      setMensajeRegistro("Las contraseñas no coinciden.");
      return;
    }
    const usuario = {
      nombre: datos.get("nombre").trim(),
      rut: formatearRut(rut),
      correo: datos.get("correo").trim().toLowerCase(),
      contrasena: datos.get("contrasena"),
      rol: "comprador",
    };

    if (!onRegistrar(usuario)) {
      setMensajeRegistro("Ya existe una cuenta con ese RUT o correo.");
      return;
    }

    // Al crear la cuenta, App abre la sesión y muestra Mi cuenta.
  }

  // Revisa el dígito verificador y aplica el formato chileno cuando el RUT es
  // válido.
  function revisarRut() {
    if (rut.length === 0) {
      setMensajeRut("");
    } else if (esRutValido(rut)) {
      setRut(formatearRut(rut));
      setMensajeRut("RUT válido.");
    } else {
      setMensajeRut("Revisa el RUT y su dígito verificador.");
    }
  }

  return (
    <section className="pantalla-formularios acceso-individual">
      <div className="titulo-pantalla">
        <h1>Crea tu cuenta.</h1>
      </div>
      <section className="panel-formulario panel-registro">
        <form onSubmit={registrarCuenta}>
          <label htmlFor="registro-nombre">Nombre</label>
          <input
            id="registro-nombre"
            name="nombre"
            autoComplete="name"
            maxLength="80"
            required
          />

          <label htmlFor="registro-rut">RUT</label>
          <input
            id="registro-rut"
            name="rut"
            value={rut}
            onChange={(evento) => setRut(evento.target.value)}
            onBlur={revisarRut}
            placeholder="12.345.678-5"
            maxLength="12"
            required
          />
          <p className="ayuda-formulario">{mensajeRut}</p>

          <label htmlFor="registro-correo">Correo electrónico</label>
          <input
            id="registro-correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
          />

          <label htmlFor="registro-contrasena">Contraseña</label>
          <input
            id="registro-contrasena"
            autoComplete="new-password"
            name="contrasena"
            type="password"
            minLength="6"
            required
          />
          <p className="ayuda-formulario">Mínimo 6 caracteres.</p>

          <label htmlFor="registro-confirmacion">Confirmar contraseña</label>
          <input
            id="registro-confirmacion"
            name="confirmacion"
            type="password"
            autoComplete="new-password"
            minLength="6"
            required
          />
          <Boton type="submit">Crear cuenta</Boton>
        </form>
        <p className="mensaje-formulario" role="status">
          {mensajeRegistro}
        </p>
      </section>
      <p>
        ¿Ya tienes cuenta?{" "}
        <Link to={`/acceso${destino}`}>Volver a iniciar sesión</Link>
      </p>
    </section>
  );
}
