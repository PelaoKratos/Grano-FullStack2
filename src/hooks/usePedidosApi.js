import { useEffect, useMemo, useRef, useState } from "react";
import { crearPedidosApi } from "../servicios/pedidosApi.js";
import { normalizarEntrega, validarEntrega } from "../datos/compra.js";

// Los pedidos vienen de la base. En el navegador solo conservamos el intento pendiente.
export function usePedidosApi(direccion, usuario) {
  const api = useMemo(
    () => (direccion ? crearPedidosApi(direccion) : null),
    [direccion],
  );
  const propietario = usuario ? `${usuario.id}:${usuario.rol}` : "";
  const [datos, setDatos] = useState({ propietario: "", pedidos: [] });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const ocupado = useRef(false);
  const ultimoError = useRef("");
  const lectura = useRef(null);
  const clavePendiente = usuario ? `grano-compra-pendiente-${usuario.id}` : "";

  useEffect(() => {
    if (!api || !propietario) {
      setDatos({ propietario: "", pedidos: [] });
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
      .then((pedidos) => {
        if (!Array.isArray(pedidos))
          throw new Error("No pudimos leer la lista de pedidos.");
        if (!controlador.signal.aborted) setDatos({ propietario, pedidos });
      })
      .catch((fallo) => {
        if (!controlador.signal.aborted) setError(fallo.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });
    return () => controlador.abort();
  }, [api, propietario, intento]);

  function incorporar(pedido) {
    setDatos((anteriores) => ({
      propietario,
      pedidos: [
        pedido,
        ...(anteriores.propietario === propietario
          ? anteriores.pedidos
          : []
        ).filter((item) => item.id !== pedido.id),
      ],
    }));
  }

  async function comprar(carrito, entrega, resultadoPago) {
    if (ocupado.current) return false;
    ocupado.current = true;
    ultimoError.current = "";
    setError("");
    lectura.current?.abort();
    setCargando(false);
    try {
      if (usuario?.rol !== "comprador")
        throw new Error(
          "Inicia sesión como comprador para realizar el pedido.",
        );
      if (!carrito.length)
        throw new Error("Agrega productos al carrito antes de comprar.");
      const entregaLimpia = normalizarEntrega(entrega);
      const problema = validarEntrega(entregaLimpia);
      if (problema) throw new Error(problema);
      const pedido = {
        productos: carrito.map(({ id, cantidad }) => ({ id, cantidad })),
        entrega: entregaLimpia,
        resultadoPago,
      };
      const firma = JSON.stringify(pedido);
      let pendiente;
      try {
        pendiente = JSON.parse(localStorage.getItem(clavePendiente));
      } catch {
        pendiente = null;
      }
      const solicitudId =
        pendiente?.firma === firma
          ? pendiente.solicitudId
          : crypto.randomUUID();
      // Guardamos el identificador antes de enviar. Reintentar la misma compra no descuenta dos veces.
      localStorage.setItem(
        clavePendiente,
        JSON.stringify({ firma, solicitudId }),
      );
      const confirmado = await api.comprar({ ...pedido, solicitudId });
      incorporar(confirmado);
      return confirmado;
    } catch (fallo) {
      ultimoError.current = fallo.message;
      setError(fallo.message);
      return false;
    } finally {
      ocupado.current = false;
    }
  }

  return {
    pedidos: datos.propietario === propietario ? datos.pedidos : [],
    disponible: Boolean(propietario) && datos.propietario === propietario,
    cargando,
    error,
    comprar,
    errorCompra: () => ultimoError.current,
    confirmarCarrito: () => localStorage.removeItem(clavePendiente),
    recargar: () => {
      if (!ocupado.current) setIntento((valor) => valor + 1);
    },
    cambiarEstado: async (id, estado) => {
      if (ocupado.current) return false;
      ocupado.current = true;
      setError("");
      lectura.current?.abort();
      setCargando(false);
      try {
        incorporar(await api.estado(id, estado));
        return true;
      } catch (fallo) {
        setError(fallo.message);
        return false;
      } finally {
        ocupado.current = false;
      }
    },
  };
}
