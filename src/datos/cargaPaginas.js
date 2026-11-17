// Cada página espera solo los datos que necesita para abrir por primera vez.
export function usaPedidos(ruta) {
  return (
    ["/cuenta", "/vendedor", "/admin", "/admin/"].includes(ruta) ||
    ["/compra/", "/admin/pedidos", "/admin/reportes", "/admin/usuarios"].some(
      (prefijo) => ruta.startsWith(prefijo),
    )
  );
}

export function usaMensajes(ruta) {
  return (
    ["/admin", "/admin/"].includes(ruta) || ruta.startsWith("/admin/mensajes")
  );
}

export function cargaPagina(tienda, ruta) {
  if (!tienda.usarApi) return "lista";
  const catalogo =
    [
      "/",
      "/productos",
      "/categorias",
      "/ofertas",
      "/carrito",
      "/checkout",
      "/vendedor",
      "/admin",
      "/admin/",
    ].includes(ruta) ||
    [
      "/producto/",
      "/admin/productos",
      "/admin/categorias",
      "/admin/reportes",
    ].some((prefijo) => ruta.startsWith(prefijo));
  const sesion =
    [
      "/acceso",
      "/registro",
      "/cambiar-clave",
      "/cuenta",
      "/carrito",
      "/checkout",
      "/vendedor",
    ].includes(ruta) ||
    ruta.startsWith("/admin") ||
    ruta.startsWith("/compra/");
  const recursos = [];
  if (catalogo) {
    recursos.push([
      tienda.catalogoDisponible,
      tienda.cargandoProductos,
      tienda.errorProductos,
    ]);
    recursos.push([
      tienda.categoriasDisponibles,
      tienda.cargandoCategorias,
      tienda.errorCategorias,
    ]);
  }
  if (sesion)
    recursos.push([
      tienda.sesionVerificada,
      tienda.cargandoSesion,
      tienda.errorSesion,
    ]);
  if (usaPedidos(ruta))
    recursos.push([
      tienda.pedidosDisponibles,
      tienda.cargandoPedidos,
      tienda.errorPedidos,
    ]);
  if (usaMensajes(ruta))
    recursos.push([
      tienda.mensajesDisponibles,
      tienda.cargandoMensajes,
      tienda.errorMensajes,
    ]);
  if (recursos.some(([disponible, cargando]) => !disponible && cargando))
    return "cargando";
  if (recursos.some(([disponible, , error]) => !disponible && error))
    return "error";
  return "lista";
}
