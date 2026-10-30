import { useState } from "react";
import { Link } from "react-router-dom";

function AdminUsuarios({ usuarios, pedidos = [], sesion, onCrear, onGuardar }) {
  const [mensaje, setMensaje] = useState("");

  function crear(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const usuario = {
      nombre: datos.get("nombre").trim(),
      correo: datos.get("correo").trim().toLowerCase(),
      contrasena: datos.get("contrasena"),
      rol: datos.get("rol"),
    };
    if (!onCrear(usuario)) {
      setMensaje("Ya existe una cuenta con ese correo.");
      return;
    }
    evento.currentTarget.reset();
    setMensaje("Usuario creado correctamente.");
  }

  function cambiar(usuario, cambio) {
    if (!onGuardar({ ...usuario, ...cambio })) {
      setMensaje("No puedes desactivar tu propia cuenta de administrador.");
      return;
    }
    setMensaje("Usuario actualizado.");
  }

  return (
    <section className="panel-formulario">
      <h2>Usuarios</h2>
      <ul className="lista-admin">
        {usuarios.map((usuario) => (
          <li key={usuario.correo}>
            <strong>{usuario.nombre}</strong> · {usuario.correo}
            <div className="acciones-admin">
              <label htmlFor={`rol-${usuario.correo}`}>Rol</label>
              <select
                id={`rol-${usuario.correo}`}
                value={usuario.rol}
                disabled={
                  usuario.cuentaDemostracion || usuario.correo === sesion.correo
                }
                onChange={(evento) =>
                  cambiar(usuario, { rol: evento.target.value })
                }
              >
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
              <button
                className="boton-secundario"
                type="button"
                disabled={
                  usuario.correo === sesion.correo || usuario.cuentaDemostracion
                }
                onClick={() => cambiar(usuario, { activo: !usuario.activo })}
              >
                {usuario.activo ? "Desactivar" : "Activar"}
              </button>
              {usuario.cuentaDemostracion && <small>Cuenta de prueba</small>}
            </div>
            {!usuario.cuentaDemostracion && (
              <details className="mt-3">
                <summary>Editar datos del usuario</summary>
                <form
                  onSubmit={(evento) => {
                    evento.preventDefault();
                    const datos = new FormData(evento.currentTarget);
                    cambiar(
                      usuario,
                      Object.fromEntries(
                        [
                          "nombre",
                          "telefono",
                          "direccion",
                          "comuna",
                          "region",
                        ].map((campo) => [campo, datos.get(campo).trim()]),
                      ),
                    );
                  }}
                >
                  {[
                    ["nombre", "Nombre"],
                    ["telefono", "Teléfono"],
                    ["direccion", "Dirección"],
                    ["comuna", "Comuna"],
                    ["region", "Región"],
                  ].map(([campo, etiqueta]) => (
                    <div key={campo}>
                      <label htmlFor={`usuario-${usuario.correo}-${campo}`}>
                        {etiqueta}
                      </label>
                      <input
                        id={`usuario-${usuario.correo}-${campo}`}
                        name={campo}
                        defaultValue={usuario[campo] || ""}
                        required={campo === "nombre"}
                      />
                    </div>
                  ))}
                  <button type="submit">Guardar datos</button>
                </form>
              </details>
            )}
            <details className="mt-3">
              <summary>Historial de compras</summary>
              {pedidos.some((pedido) => pedido.comprador === usuario.correo) ? (
                <ul>
                  {pedidos
                    .filter((pedido) => pedido.comprador === usuario.correo)
                    .map((pedido) => (
                      <li key={pedido.id}>
                        <Link to={`/admin/pedidos/${pedido.id}`}>
                          {pedido.id}
                        </Link>{" "}
                        · {pedido.estado}
                      </li>
                    ))}
                </ul>
              ) : (
                <p>Sin compras registradas.</p>
              )}
            </details>
          </li>
        ))}
      </ul>
      <h3>Crear usuario</h3>
      <form onSubmit={crear}>
        <label htmlFor="admin-nombre">Nombre</label>
        <input id="admin-nombre" name="nombre" required />
        <label htmlFor="admin-correo">Correo electrónico</label>
        <input id="admin-correo" name="correo" type="email" required />
        <label htmlFor="admin-clave">Contraseña</label>
        <input
          id="admin-clave"
          name="contrasena"
          type="password"
          minLength="6"
          required
        />
        <label htmlFor="admin-rol">Rol</label>
        <select id="admin-rol" name="rol">
          <option value="comprador">Comprador</option>
          <option value="vendedor">Vendedor</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit">Crear usuario</button>
      </form>
      <p className="mensaje-formulario" role="status">
        {mensaje}
      </p>
    </section>
  );
}

export default AdminUsuarios;
