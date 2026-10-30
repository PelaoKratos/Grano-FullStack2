import { Link, useSearchParams } from "react-router-dom";
import { usuariosDemostracion } from "../datos/usuarios.js";
import { useState } from "react";
import { esRutValido, formatearRut } from "../datos/rut.js";

function Acceso({
  onIniciar,
  onRegistrar,
  onCambiarContrasena,
  modo = "completo",
}) {
  const [parametros] = useSearchParams();
  const destino = parametros.get("destino") === "carrito" ? "?destino=carrito" : "";
  const [copiado, setCopiado] = useState("");
  const [mensajeLogin, setMensajeLogin] = useState("");
  const [mensajeRegistro, setMensajeRegistro] = useState("");
  const [mensajeClave, setMensajeClave] = useState("");
  const [rut, setRut] = useState("");
  const [mensajeRut, setMensajeRut] = useState("");

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

  function registrarCuenta(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.target);

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
    <section
      className={`pantalla-formularios ${modo !== "completo" ? "acceso-individual" : ""}`}
    >
      <div className="titulo-pantalla">
        <h1>
          {modo === "registro"
            ? "Crea tu cuenta."
            : modo === "clave"
              ? "Cambia tu contraseña."
              : "Tu pausa empieza aquí."}
        </h1>
      </div>

      <div className="columnas-formularios">
        {modo !== "registro" && (
          <section className="panel-formulario">
            {modo !== "clave" && (
              <>
                <h2>Iniciar sesión</h2>
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

                  <button type="submit">Iniciar sesión</button>
                </form>
                <p className="mensaje-formulario" role="status">
                  {mensajeLogin}
                </p>
                <Link to={`/registro${destino}`}>Crear una cuenta</Link>
              </>
            )}
            <details
              className="cambiar-clave"
              open={modo === "clave" ? true : undefined}
            >
              <summary>Cambiar contraseña</summary>
              <form onSubmit={cambiarContrasena}>
                <label htmlFor="clave-correo">Correo electrónico</label>
                <input id="clave-correo" name="correo" type="email" required />
                <label htmlFor="clave-actual">Contraseña actual</label>
                <input
                  id="clave-actual"
                  name="actual"
                  type="password"
                  required
                />
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
            </details>
          </section>
        )}

        {modo !== "clave" && (
          <section className="panel-formulario panel-registro">
            <h2>Crear cuenta</h2>
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

              <label htmlFor="registro-confirmacion">
                Confirmar contraseña
              </label>
              <input
                id="registro-confirmacion"
                name="confirmacion"
                type="password"
                autoComplete="new-password"
                minLength="6"
                required
              />
              <button type="submit">Crear cuenta</button>
            </form>
            <p className="mensaje-formulario" role="status">
              {mensajeRegistro}
            </p>
          </section>
        )}
      </div>
      {modo !== "completo" && (
        <p className="mt-4">
          <Link to={`/acceso${destino}`}>Volver a iniciar sesión</Link>
        </p>
      )}
      {modo === "completo" && (
        <section className="panel-formulario cuentas-demostracion">
          <h2>Prueba los tres perfiles</h2>
          <p>
            Estas cuentas permiten recorrer las funciones de la tienda. Sus
            credenciales se mantienen disponibles.
          </p>
          {usuariosDemostracion.map((u) => (
            <div className="cuenta-demostracion" key={u.correo}>
              <div>
                <strong>{u.nombre}</strong>
                <p>
                  {u.correo}
                  <br />
                  Contraseña: <code>{u.contrasena}</code>
                </p>
              </div>
              <button
                type="button"
                className="boton-secundario"
                aria-label={`Copiar datos de ${u.nombre}`}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${u.correo}\n${u.contrasena}`,
                    );
                    setCopiado(`Datos de ${u.nombre} copiados.`);
                  } catch {
                    setCopiado(
                      "Selecciona y copia el correo y la contraseña que aparecen aquí.",
                    );
                  }
                }}
              >
                Copiar datos
              </button>
            </div>
          ))}
          <p role="status">{copiado}</p>
        </section>
      )}
    </section>
  );
}

export default Acceso;
