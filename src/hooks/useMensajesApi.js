import { useEffect, useMemo, useRef, useState } from "react";
import { crearMensajesApi } from "../servicios/mensajesApi.js";

export function useMensajesApi(direccion, usuario) {
  const api = useMemo(
    () => (direccion ? crearMensajesApi(direccion) : null),
    [direccion],
  );
  const propietario = usuario?.rol === "admin" ? usuario.id : "";
  const [datos, setDatos] = useState({ propietario: "", mensajes: [] });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const ocupado = useRef(false);
  const lectura = useRef(null);

  useEffect(() => {
    if (!api || !propietario) {
      setDatos({ propietario: "", mensajes: [] });
      setCargando(false);
      setError("");
      return;
    }
    const controlador = new AbortController();
    lectura.current = controlador;
    setCargando(true);
    setError("");
    api
      .listar(controlador.signal)
      .then((mensajes) => {
        if (!Array.isArray(mensajes))
          throw new Error("No pudimos leer los mensajes.");
        if (!controlador.signal.aborted) setDatos({ propietario, mensajes });
      })
      .catch((fallo) => {
        if (!controlador.signal.aborted) setError(fallo.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });
    return () => controlador.abort();
  }, [api, propietario, intento]);

  async function actuar(accion) {
    if (ocupado.current) return false;
    ocupado.current = true;
    lectura.current?.abort();
    setCargando(false);
    setError("");
    try {
      await accion();
      return true;
    } catch (fallo) {
      setError(fallo.message);
      return false;
    } finally {
      ocupado.current = false;
    }
  }

  return {
    mensajes: datos.propietario === propietario ? datos.mensajes : [],
    cargando,
    error,
    recargar: () => {
      if (!ocupado.current) setIntento((valor) => valor + 1);
    },
    enviar: (mensaje) =>
      actuar(async () => {
        const guardado = await api.enviar(mensaje);
        if (propietario)
          setDatos((anteriores) => ({
            propietario,
            mensajes: [
              guardado,
              ...(anteriores.propietario === propietario
                ? anteriores.mensajes
                : []),
            ],
          }));
      }),
    marcar: (id) =>
      actuar(async () => {
        const guardado = await api.marcar(id);
        setDatos((anteriores) => ({
          propietario,
          mensajes:
            anteriores.propietario === propietario
              ? anteriores.mensajes.map((mensaje) =>
                  mensaje.id === id ? guardado : mensaje,
                )
              : [],
        }));
      }),
  };
}
