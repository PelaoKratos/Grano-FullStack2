import { useEffect, useMemo, useRef, useState } from "react";
import { crearCategoriasApi } from "../servicios/categoriasApi.js";

// Las pantallas siguen recibiendo nombres. Aquí conservamos las ID que usa Java.
export function useCategoriasApi(direccion) {
  const api = useMemo(
    () => (direccion ? crearCategoriasApi(direccion) : null),
    [direccion],
  );
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(Boolean(direccion));
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const ocupado = useRef(false);
  const lectura = useRef(null);

  useEffect(() => {
    if (!api) return;
    const controlador = new AbortController();
    lectura.current = controlador;
    setCargando(true);
    setError("");
    api
      .listar(controlador.signal)
      .then((lista) => {
        if (!Array.isArray(lista))
          throw new Error("No pudimos leer las categorías.");
        if (!controlador.signal.aborted) setCategorias(lista);
      })
      .catch((fallo) => {
        if (!controlador.signal.aborted) setError(fallo.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });
    return () => controlador.abort();
  }, [api, intento]);

  async function cambiar(operacion) {
    if (ocupado.current || cargando) return false;
    ocupado.current = true;
    lectura.current?.abort();
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
    categorias,
    cargando,
    error,
    recargar: () => {
      if (!ocupado.current) setIntento((valor) => valor + 1);
    },
    guardar: (anterior, nombre) =>
      cambiar(async () => {
        const categoria = categorias.find((item) => item.nombre === anterior);
        if (anterior && !categoria)
          throw new Error("Actualiza las categorías antes de editar.");
        const guardada = await api.guardar(categoria?.id, nombre.trim());
        setCategorias((lista) => [
          ...lista.filter((item) => item.id !== guardada.id),
          guardada,
        ]);
      }),
    eliminar: (nombre) =>
      cambiar(async () => {
        const categoria = categorias.find((item) => item.nombre === nombre);
        if (!categoria)
          throw new Error(
            "No encontramos esta categoría. Actualiza el catálogo.",
          );
        await api.eliminar(categoria.id);
        setCategorias((lista) =>
          lista.filter((item) => item.id !== categoria.id),
        );
      }),
  };
}
