import { crearClienteApi } from "./clienteApi.js";

export function crearCuentasApi(direccion) {
  const pedir = crearClienteApi(direccion);
  const json = (ruta, datos, method = "POST") =>
    pedir(ruta, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  return {
    actual: (signal) => pedir("/auth/me", { signal }),
    iniciar: (correo, contrasena) =>
      pedir("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          correo: correo.trim().toLowerCase(),
          contrasena,
        }).toString(),
      }),
    cerrar: () => pedir("/auth/logout", { method: "POST" }),
    registrar: (usuario) => json("/auth/registro", usuario),
    perfil: (usuario) => json("/auth/perfil", usuario, "PUT"),
    clave: (correo, actual, nueva) =>
      json("/auth/clave", { correo, actual, nueva }),
    listar: () => pedir("/usuarios"),
    crear: (usuario) => json("/usuarios", usuario),
    editar: (usuario) =>
      json(`/usuarios/${encodeURIComponent(usuario.id)}`, usuario, "PUT"),
  };
}
