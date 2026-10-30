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

// Estas pantallas se descargan solo cuando el usuario necesita abrirlas.
const Acceso = lazy(() => import("./components/Acceso.jsx"));
const Vendedor = lazy(() => import("./components/Vendedor.jsx"));
const Cuenta = lazy(() => import("./components/Cuenta.jsx"));
const Administracion = lazy(() => import("./components/Administracion.jsx"));

// Un error de pantalla muestra una recuperación sin borrar los datos guardados.
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

// Convierte los enlaces antiguos antes de que React Router abra la pantalla.
function RutasCompatibles({ children }) {
  const { pathname, search } = useLocation();
  const { path: rutaActual } = leerRuta(`#${pathname}`);
  return rutaActual === pathname ? (
    children
  ) : (
    <Navigate to={`${rutaActual}${search}`} replace />
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

// El parámetro :id de la URL permite compartir el detalle de un producto.
function PaginaProducto({ productos, onAgregar }) {
  const { id } = useParams();
  const producto = productos.find(
    (productoCatalogo) => productoCatalogo.id === id,
  );
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

// El panel se renderiza únicamente si la sesión tiene uno de los roles indicados.
function RutaProtegida({ sesion, roles, children }) {
  if (sesion && roles.includes(sesion.rol)) {
    return children;
  }
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

// Conecta las pantallas con el estado y las acciones expuestas por useTienda.
function Tienda() {
  const { pathname: rutaActual } = useLocation();
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const tienda = useTienda();
  const [aviso, setAviso] = useState("");
  const [mensajeCompra, setMensajeCompra] = useState("");
  const contenidoPrincipalRef = useRef(null);
  const avisoCarritoRef = useRef(null);
  const esPrimeraRutaRef = useRef(true);
  const esInicio = rutaActual === "/";

  function agregarProducto(producto) {
    if (tienda.agregar(producto)) {
      setAviso(`${producto.nombre} añadido.`);
      setMensajeCompra("");
    }
  }
  useEffect(() => {
    if (!aviso) {
      return;
    }
    const temporizadorAviso = setTimeout(() => {
      if (!avisoCarritoRef.current?.contains(document.activeElement)) {
        setAviso("");
      }
    }, 5500);
    return () => clearTimeout(temporizadorAviso);
  }, [aviso]);
  useEffect(() => {
    const titulosPorRuta = {
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
    let tituloPagina = titulosPorRuta[rutaActual];

    if (rutaActual.startsWith("/admin/")) {
      tituloPagina = "Administración";
    }

    if (!tituloPagina) {
      const productoActual = tienda.productos.find(
        (productoCatalogo) => rutaActual === `/producto/${productoCatalogo.id}`,
      );
      tituloPagina = productoActual?.nombre || "Página no encontrada";
    }

    document.title = `${tituloPagina} | Grano`;
    if (esPrimeraRutaRef.current) {
      esPrimeraRutaRef.current = false;
      return;
    }
    // Al cambiar de pantalla, el teclado continúa desde el contenido principal.
    window.scrollTo({ top: 0, behavior: "instant" });
    contenidoPrincipalRef.current?.focus({ preventScroll: true });
  }, [rutaActual]);
  function iniciarSesion(correo, clave) {
    const usuario = tienda.iniciar(correo, clave);
    if (!usuario) {
      return usuario;
    }

    // Cada perfil entra a su panel; el comprador puede volver al carrito.
    let rutaDestino = "/cuenta";
    if (usuario.rol === "admin") {
      rutaDestino = "/admin";
    } else if (usuario.rol === "vendedor") {
      rutaDestino = "/vendedor";
    } else if (parametros.get("destino") === "carrito") {
      rutaDestino = "/carrito";
    }

    navegar(rutaDestino);
    return usuario;
  }

  function registrarComprador(usuario) {
    if (!tienda.registrar(usuario, true)) {
      return false;
    }
    navegar(parametros.get("destino") === "carrito" ? "/carrito" : "/cuenta");
    return true;
  }
  function realizarCompra() {
    const pedido = tienda.comprar();
    if (pedido) {
      setMensajeCompra(
        `Pedido ${pedido.id} registrado. Gracias por tu compra.`,
      );
    }
  }

  function cerrarSesion() {
    const cerrado = tienda.cerrar();
    if (cerrado) {
      setAviso("");
      setMensajeCompra("");
    }
    return cerrado;
  }

  // El mismo formulario sirve para acceso, registro y cambio de contraseña.
  let modoAcceso = "completo";
  if (rutaActual === "/registro" || parametros.has("registro")) {
    modoAcceso = "registro";
  } else if (rutaActual === "/cambiar-clave") {
    modoAcceso = "clave";
  }

  const pantallaAcceso = (
    <Acceso
      key={rutaActual}
      modo={modoAcceso}
      onIniciar={iniciarSesion}
      onRegistrar={registrarComprador}
      onCambiarContrasena={tienda.cambiarClave}
    />
  );
  const rutasDeLaTienda = (
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
          <Catalogo productos={tienda.productos} onAgregar={agregarProducto} />
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
      <Route path="/acceso" element={pantallaAcceso} />
      <Route path="/registro" element={pantallaAcceso} />
      <Route path="/cambiar-clave" element={pantallaAcceso} />
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
  return (
    <>
      <a
        className="saltar"
        href="#contenido"
        onClick={(evento) => {
          evento.preventDefault();
          contenidoPrincipalRef.current?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <Header
        path={rutaActual}
        sesion={tienda.sesion}
        cantidad={tienda.carrito.reduce(
          (cantidadTotal, productoCatalogo) =>
            cantidadTotal + productoCatalogo.cantidad,
          0,
        )}
        onCerrar={cerrarSesion}
      />
      {tienda.error && (
        <div className="container alert alert-danger mt-3" role="alert">
          {tienda.error}
        </div>
      )}
      <main
        id="contenido"
        ref={contenidoPrincipalRef}
        tabIndex={-1}
        className={esInicio ? "inicio-grano" : "container area-app"}
      >
        <Suspense
          fallback={
            <p className="py-5" role="status">
              Cargando…
            </p>
          }
        >
          {rutasDeLaTienda}
        </Suspense>
      </main>
      <Footer />
      <div
        ref={avisoCarritoRef}
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
