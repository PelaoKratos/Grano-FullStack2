import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Inicio from "../components/Inicio.jsx";
import Catalogo from "../components/Catalogo.jsx";
import Carrito from "../components/Carrito.jsx";
import Contacto from "../components/Contacto.jsx";
import Nosotros from "../components/Nosotros.jsx";
import Checkout from "../components/Checkout.jsx";
import ResultadoCompra from "../components/ResultadoCompra.jsx";
import Categorias from "../components/Categorias.jsx";
import Ofertas from "../components/Ofertas.jsx";
import { Blog, Articulo } from "../components/Blog.jsx";
import RutaProtegida from "./RutaProtegida.jsx";
import PaginaProducto from "../pages/Producto.jsx";
import PaginaNoEncontrada from "../pages/NoEncontrada.jsx";

// Los formularios y paneles se cargan cuando abrimos sus rutas.
const Login = lazy(() => import("../pages/Login.jsx"));
const Registro = lazy(() => import("../pages/Registro.jsx"));
const CambiarContrasena = lazy(() => import("../pages/CambiarContrasena.jsx"));
const Vendedor = lazy(() => import("../components/Vendedor.jsx"));
const Cuenta = lazy(() => import("../components/Cuenta.jsx"));
const Administracion = lazy(() => import("../components/Administracion.jsx"));

// Cada ruta indica la pantalla que se abre y los datos que recibe.
export default function RutasTienda({ tienda, acciones }) {
  const {
    agregarProducto,
    iniciarSesion,
    registrarComprador,
    realizarCompra,
    mensajeCompra,
  } = acciones;

  return (
    <Routes>
      {/* Pantallas públicas de la tienda. */}
      <Route
        path="/"
        element={
          <Inicio productos={tienda.productos} onAgregar={agregarProducto} />
        }
      />
      <Route
        path="/productos"
        element={
          <Catalogo
            productos={tienda.productos}
            categorias={tienda.categorias}
            onAgregar={agregarProducto}
          />
        }
      />
      <Route
        path="/producto/:id"
        element={
          <PaginaProducto
            productos={tienda.productos}
            onAgregar={agregarProducto}
          />
        }
      />
      <Route
        path="/carrito"
        element={
          <Carrito
            carrito={tienda.carrito}
            sesion={tienda.sesion}
            mensajeCompra={mensajeCompra}
            onQuitar={tienda.quitar}
            onCantidad={tienda.cambiarCantidad}
            onComprar={realizarCompra}
          />
        }
      />
      <Route path="/acceso" element={<Login onIniciar={iniciarSesion} />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<Articulo />} />
      <Route
        path="/categorias"
        element={
          <Categorias
            categorias={tienda.categorias}
            productos={tienda.productos}
          />
        }
      />
      <Route
        path="/ofertas"
        element={
          <Ofertas productos={tienda.productos} onAgregar={agregarProducto} />
        }
      />
      <Route
        path="/checkout"
        element={
          <RutaProtegida sesion={tienda.sesion} roles={["comprador"]}>
            <Checkout
              usuario={tienda.usuarios.find(
                (usuario) => usuario.correo === tienda.sesion?.correo,
              )}
              carrito={tienda.carrito}
              onComprar={realizarCompra}
            />
          </RutaProtegida>
        }
      />
      <Route
        path="/compra/confirmada/:id"
        element={
          <RutaProtegida sesion={tienda.sesion} roles={["comprador"]}>
            <ResultadoCompra pedidos={tienda.pedidos} sesion={tienda.sesion} />
          </RutaProtegida>
        }
      />
      <Route
        path="/compra/error"
        element={
          <RutaProtegida sesion={tienda.sesion} roles={["comprador"]}>
            <ResultadoCompra
              pedidos={tienda.pedidos}
              sesion={tienda.sesion}
              error
            />
          </RutaProtegida>
        }
      />
      <Route
        path="/registro"
        element={<Registro onRegistrar={registrarComprador} />}
      />
      <Route
        path="/cambiar-clave"
        element={
          <CambiarContrasena onCambiarContrasena={tienda.cambiarClave} />
        }
      />
      {/* Pantallas que requieren una sesión con el rol correspondiente. */}
      <Route
        path="/cuenta"
        element={
          <RutaProtegida sesion={tienda.sesion} roles={["comprador"]}>
            <Cuenta
              usuario={tienda.usuarios.find(
                (usuarioRegistrado) =>
                  usuarioRegistrado.correo === tienda.sesion?.correo,
              )}
              pedidos={tienda.pedidos.filter(
                (pedidoGuardado) =>
                  pedidoGuardado.comprador === tienda.sesion?.correo,
              )}
              onGuardar={tienda.guardarPerfil}
            />
          </RutaProtegida>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RutaProtegida sesion={tienda.sesion} roles={["admin"]}>
            <Administracion tienda={tienda} />
          </RutaProtegida>
        }
      />
      <Route
        path="/vendedor"
        element={
          <RutaProtegida sesion={tienda.sesion} roles={["vendedor", "admin"]}>
            <Vendedor productos={tienda.productos} pedidos={tienda.pedidos} />
          </RutaProtegida>
        }
      />
      <Route
        path="/contacto"
        element={<Contacto usuario={tienda.sesion} onEnviar={tienda.enviar} />}
      />
      <Route path="/nosotros" element={<Nosotros />} />
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}
