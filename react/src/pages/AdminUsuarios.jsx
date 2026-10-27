import { useState } from "react";

function AdminUsuarios({ usuarios, sesion, onCrear, onGuardar }) {
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
              <select id={`rol-${usuario.correo}`} value={usuario.rol} onChange={(evento) => cambiar(usuario, { rol: evento.target.value })}>
                <option value="comprador">Comprador</option><option value="admin">Administrador</option>
              </select>
              <button className="boton-secundario" type="button" disabled={usuario.correo === sesion.correo} onClick={() => cambiar(usuario, { activo: !usuario.activo })}>
                {usuario.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
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
        <input id="admin-clave" name="contrasena" type="password" minLength="6" required />
        <label htmlFor="admin-rol">Rol</label>
        <select id="admin-rol" name="rol"><option value="comprador">Comprador</option><option value="admin">Administrador</option></select>
        <button type="submit">Crear usuario</button>
      </form>
      <p className="mensaje-formulario" role="status">{mensaje}</p>
    </section>
  );
}

export default AdminUsuarios;
