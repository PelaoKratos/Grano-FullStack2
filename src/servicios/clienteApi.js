// Compartimos cookies, errores y el token de seguridad entre los servicios.
export function crearClienteApi(direccion, { tiempoEspera = 10000 } = {}) {
  const base = direccion.replace(/\/$/, "");
  async function enviar(ruta, opciones = {}) {
    const controlador = new AbortController();
    const cancelar = () => controlador.abort();
    const externa = opciones.signal;
    if (externa?.aborted) cancelar();
    externa?.addEventListener("abort", cancelar, { once: true });
    let agotado = false;
    const temporizador = setTimeout(() => {
      agotado = true;
      cancelar();
    }, tiempoEspera);
    let respuesta;
    let datos = null;
    try {
      respuesta = await fetch(base + ruta, {
        ...opciones,
        credentials: "include",
        signal: controlador.signal,
      });
      if (respuesta.status !== 204) {
        try {
          datos = await respuesta.json();
        } catch (error) {
          if (controlador.signal.aborted) throw error;
        }
      }
    } catch (error) {
      if (agotado)
        throw new Error(
          "El servidor tardó demasiado en responder. Revisa la conexión y vuelve a intentar.",
        );
      if (error.name === "AbortError") throw error;
      throw new Error(
        "No pudimos conectar con el backend. Revisa que esté encendido y vuelve a intentar.",
      );
    } finally {
      clearTimeout(temporizador);
      externa?.removeEventListener("abort", cancelar);
    }
    if (respuesta.status === 204) return null;
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
