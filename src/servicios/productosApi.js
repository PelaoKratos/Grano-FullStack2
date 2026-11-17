import { crearClienteApi } from "./clienteApi.js";

// Dejamos las peticiones aquí para que los componentes no tengan código de fetch.
export function crearProductosApi(direccion) {
  const cliente = crearClienteApi(direccion);
  const pedir = (ruta, opciones) => cliente(`/productos${ruta}`, opciones);

  return {
    listar: (signal) => pedir("", { signal }),
    guardar: (producto) => {
      const { id, ...datos } = producto;
      return pedir(id ? `/${encodeURIComponent(id)}` : "", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
    },
    eliminar: (id) => pedir(`/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
