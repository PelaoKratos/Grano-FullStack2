import { Component, Suspense, lazy, useEffect, useRef, useState } from "react";
import Inicio from "./components/Inicio.jsx";
import Catalogo from "./components/Catalogo.jsx";
import DetalleProducto from "./components/DetalleProducto.jsx";
import Carrito from "./components/Carrito.jsx";
import Contacto from "./components/Contacto.jsx";
import Nosotros from "./components/Nosotros.jsx";
import { Header, Footer } from "./components/Layout.jsx";
import { useRuta, navegar } from "./hooks/useRuta.js";
import { useTienda } from "./hooks/useTienda.js";
const Acceso = lazy(() => import("./components/Acceso.jsx"));
const Vendedor = lazy(() => import("./components/Vendedor.jsx"));
const Cuenta = lazy(() => import("./components/Cuenta.jsx"));
const Administracion = lazy(() => import("./components/Administracion.jsx"));

class LimiteError extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main className="container area-app">
        <h1>No pudimos abrir la tienda.</h1>
        <p>
          Recarga la página para volver a intentarlo. Los datos guardados
          permanecen en tu navegador.
        </p>
        <button className="btn btn-success" onClick={() => location.reload()}>
          Volver a intentar
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}

function Tienda() {
  const { path, params } = useRuta();
  const tienda = useTienda();
  const [aviso, setAviso] = useState("");
  const [mensajeCompra, setMensajeCompra] = useState("");
  const main = useRef(null),
    notice = useRef(null),
    primeraRuta = useRef(true);
  const inicio = path === "/";
  function agregar(producto) {
    if (tienda.agregar(producto)) {
      setAviso(`${producto.nombre} añadido.`);
      setMensajeCompra("");
    }
  }
  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => {
      if (!notice.current?.contains(document.activeElement)) setAviso("");
    }, 5500);
    return () => clearTimeout(timer);
  }, [aviso]);
  useEffect(() => {
    const titles = {
      "/": "Inicio",
      "/productos": "Nuestro café",
      "/carrito": "Carrito",
      "/acceso": "Iniciar sesión",
      "/registro": "Crear cuenta",
      "/cambiar-clave": "Cambiar contraseña",
      "/vendedor": "Productos y pedidos",
      "/cuenta": "Mi cuenta",
      "/admin": "Administración",
      "/contacto": "Contacto",
      "/nosotros": "Nosotros",
    };
    document.title = `${(path.startsWith("/admin/") ? "Administración" : titles[path]) || tienda.productos.find((p) => path === `/producto/${p.id}`)?.nombre || "Página no encontrada"} | Grano`;
    if (primeraRuta.current) {
      primeraRuta.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    main.current?.focus({ preventScroll: true });
  }, [path]);
  function entrar(correo, clave) {
    const user = tienda.iniciar(correo, clave);
    if (user)
      navegar(
        user.rol === "admin"
          ? "/admin"
          : user.rol === "vendedor"
            ? "/vendedor"
            : params.get("destino") === "carrito"
              ? "/carrito"
              : "/cuenta",
      );
    return user;
  }
  function registrar(user) {
    if (!tienda.registrar(user, true)) return false;
    navegar(params.get("destino") === "carrito" ? "/carrito" : "/cuenta");
    return true;
  }
  const requiereCuenta = (
    <section>
      <h1>Inicia sesión para continuar.</h1>
      <a
        className="btn btn-success mt-4"
        href={`#/acceso${path === "/carrito" ? "?destino=carrito" : ""}`}
      >
        Ir a iniciar sesión
      </a>
    </section>
  );
  let contenido;
  if (inicio)
    contenido = <Inicio productos={tienda.productos} onAgregar={agregar} />;
  else if (path === "/productos")
    contenido = (
      <Catalogo
        productos={tienda.productos}
        onAgregar={agregar}
        categoria={params.get("categoria") || "todos"}
      />
    );
  else if (path.startsWith("/producto/")) {
    const producto = tienda.productos.find(
      (p) => p.id === path.slice("/producto/".length),
    );
    contenido = producto ? (
      <DetalleProducto producto={producto} onAgregar={agregar} />
    ) : (
      <section>
        <h1>Este producto no está disponible.</h1>
        <a className="btn btn-success mt-4" href="#/productos">
          Volver a la colección
        </a>
      </section>
    );
  } else if (path === "/carrito")
    contenido = (
      <Carrito
        carrito={tienda.carrito}
        sesion={tienda.sesion}
        mensajeCompra={mensajeCompra}
        onQuitar={tienda.quitar}
        onCantidad={tienda.cambiarCantidad}
        onComprar={() => {
          const pedido = tienda.comprar();
          if (pedido)
            setMensajeCompra(
              `Pedido ${pedido.id} registrado. Gracias por tu compra.`,
            );
        }}
      />
    );
  else if (["/acceso", "/registro", "/cambiar-clave"].includes(path))
    contenido = (
      <Acceso
        key={path}
        modo={
          path === "/registro" || params.has("registro")
            ? "registro"
            : path === "/cambiar-clave"
              ? "clave"
              : "completo"
        }
        onIniciar={entrar}
        onRegistrar={registrar}
        onCambiarContrasena={tienda.cambiarClave}
      />
    );
  else if (path === "/cuenta")
    contenido =
      tienda.sesion?.rol === "comprador" ? (
        <Cuenta
          usuario={tienda.usuarios.find(
            (u) => u.correo === tienda.sesion.correo,
          )}
          pedidos={tienda.pedidos.filter(
            (p) => p.comprador === tienda.sesion.correo,
          )}
          onGuardar={tienda.guardarPerfil}
        />
      ) : (
        requiereCuenta
      );
  else if (path === "/admin" || path.startsWith("/admin/"))
    contenido =
      tienda.sesion?.rol === "admin" ? (
        <Administracion path={path} tienda={tienda} />
      ) : (
        requiereCuenta
      );
  else if (path === "/vendedor")
    contenido = ["vendedor", "admin"].includes(tienda.sesion?.rol) ? (
      <Vendedor productos={tienda.productos} pedidos={tienda.pedidos} />
    ) : (
      requiereCuenta
    );
  else if (path === "/contacto")
    contenido = <Contacto usuario={tienda.sesion} onEnviar={tienda.enviar} />;
  else if (path === "/nosotros") contenido = <Nosotros />;
  else
    contenido = (
      <section>
        <h1>No encontramos esta página.</h1>
        <p>Puedes seguir explorando nuestra colección.</p>
        <a className="btn btn-success" href="#/productos">
          Ver la colección
        </a>
      </section>
    );
  return (
    <>
      <a
        className="saltar"
        href="#contenido"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <Header
        path={path}
        sesion={tienda.sesion}
        cantidad={tienda.carrito.reduce((n, p) => n + p.cantidad, 0)}
        onCerrar={() => {
          const cerrado = tienda.cerrar();
          if (cerrado) {
            setAviso("");
            setMensajeCompra("");
          }
          return cerrado;
        }}
      />
      {tienda.error && (
        <div className="container alert alert-danger mt-3" role="alert">
          {tienda.error}
        </div>
      )}
      <main
        id="contenido"
        ref={main}
        tabIndex={-1}
        className={inicio ? "inicio-grano" : "container area-app"}
      >
        <Suspense
          fallback={
            <p className="py-5" role="status">
              Cargando…
            </p>
          }
        >
          {contenido}
        </Suspense>
      </main>
      <Footer />
      <div
        ref={notice}
        className="aviso-carrito"
        hidden={!aviso}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {aviso}{" "}
        <a href="#/carrito" onClick={() => setAviso("")}>
          Ver carrito
        </a>
      </div>
    </>
  );
}
export default function App() {
  return (
    <LimiteError>
      <Tienda />
    </LimiteError>
  );
}
