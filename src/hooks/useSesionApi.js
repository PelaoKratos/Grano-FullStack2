import { useEffect, useMemo, useState } from "react";
import { crearCuentasApi } from "../servicios/cuentasApi.js";

// La sesión viene del servidor; no usamos contraseñas del navegador para entrar.
export function useSesionApi(direccion) {
  const api = useMemo(
    () => (direccion ? crearCuentasApi(direccion) : null),
    [direccion],
  );
  const [usuario, setUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(Boolean(direccion));
  const [verificada, setVerificada] = useState(false);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  async function actualizar(actual) {
    const lista =
      actual?.rol === "admin" ? await api.listar() : actual ? [actual] : [];
    setUsuario(actual);
    setUsuarios(lista);
    setVerificada(true);
  }

  useEffect(() => {
    if (!api) return;
    const controlador = new AbortController();
    setCargando(true);
    setError("");
    api
      .actual(controlador.signal)
      .then(async (actual) => {
        if (!controlador.signal.aborted) await actualizar(actual);
      })
      .catch((fallo) => {
        if (controlador.signal.aborted) return;
        if (fallo.status === 401) {
          setUsuario(null);
          setUsuarios([]);
          setVerificada(true);
        } else setError(fallo.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });
    function vencer() {
      setUsuario(null);
      setUsuarios([]);
      setVerificada(true);
      setError("Tu sesión terminó. Inicia sesión nuevamente.");
    }
    window.addEventListener("grano-sesion-vencida", vencer);
    return () => {
      controlador.abort();
      window.removeEventListener("grano-sesion-vencida", vencer);
    };
  }, [api, intento]);

  async function intentar(accion) {
    setError("");
    try {
      return await accion();
    } catch (fallo) {
      setError(fallo.message);
      return false;
    }
  }

  return {
    usuario,
    usuarios,
    cargando,
    verificada,
    error,
    recargar: () => setIntento((valor) => valor + 1),
    iniciar: (correo, clave) =>
      intentar(async () => {
        const actual = await api.iniciar(correo, clave);
        await actualizar(actual);
        return actual;
      }),
    cerrar: () =>
      intentar(async () => {
        await api.cerrar();
        await actualizar(null);
        return true;
      }),
    registrar: (datos, entrar) =>
      intentar(async () => {
        const creado = await (entrar ? api.registrar(datos) : api.crear(datos));
        if (entrar) {
          const actual = await api.iniciar(datos.correo, datos.contrasena);
          await actualizar(actual);
        } else setUsuarios((anteriores) => [...anteriores, creado]);
        return true;
      }),
    perfil: (datos) =>
      intentar(async () => {
        await actualizar(await api.perfil(datos));
        return true;
      }),
    editar: (datos) =>
      intentar(async () => {
        const editado = await api.editar(datos);
        setUsuarios((anteriores) =>
          anteriores.map((item) => (item.id === editado.id ? editado : item)),
        );
        if (usuario?.id === editado.id) setUsuario(editado);
        return true;
      }),
    clave: (correo, actual, nueva) =>
      intentar(async () => {
        await api.clave(correo, actual, nueva);
        if (usuario?.correo === correo.trim().toLowerCase())
          await actualizar(null);
        return true;
      }),
  };
}
