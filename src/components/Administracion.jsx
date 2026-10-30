import { Link, NavLink, Route, Routes } from "react-router-dom";
import AdminResumen from "./admin/AdminResumen.jsx";
import AdminProductos from "./admin/AdminProductos.jsx";
import AdminUsuarios from "./admin/AdminUsuarios.jsx";
import AdminPedidos from "./admin/AdminPedidos.jsx";
import AdminMensajes from "./admin/AdminMensajes.jsx";

const secciones = [
  ["", "Resumen"],
  ["productos", "Productos"],
  ["pedidos", "Pedidos"],
  ["usuarios", "Usuarios"],
  ["mensajes", "Mensajes"],
];

export default function Administracion({ tienda }) {
  return (
    <section className="administracion-app">
      <h1>Administración de Grano</h1>
      <nav className="menu-admin" aria-label="Administración">
        {secciones.map(([ruta, nombre]) => (
          <NavLink key={ruta} to={`/admin${ruta ? "/" + ruta : ""}`} end>
            {nombre}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route index element={<AdminResumen {...tienda} />} />
        <Route
          path="productos"
          element={
            <AdminProductos
              productos={tienda.productos}
              onGuardar={tienda.guardarProducto}
              onEliminar={tienda.quitarProducto}
            />
          }
        />
        <Route
          path="pedidos"
          element={
            <AdminPedidos
              pedidos={tienda.pedidos}
              onCambiarEstado={tienda.cambiarEstadoPedido}
            />
          }
        />
        <Route
          path="usuarios"
          element={
            <AdminUsuarios
              usuarios={tienda.usuarios}
              sesion={tienda.sesion}
              onCrear={tienda.registrar}
              onGuardar={tienda.guardarUsuario}
            />
          }
        />
        <Route
          path="mensajes"
          element={
            <AdminMensajes mensajes={tienda.mensajes} onMarcar={tienda.marcarMensaje} />
          }
        />
        <Route
          path="*"
          element={
            <section>
              <h2>No encontramos esta sección.</h2>
              <Link to="/admin">Volver al resumen</Link>
            </section>
          }
        />
      </Routes>
    </section>
  );
}
