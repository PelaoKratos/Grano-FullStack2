import { usuariosDemostracion } from "./usuarios.js";
export const CLAVE_TIENDA = "grano-tienda-react-v1";
const ids = ["colombia", "etiopia", "blend", "dripper", "prensa", "taza"];
export const normalizarId = (id) =>
  ids[Number(id) - 1] && /^\d+$/.test(String(id))
    ? ids[Number(id) - 1]
    : String(id ?? "");
const lista = (value) => (Array.isArray(value) ? value : []);
function leer(storage, key, fallback = null) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
const unir = (primero, segundo, key) => [
  ...new Map(
    [...segundo, ...primero].map((item) => [key(item), item]),
  ).values(),
];
const correo = (u) =>
  typeof u?.correo === "string" ? u.correo.trim().toLowerCase() : "";

function normalizarProductos(items, iniciales) {
  const unicos = new Map();
  for (const p of lista(items)) {
    if (
      !p ||
      p.id === undefined ||
      typeof p.nombre !== "string" ||
      !p.nombre.trim() ||
      !Number.isFinite(Number(p.precio)) ||
      Number(p.precio) <= 0
    )
      continue;
    const id = normalizarId(p.id),
      base = iniciales.find((item) => item.id === id);
    unicos.set(id, {
      ...p,
      id,
      nombre: p.nombre.trim(),
      precio: Number(p.precio),
      categoria: p.categoria || "Café en grano",
      descripcion: p.descripcion || "",
      detalle: p.detalle || "",
      stock: Number.isInteger(p.stock) && p.stock >= 0 ? p.stock : 10,
      critico: Number.isInteger(p.critico) && p.critico >= 0 ? p.critico : 3,
      imagen:
        typeof p.imagen === "string" && p.imagen.startsWith("data:")
          ? p.imagen
          : base?.imagen || "",
    });
  }
  return [...unicos.values()];
}
export function normalizarCarrito(items, productos) {
  const resultado = new Map();
  for (const item of lista(items)) {
    if (!item || typeof item !== "object") continue;
    const id = normalizarId(item.id),
      actual = productos.find((p) => p.id === id);
    const precio = Number(item.precio ?? actual?.precio),
      cantidad = item.cantidad === undefined ? 1 : Number(item.cantidad);
    if (
      !id ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    )
      continue;
    const linea = {
      ...item,
      id,
      nombre: String(item.nombre || actual?.nombre || "Producto"),
      precio,
      cantidad,
      imagen: actual?.imagen || item.imagen || "",
    };
    if (resultado.has(id)) resultado.get(id).cantidad += cantidad;
    else resultado.set(id, linea);
  }
  return [...resultado.values()];
}
export const totalCarrito = (items) =>
  items.reduce((total, p) => total + p.precio * p.cantidad, 0);
export function cargarEstado(storage, iniciales) {
  const guardado = leer(storage, CLAVE_TIENDA);
  const valido =
    [1, 2].includes(guardado?.version) &&
    Array.isArray(guardado.usuarios) &&
    (guardado.version !== 2 || Array.isArray(guardado.productos));
  const usuariosPrevios = lista(leer(storage, "granoUsuariosReact"));
  const catalogoPrevio = lista(leer(storage, "granoProductosReact"));
  const catalogoCompleto = leer(storage, "granoCatalogoVersion", 0) === 2;
  const origen = valido
    ? guardado
    : {
        usuarios: unir(
          lista(leer(storage, "usuarios-grano")),
          usuariosPrevios,
          correo,
        ),
        sesion:
          leer(storage, "sesion-grano") ?? leer(storage, "granoSesionReact"),
        carrito:
          leer(storage, "carrito-grano") ??
          leer(storage, "granoCarritoReact", []),
        pedidos: unir(
          lista(leer(storage, "pedidos-grano")),
          lista(leer(storage, "granoPedidosReact")),
          (p) => p?.id,
        ),
        mensajes: unir(
          lista(leer(storage, "mensajes-grano")),
          lista(leer(storage, "granoMensajesReact")),
          (m) => JSON.stringify([m?.fecha, m?.correo, m?.texto]),
        ),
      };
  let entrada;
  if (valido && guardado.version === 2) entrada = guardado.productos;
  else if (valido) {
    // Version 1 could not edit base products. Recover stock/edits from the complete
    // base-branch catalog, while respecting custom products deleted in version 1.
    const bases = catalogoCompleto
      ? catalogoPrevio.filter((p) => ids.includes(normalizarId(p?.id)))
      : iniciales;
    entrada = [...bases, ...lista(guardado.productosNuevos)];
  } else
    entrada = catalogoCompleto
      ? catalogoPrevio
      : [...iniciales, ...catalogoPrevio];
  const productos = normalizarProductos(entrada, iniciales);
  const usuarios = lista(origen.usuarios)
    .filter(
      (u) =>
        u &&
        correo(u) &&
        typeof u.nombre === "string" &&
        typeof u.contrasena === "string",
    )
    .map((u) => {
      const previo = usuariosPrevios.find((p) => correo(p) === correo(u));
      const rol =
        valido && guardado.version === 1 && previo?.rol === "vendedor"
          ? "vendedor"
          : u.rol;
      return {
        ...u,
        correo: correo(u),
        rol: ["admin", "vendedor", "comprador"].includes(rol)
          ? rol
          : "comprador",
        activo: u.activo !== false,
      };
    });
  for (const demo of usuariosDemostracion) {
    const existente = usuarios.find((u) => u.correo === demo.correo);
    if (existente) Object.assign(existente, demo);
    else usuarios.push({ ...demo });
  }
  const actual = usuarios.find(
    (u) => u.correo === origen.sesion?.correo && u.activo,
  );
  return {
    version: 2,
    productos,
    usuarios,
    sesion: actual
      ? { nombre: actual.nombre, correo: actual.correo, rol: actual.rol }
      : null,
    carrito: normalizarCarrito(origen.carrito, productos).filter((p) =>
      productos.some((actual) => actual.id === p.id),
    ),
    pedidos: lista(origen.pedidos)
      .filter((p) => p && p.id && typeof p.comprador === "string")
      .map((p) => {
        const items = normalizarCarrito(p.productos, productos);
        return {
          ...p,
          productos: items,
          total: Number.isFinite(Number(p.total))
            ? Number(p.total)
            : totalCarrito(items),
          estado: p.estado || "Recibido",
        };
      }),
    mensajes: lista(origen.mensajes)
      .filter((m) => m && typeof m.texto === "string")
      .map((m) => ({ ...m, estado: m.estado || "Nuevo" })),
  };
}
export function guardarEstado(storage, estado) {
  storage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
}
