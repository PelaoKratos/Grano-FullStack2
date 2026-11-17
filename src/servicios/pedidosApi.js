import { crearClienteApi } from "./clienteApi.js";

export function crearPedidosApi(direccion) {
  const pedir = crearClienteApi(direccion);
  return {
    listar: (signal) => pedir("/pedidos", { signal }),
    comprar: (datos) =>
      pedir("/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      }),
    estado: (id, estado) =>
      pedir(`/pedidos/${encodeURIComponent(id)}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      }),
  };
}
