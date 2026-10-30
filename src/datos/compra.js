export function validarEntrega(entrega) {
  if (!entrega || !["domicilio", "retiro"].includes(entrega.metodo)) {
    return "Selecciona una opción de entrega.";
  }
  if (
    !String(entrega.nombre || "").trim() ||
    !/^\S+@\S+\.\S+$/.test(entrega.correo || "")
  ) {
    return "Revisa el nombre y el correo de contacto.";
  }
  if (!String(entrega.telefono || "").trim()) {
    return "Ingresa un teléfono de contacto.";
  }
  if (
    entrega.metodo === "domicilio" &&
    ["direccion", "comuna", "region"].some(
      (campo) => !String(entrega[campo] || "").trim(),
    )
  ) {
    return "Completa la dirección, comuna y región de entrega.";
  }
  return "";
}

export function normalizarEntrega(datos) {
  const entrega = {};
  for (const campo of [
    "nombre",
    "correo",
    "telefono",
    "metodo",
    "direccion",
    "comuna",
    "region",
    "indicaciones",
  ]) {
    entrega[campo] = String(datos?.[campo] || "")
      .trim()
      .slice(0, 250);
  }
  return entrega;
}

export const estaEnOferta = (producto) =>
  Number.isFinite(Number(producto.precioAnterior)) &&
  Number(producto.precioAnterior) > producto.precio;

export function resumirVentas(pedidos, productos) {
  return {
    cantidad: pedidos.length,
    total: pedidos.reduce((total, pedido) => total + pedido.total, 0),
    unidades: pedidos.reduce(
      (total, pedido) =>
        total +
        pedido.productos.reduce(
          (suma, producto) => suma + producto.cantidad,
          0,
        ),
      0,
    ),
    estados: ["Recibido", "En preparación", "Entregado"].map((estado) => ({
      estado,
      cantidad: pedidos.filter((pedido) => pedido.estado === estado).length,
    })),
    stockCritico: productos.filter(
      (producto) => producto.stock <= producto.critico,
    ),
  };
}
