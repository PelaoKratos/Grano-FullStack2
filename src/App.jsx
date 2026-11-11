import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Header, Footer } from "./components/Layout.jsx";
import LimiteError from "./components/LimiteError.jsx";
import AvisoCarrito from "./components/AvisoCarrito.jsx";
import RutasCompatibles from "./routes/RutasCompatibles.jsx";
import RutasTienda from "./routes/RutasTienda.jsx";
import { useTienda } from "./hooks/useTienda.js";
import { useAccionesTienda } from "./hooks/useAccionesTienda.js";
import { useNavegacionPagina } from "./hooks/useNavegacionPagina.js";

// Reunimos la tienda, sus acciones y las partes comunes de las pantallas.
function Tienda() {
  const { pathname } = useLocation();
  const tienda = useTienda();
  const acciones = useAccionesTienda(tienda);
  const contenidoPrincipalRef = useNavegacionPagina(pathname, tienda.productos);
  const cantidad = tienda.carrito.reduce(
    (total, producto) => total + producto.cantidad,
    0,
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
        path={pathname}
        sesion={tienda.sesion}
        cantidad={cantidad}
        onCerrar={acciones.cerrarSesion}
      />
      {tienda.error && pathname !== "/compra/error" && (
        <div className="container alert alert-danger mt-3" role="alert">
          {tienda.error}
        </div>
      )}
      <main
        id="contenido"
        ref={contenidoPrincipalRef}
        tabIndex={-1}
        className={pathname === "/" ? "inicio-grano" : "container area-app"}
      >
        <Suspense
          fallback={
            <p className="py-5" role="status">
              Cargando…
            </p>
          }
        >
          <RutasTienda tienda={tienda} acciones={acciones} />
        </Suspense>
      </main>
      <Footer />
      <AvisoCarrito aviso={acciones.aviso} onOcultar={acciones.ocultarAviso} />
    </>
  );
}

// Dejamos App como punto de entrada y la recuperación de errores por fuera.
export default function App() {
  return (
    <LimiteError>
      <RutasCompatibles>
        <Tienda />
      </RutasCompatibles>
    </LimiteError>
  );
}
