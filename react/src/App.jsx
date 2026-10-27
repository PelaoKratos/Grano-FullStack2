import { useEffect, useState } from "react";
import useTienda from "./hooks/useTienda.js";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Inicio from "./pages/Inicio.jsx";
import Productos from "./pages/Productos.jsx";
import DetalleProducto from "./pages/DetalleProducto.jsx";
import Carrito from "./pages/Carrito.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import Contacto from "./pages/Contacto.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import CambiarContrasena from "./pages/CambiarContrasena.jsx";
import Cuenta from "./pages/Cuenta.jsx";
import Admin from "./pages/Admin.jsx";

function App() {
  const tienda = useTienda();
  const [ruta, setRuta] = useState(window.location.hash.slice(1) || "inicio");
  const [aviso, setAviso] = useState("");
  const [mensajeCompra, setMensajeCompra] = useState("");

  useEffect(() => {
    function actualizarRuta() {
      setRuta(window.location.hash.slice(1) || "inicio");
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", actualizarRuta);
    return () => window.removeEventListener("hashchange", actualizarRuta);
  }, []);

  function navegar(destino) {
    window.location.hash = destino;
    setRuta(destino);
    window.scrollTo(0, 0);
  }

  function agregar(producto) {
    const agregado = tienda.agregarAlCarrito(producto.id);
    setMensajeCompra("");
    setAviso(agregado ? `${producto.nombre} se agregó al carrito.` : "No hay más stock disponible de este producto.");
  }

  function comprar() {
    const pedido = tienda.confirmarPedido();
    setMensajeCompra(pedido ? `Pedido ${pedido.id} registrado. Puedes verlo en Mi cuenta.` : "Revisa el stock antes de confirmar el pedido.");
  }

  function entrar(correo, contrasena) {
    const usuario = tienda.iniciarSesion(correo, contrasena);
    if (usuario) navegar(usuario.rol === "admin" ? "admin" : "cuenta");
    return usuario;
  }

  function registrar(usuario) {
    const creado = tienda.registrarUsuario(usuario, true);
    if (creado) navegar("cuenta");
    return creado;
  }

  function salir() {
    tienda.cerrarSesion();
    setAviso("");
    setMensajeCompra("");
    navegar("inicio");
  }

  const usuarioActual = tienda.usuarios.find((usuario) => usuario.correo === tienda.sesion?.correo);
  const esAdmin = ruta === "admin" || ruta.startsWith("admin/");
  const accesoDenegado = (ruta === "cuenta" && (!usuarioActual || tienda.sesion?.rol !== "comprador")) ||
    (esAdmin && (!usuarioActual || tienda.sesion?.rol !== "admin"));
  let pagina;

  if (accesoDenegado) {
    pagina = <section className="pantalla-formularios"><h1>Inicia sesión para continuar.</h1><a className="boton-enlace" href="#login">Ir al acceso</a></section>;
  } else if (ruta === "productos") {
    pagina = <Productos productos={tienda.productos} onVerDetalle={(producto) => navegar(`producto/${producto.id}`)} onAgregar={agregar} />;
  } else if (ruta.startsWith("producto/")) {
    const id = ruta.slice("producto/".length);
    const producto = tienda.productos.find((item) => String(item.id) === id);
    pagina = producto
      ? <DetalleProducto producto={producto} volver={() => navegar("productos")} onAgregar={agregar} />
      : <section className="pantalla-formularios"><h1>Producto no encontrado</h1><a href="#productos">Volver al catálogo</a></section>;
  } else if (ruta === "carrito") {
    pagina = <Carrito carrito={tienda.carrito} productos={tienda.productos} sesion={tienda.sesion} mensajeCompra={mensajeCompra} onQuitar={tienda.quitarDelCarrito} onCantidad={tienda.cambiarCantidad} onComprar={comprar} onIrAcceso={() => navegar("login")} />;
  } else if (ruta === "nosotros") {
    pagina = <Nosotros onIrContacto={() => navegar("contacto")} />;
  } else if (ruta === "contacto") {
    pagina = <Contacto usuario={tienda.sesion} onEnviar={tienda.enviarMensaje} />;
  } else if (ruta === "login") {
    pagina = <Login onIniciar={entrar} />;
  } else if (ruta === "registro") {
    pagina = <Registro onRegistrar={registrar} />;
  } else if (ruta === "cambiar-clave") {
    pagina = <CambiarContrasena onCambiar={tienda.cambiarContrasena} />;
  } else if (ruta === "cuenta") {
    pagina = <Cuenta usuario={usuarioActual} pedidos={tienda.pedidos.filter((pedido) => pedido.comprador === tienda.sesion.correo)} onGuardar={tienda.guardarPerfil} />;
  } else if (esAdmin) {
    pagina = <Admin ruta={ruta} tienda={tienda} />;
  } else {
    pagina = <Inicio />;
  }

  return (
    <>
      <div className="franja">Café de especialidad, a tu ritmo.</div>
      <Navbar sesion={tienda.sesion} cantidad={tienda.carrito.reduce((total, item) => total + item.cantidad, 0)} onSalir={salir} />
      <main>
        {aviso && <p className="aviso-carrito" role="status">{aviso}</p>}
        {pagina}
      </main>
      <Footer />
    </>
  );
}

export default App;
