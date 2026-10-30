export const categoriasBase = ["Café en grano", "Métodos", "Accesorios"];

// Conserva los filtros de las direcciones que ya estaban guardadas.
export function claveCategoria(nombre) {
  const normalizado = String(nombre)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  const anteriores = {
    "cafe en grano": "cafe",
    metodos: "metodos",
    accesorios: "accesorios",
  };
  return (
    anteriores[normalizado] ||
    normalizado.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  );
}

export function obtenerCategorias(estado) {
  return [
    ...new Set(
      [
        ...(Array.isArray(estado.categorias)
          ? estado.categorias
          : categoriasBase),
        ...estado.productos.map((producto) => producto.categoria),
      ].filter((nombre) => typeof nombre === "string" && nombre.trim()),
    ),
  ];
}
