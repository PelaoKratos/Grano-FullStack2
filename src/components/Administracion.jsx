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
export default function Administracion({ path, tienda }) {
  let contenido;
  if (path === "/admin/productos")
    contenido = (
      <AdminProductos
        productos={tienda.productos}
        onGuardar={tienda.guardarProducto}
        onEliminar={tienda.quitarProducto}
      />
    );
  else if (path === "/admin/pedidos")
    contenido = (
      <AdminPedidos
        pedidos={tienda.pedidos}
        onCambiarEstado={tienda.cambiarEstadoPedido}
      />
    );
  else if (path === "/admin/usuarios")
    contenido = (
      <AdminUsuarios
        usuarios={tienda.usuarios}
        sesion={tienda.sesion}
        onCrear={tienda.registrar}
        onGuardar={tienda.guardarUsuario}
      />
    );
  else if (path === "/admin/mensajes")
    contenido = (
      <AdminMensajes
        mensajes={tienda.mensajes}
        onMarcar={tienda.marcarMensaje}
      />
    );
  else contenido = <AdminResumen {...tienda} />;
  return (
    <section className="administracion-app">
      <h1>Administración de Grano</h1>
      <nav className="menu-admin" aria-label="Administración">
        {secciones.map(([ruta, nombre]) => {
          const destino = `/admin${ruta ? "/" + ruta : ""}`;
          return (
            <a
              key={destino}
              href={`#${destino}`}
              aria-current={path === destino ? "page" : undefined}
            >
              {nombre}
            </a>
          );
        })}
      </nav>
      {contenido}
    </section>
  );
}
