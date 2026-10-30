import { Component, Suspense, lazy, useEffect, useRef, useState } from "react";
import Inicio from "./components/Inicio.jsx";
import Catalogo from "./components/Catalogo.jsx";
import DetalleProducto from "./components/DetalleProducto.jsx";
import Carrito from "./components/Carrito.jsx";
import Contacto from "./components/Contacto.jsx";
import Nosotros from "./components/Nosotros.jsx";
import { Header, Footer } from "./components/Layout.jsx";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { leerRuta } from "./datos/rutas.js";
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

// Preserve bookmarks from the hand-written router without keeping a second router.
function RutasCompatibles({ children }) {
  const { pathname, search } = useLocation();
  const { path } = leerRuta(`#${pathname}`);
  return path === pathname ? (
    children
  ) : (
    <Navigate to={`${path}${search}`} replace />
  );
}

function PaginaNoEncontrada() {
  return (
    <section>
      <h1>No encontramos esta página.</h1>
      <p>Puedes seguir explorando nuestra colección.</p>
      <Link className="btn btn-success" to="/productos">
        Ver la colección
      </Link>
    </section>
  );
}

function PaginaProducto({ productos, onAgregar }) {
  const { id } = useParams();
  const producto = productos.find((p) => p.id === id);
  return producto ? (
    <DetalleProducto producto={producto} onAgregar={onAgregar} />
  ) : (
    <section>
      <h1>Este producto no está disponible.</h1>
      <Link className="btn btn-success mt-4" to="/productos">
        Volver a la colección
      </Link>
    </section>
  );
}

function RutaProtegida({ sesion, roles, children }) {
  if (sesion && roles.includes(sesion.rol)) return children;
  return (
    <section>
      <h1>
        {sesion
          ? "No tienes acceso a esta sección."
          : "Inicia sesión para continuar."}
      </h1>
      <Link className="btn btn-success mt-4" to={sesion ? "/" : "/acceso"}>
        {sesion ? "Volver al inicio" : "Ir a iniciar sesión"}
      </Link>
    </section>
  );
}

function Tienda() {
  const { pathname: path } = useLocation();
  const [params] = useSearchParams();
  const navegar = useNavigate();
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
  const acceso = (
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
  const contenido = (
    <Routes>
      <Route
        path="/"
        element={<Inicio productos={tienda.productos} onAgregar={agregar} />}
      />
      <Route
        path="/productos"
        element={<Catalogo productos={tienda.productos} onAgregar={agregar} />}
      />
      <Route
        path="/producto/:id"
        element={<PaginaProducto productos={tienda.productos} onAgregar={agregar} />}
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
            onComprar={() => {
              const pedido = tienda.comprar();
              if (pedido)
                setMensajeCompra(
                  `Pedido ${pedido.id} registrado. Gracias por tu compra.`,
                );
            }}
          />
        }
      />
      <Route path="/acceso" element={acceso} />
      <Route path="/registro" element={acceso} />
      <Route path="/cambiar-clave" element={acceso} />
      <Route
        path="/cuenta"
        element={
          <RutaProtegida sesion={tienda.sesion} roles={["comprador"]}>
            <Cuenta
              usuario={tienda.usuarios.find(
                (u) => u.correo === tienda.sesion?.correo,
              )}
              pedidos={tienda.pedidos.filter(
                (p) => p.comprador === tienda.sesion?.correo,
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
        <Link to="/carrito" onClick={() => setAviso("")}>
          Ver carrito
        </Link>
      </div>
    </>
  );
}
export default function App() {
  return (
    <LimiteError>
      <RutasCompatibles>
        <Tienda />
      </RutasCompatibles>
    </LimiteError>
  );
}
