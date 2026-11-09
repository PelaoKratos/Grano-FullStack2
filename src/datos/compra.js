// Devuelve el primer problema de contacto o entrega, o una cadena vacía si los
// datos son válidos.
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

// Conserva los campos de entrega esperados, limpia espacios y limita el largo
// de cada valor.
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

// Detecta una oferta si el precio anterior es un número válido mayor que el
// vigente.
export const estaEnOferta = (producto) =>
  Number.isFinite(Number(producto.precioAnterior)) &&
  Number(producto.precioAnterior) > producto.precio;

// Calcula las ventas, agrupa los pedidos por estado y detecta el stock crítico.
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
