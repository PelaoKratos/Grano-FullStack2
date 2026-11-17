import Boton from "./Boton.jsx";
import { usaPedidos, usaMensajes } from "../datos/cargaPaginas.js";

// Los avisos y reintentos quedan aquí para mantener App más ordenado.
export default function EstadoConexion({ tienda, ruta }) {
  const errores =
    ruta === "/compra/error"
      ? []
      : [
          ...new Set(
            (tienda.usarApi
              ? [
                  tienda.errorOperacion,
                  tienda.errorSesion,
                  tienda.errorProductos,
                  tienda.errorCategorias,
                  tienda.errorPedidos,
                  tienda.errorMensajes,
                ]
              : [tienda.error]
            ).filter(Boolean),
          ),
        ];
  if (!tienda.usarApi && !errores.length) return null;
  return (
    <div className="container mt-3">
      {errores.map((error) => (
        <p className="alert alert-danger" role="alert" key={error}>
          {error}
        </p>
      ))}
      {tienda.usarApi && (
        <div
          className="d-flex flex-wrap gap-2 mb-3"
          aria-label="Actualizar datos de la tienda"
        >
          <Boton
            variante="secundario"
            disabled={tienda.cargandoProductos || tienda.cargandoCategorias}
            onClick={tienda.recargarProductos}
          >
            {tienda.cargandoProductos || tienda.cargandoCategorias
              ? "Actualizando catálogo…"
              : "Actualizar catálogo"}
          </Boton>
          {tienda.sesion && usaPedidos(ruta) && (
            <Boton
              variante="secundario"
              disabled={tienda.cargandoPedidos}
              onClick={tienda.recargarPedidos}
            >
              {tienda.cargandoPedidos
                ? "Actualizando pedidos…"
                : "Actualizar pedidos"}
            </Boton>
          )}
          {tienda.sesion?.rol === "admin" && usaMensajes(ruta) && (
            <Boton
              variante="secundario"
              disabled={tienda.cargandoMensajes}
              onClick={tienda.recargarMensajes}
            >
              {tienda.cargandoMensajes
                ? "Actualizando mensajes…"
                : "Actualizar mensajes"}
            </Boton>
          )}
          {tienda.errorSesion && (
            <Boton
              variante="secundario"
              disabled={tienda.cargandoSesion}
              onClick={tienda.recargarSesion}
            >
              Comprobar sesión
            </Boton>
          )}
        </div>
      )}
    </div>
  );
}
