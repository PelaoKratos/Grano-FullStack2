import { useState } from "react";
import { usuariosDemostracion } from "../datos/usuarios.js";

// Dejamos los perfiles de prueba disponibles debajo del inicio de sesión.
export default function CuentasDemostracion() {
  const [copiado, setCopiado] = useState("");
  return (
    <section className="panel-formulario cuentas-demostracion">
      <h2>Prueba los tres perfiles</h2>
      <p>
        Estas cuentas permiten recorrer las funciones de la tienda. Sus
        credenciales se mantienen disponibles.
      </p>
      {usuariosDemostracion.map((usuarioRegistrado) => (
        <div className="cuenta-demostracion" key={usuarioRegistrado.correo}>
          <div>
            <strong>{usuarioRegistrado.nombre}</strong>
            <p>
              {usuarioRegistrado.correo}
              <br />
              Contraseña: <code>{usuarioRegistrado.contrasena}</code>
            </p>
          </div>
          <button
            type="button"
            className="boton-secundario"
            aria-label={`Copiar datos de ${usuarioRegistrado.nombre}`}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `${usuarioRegistrado.correo}\n${usuarioRegistrado.contrasena}`,
                );
                setCopiado(`Datos de ${usuarioRegistrado.nombre} copiados.`);
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
  );
}
