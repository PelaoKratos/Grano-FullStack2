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
import Boton from "./components/Boton.jsx";

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
      {tienda.usarApi && (
        <div className="container alert alert-info mt-3" role="status">
          {tienda.cargandoProductos
            ? "Cargando el catálogo del servidor…"
            : tienda.errorProductos
              ? "Revisa la conexión o los datos del producto."
              : "Catálogo conectado al backend local."}
          {tienda.errorProductos && <p role="alert">{tienda.errorProductos}</p>}
          <Boton
            variante="secundario"
            className="ms-3"
            disabled={tienda.cargandoProductos}
            onClick={tienda.recargarProductos}
          >
            Actualizar catálogo
          </Boton>
          <p className="mb-0 mt-2">
            Productos, cuentas y pedidos conectados al servidor. Los pagos
            siguen siendo de demostración.
          </p>
        </div>
      )}
      {tienda.usarApi && tienda.sesion && (
        <div className="container mt-3">
          <Boton
            variante="secundario"
            disabled={tienda.cargandoPedidos}
            onClick={tienda.recargarPedidos}
          >
            Actualizar pedidos
          </Boton>
        </div>
      )}
      {tienda.usarApi && tienda.errorSesion && (
        <div className="container mt-3">
          <Boton onClick={tienda.recargarSesion}>Comprobar sesión</Boton>
        </div>
      )}
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
          {tienda.usarApi &&
          (tienda.cargandoProductos ||
            tienda.cargandoSesion ||
            tienda.cargandoPedidos) ? (
            <p role="status">Cargando los datos de la tienda…</p>
          ) : (
            <RutasTienda tienda={tienda} acciones={acciones} />
          )}
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
