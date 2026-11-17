import { crearClienteApi } from "./clienteApi.js";

export function crearCategoriasApi(direccion) {
  const pedir = crearClienteApi(direccion);
  return {
    listar: (signal) => pedir("/categorias", { signal }),
    guardar: (id, nombre) =>
      pedir(id ? `/categorias/${encodeURIComponent(id)}` : "/categorias", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      }),
    eliminar: (id) =>
      pedir(`/categorias/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
