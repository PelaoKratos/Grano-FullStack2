import MenuAdmin from "../components/MenuAdmin.jsx";
import AdminResumen from "./AdminResumen.jsx";
import AdminProductos from "./AdminProductos.jsx";
import AdminPedidos from "./AdminPedidos.jsx";
import AdminUsuarios from "./AdminUsuarios.jsx";
import AdminMensajes from "./AdminMensajes.jsx";

function Admin({ ruta, tienda }) {
  let seccion;

  if (ruta === "admin/productos") {
    seccion = <AdminProductos productos={tienda.productos} onGuardar={tienda.guardarProducto} onEliminar={tienda.eliminarProducto} />;
  } else if (ruta === "admin/pedidos") {
    seccion = <AdminPedidos pedidos={tienda.pedidos} onCambiarEstado={tienda.cambiarEstadoPedido} />;
  } else if (ruta === "admin/usuarios") {
    seccion = <AdminUsuarios usuarios={tienda.usuarios} sesion={tienda.sesion} onCrear={tienda.registrarUsuario} onGuardar={tienda.guardarUsuario} />;
  } else if (ruta === "admin/mensajes") {
    seccion = <AdminMensajes mensajes={tienda.mensajes} onMarcar={tienda.marcarMensaje} />;
  } else {
    seccion = <AdminResumen productos={tienda.productos} pedidos={tienda.pedidos} usuarios={tienda.usuarios} mensajes={tienda.mensajes} />;
  }

  return (
    <section className="pantalla-admin">
      <p className="etiqueta">PANEL DE ADMINISTRACIÓN</p>
      <h1>Administración de Grano</h1>
      <MenuAdmin />
      {seccion}
    </section>
  );
}

export default Admin;
