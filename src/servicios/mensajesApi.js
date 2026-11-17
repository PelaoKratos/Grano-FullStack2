import { crearClienteApi } from "./clienteApi.js";

export function crearMensajesApi(direccion) {
  const pedir = crearClienteApi(direccion);
  return {
    listar: (signal) => pedir("/mensajes", { signal }),
    enviar: ({ nombre, correo, texto }) =>
      pedir("/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, texto }),
      }),
    marcar: (id) =>
      pedir(`/mensajes/${encodeURIComponent(id)}/leido`, { method: "PUT" }),
  };
}
