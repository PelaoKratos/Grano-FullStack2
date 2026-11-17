import { useEffect, useMemo, useRef, useState } from "react";
import { crearProductosApi } from "../servicios/productosApi.js";

// Este hook se ocupa de esperar al servidor y conservar los errores de conexión.
export function useCatalogoApi(direccion) {
  const api = useMemo(
    () => (direccion ? crearProductosApi(direccion) : null),
    [direccion],
  );
  const [productos, setProductos] = useState([]);
  const [disponible, setDisponible] = useState(false);
  const [cargando, setCargando] = useState(Boolean(direccion));
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const solicitud = useRef(null);
  const ocupado = useRef(false);

  useEffect(() => {
    if (!api) return;
    const controlador = new AbortController();
    solicitud.current = controlador;
    setCargando(true);
    setError("");
    api
      .listar(controlador.signal)
      .then((datos) => {
        if (!Array.isArray(datos))
          throw new Error("El catálogo recibido no tiene el formato esperado.");
        if (!controlador.signal.aborted) {
          setProductos(datos);
          setDisponible(true);
        }
      })
      .catch((fallo) => {
        if (!controlador.signal.aborted) setError(fallo.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });
    return () => controlador.abort();
  }, [api, intento]);

  // Una petición pendiente no debe reemplazar una edición que ya fue guardada.
  async function cambiar(operacion) {
    if (ocupado.current || cargando) return false;
    ocupado.current = true;
    solicitud.current?.abort();
    setError("");
    try {
      await operacion();
      return true;
    } catch (fallo) {
      setError(fallo.message);
      return false;
    } finally {
      ocupado.current = false;
    }
  }

  return {
    productos,
    disponible,
    cargando,
    error,
    recargar: () => {
      if (!ocupado.current) setIntento((valor) => valor + 1);
    },
    guardar: (producto) =>
      cambiar(async () => {
        const guardado = await api.guardar(producto);
        setProductos((anteriores) => [
          ...anteriores.filter((item) => item.id !== guardado.id),
          guardado,
        ]);
      }),
    eliminar: (id) =>
      cambiar(async () => {
        await api.eliminar(id);
        setProductos((anteriores) =>
          anteriores.filter((item) => item.id !== id),
        );
      }),
  };
}
