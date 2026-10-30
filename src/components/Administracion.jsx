import { Link, NavLink, Route, Routes } from "react-router-dom";
import AdminResumen from "./admin/AdminResumen.jsx";
import AdminProductos from "./admin/AdminProductos.jsx";
import AdminUsuarios from "./admin/AdminUsuarios.jsx";
import AdminPedidos from "./admin/AdminPedidos.jsx";
import AdminMensajes from "./admin/AdminMensajes.jsx";
import AdminCategorias from "./admin/AdminCategorias.jsx";
import AdminReportes from "./admin/AdminReportes.jsx";
import Cuenta from "./Cuenta.jsx";
import ResumenPedido from "./ResumenPedido.jsx";
import { useParams } from "react-router-dom";

function DetallePedidoAdmin({ pedidos }) {
  const { id } = useParams();
  const pedido = pedidos.find((pedido) => pedido.id === id);
  return (
    <section>
      {pedido ? (
        <ResumenPedido pedido={pedido} />
      ) : (
        <h2>No encontramos este pedido.</h2>
      )}
      <Link to="/admin/pedidos">Volver a pedidos</Link>
    </section>
  );
}

const secciones = [
  ["", "Resumen"],
  ["productos", "Productos"],
  ["pedidos", "Pedidos"],
  ["usuarios", "Usuarios"],
  ["mensajes", "Mensajes"],
  ["categorias", "Categorías"],
  ["reportes", "Reportes"],
  ["perfil", "Mi perfil"],
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
              categorias={tienda.categorias}
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
              pedidos={tienda.pedidos}
              sesion={tienda.sesion}
              onCrear={tienda.registrar}
              onGuardar={tienda.guardarUsuario}
            />
          }
        />
        <Route
          path="mensajes"
          element={
            <AdminMensajes
              mensajes={tienda.mensajes}
              onMarcar={tienda.marcarMensaje}
            />
          }
        />
        <Route
          path="pedidos/:id"
          element={<DetallePedidoAdmin pedidos={tienda.pedidos} />}
        />
        <Route
          path="categorias"
          element={
            <AdminCategorias
              categorias={tienda.categorias}
              productos={tienda.productos}
              onGuardar={tienda.guardarCategoria}
              onEliminar={tienda.quitarCategoria}
            />
          }
        />
        <Route
          path="reportes"
          element={
            <AdminReportes
              pedidos={tienda.pedidos}
              productos={tienda.productos}
            />
          }
        />
        <Route
          path="perfil"
          element={
            <Cuenta
              usuario={tienda.usuarios.find(
                (usuario) => usuario.correo === tienda.sesion.correo,
              )}
              onGuardar={tienda.guardarPerfil}
              mostrarHistorial={false}
            />
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
