// Dejamos las peticiones aquí para que los componentes no tengan código de fetch.
export function crearProductosApi(direccion) {
  const url = `${direccion.replace(/\/$/, "")}/productos`;

  async function pedir(ruta = "", opciones = {}) {
    let respuesta;
    try {
      respuesta = await fetch(url + ruta, opciones);
    } catch (error) {
      if (error.name === "AbortError") throw error;
      throw new Error(
        "No pudimos conectar con el backend. Revisa que esté encendido y vuelve a intentar.",
      );
    }
    if (respuesta.status === 204) return null;
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      const campos = Object.values(datos?.campos || {}).join(" ");
      throw new Error(
        [
          datos?.mensaje || `La API respondió con error ${respuesta.status}.`,
          campos,
        ]
          .filter(Boolean)
          .join(" "),
      );
    }
    if (datos === null)
      throw new Error("El backend devolvió una respuesta que no pudimos leer.");
    return datos;
  }

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
