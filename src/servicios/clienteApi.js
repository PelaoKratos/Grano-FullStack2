// Compartimos cookies, errores y el token de seguridad entre los servicios.
export function crearClienteApi(direccion) {
  const base = direccion.replace(/\/$/, "");
  async function enviar(ruta, opciones = {}) {
    let respuesta;
    try {
      respuesta = await fetch(base + ruta, {
        ...opciones,
        credentials: "include",
      });
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
      const error = new Error(
        [
          datos?.mensaje || `La API respondió con error ${respuesta.status}.`,
          campos,
        ]
          .filter(Boolean)
          .join(" "),
      );
      error.status = respuesta.status;
      if (
        error.status === 401 &&
        !["/auth/login", "/auth/clave", "/auth/me"].includes(ruta)
      ) {
        window.dispatchEvent(new Event("grano-sesion-vencida"));
      }
      throw error;
    }
    if (datos === null)
      throw new Error("El backend devolvió una respuesta que no pudimos leer.");
    return datos;
  }
  return async (ruta, opciones = {}) => {
    if (opciones.method && opciones.method !== "GET") {
      // Pedimos uno nuevo porque Spring lo cambia después de entrar o salir.
      const csrf = await enviar("/auth/csrf");
      opciones = {
        ...opciones,
        headers: { ...opciones.headers, [csrf.headerName]: csrf.token },
      };
    }
    return enviar(ruta, opciones);
  };
}
