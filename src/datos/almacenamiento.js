import { usuariosDemostracion } from "./usuarios.js";

// Se conserva la clave original para recuperar datos de versiones anteriores.
export const CLAVE_TIENDA = "grano-tienda-react-v1";
const idsProductosBase = [
  "colombia",
  "etiopia",
  "blend",
  "dripper",
  "prensa",
  "taza",
];
// Las primeras versiones identificaban los seis productos con números del 1 al 6.
export const normalizarId = (id) =>
  idsProductosBase[Number(id) - 1] && /^\d+$/.test(String(id))
    ? idsProductosBase[Number(id) - 1]
    : String(id ?? "");
const asegurarLista = (valor) => (Array.isArray(valor) ? valor : []);
// Si una clave está vacía o tiene JSON dañado, se usa el valor alternativo.
function leerJSON(almacenamiento, clave, valorAlternativo = null) {
  try {
    return JSON.parse(almacenamiento.getItem(clave)) ?? valorAlternativo;
  } catch {
    return valorAlternativo;
  }
}

function combinarSinDuplicados(primeros, segundos, obtenerClave) {
  const registrosPorClave = new Map();

  // Se leen primero los secundarios: el primer grupo prevalece si hay repetidos.
  for (const registro of [...segundos, ...primeros]) {
    registrosPorClave.set(obtenerClave(registro), registro);
  }

  return [...registrosPorClave.values()];
}

const normalizarCorreo = (usuarioGuardado) =>
  typeof usuarioGuardado?.correo === "string"
    ? usuarioGuardado.correo.trim().toLowerCase()
    : "";

function normalizarProductos(items, productosIniciales) {
  const productosUnicos = new Map();
  for (const registroGuardado of asegurarLista(items)) {
    if (
      !registroGuardado ||
      registroGuardado.id === undefined ||
      typeof registroGuardado.nombre !== "string" ||
      !registroGuardado.nombre.trim() ||
      !Number.isFinite(Number(registroGuardado.precio)) ||
      Number(registroGuardado.precio) <= 0
    ) {
      continue;
    }
    const id = normalizarId(registroGuardado.id);
    const productoInicial = productosIniciales.find(
      (registro) => registro.id === id,
    );
    productosUnicos.set(id, {
      ...registroGuardado,
      id,
      nombre: registroGuardado.nombre.trim(),
      precio: Number(registroGuardado.precio),
      categoria: registroGuardado.categoria || "Café en grano",
      descripcion: registroGuardado.descripcion || "",
      detalle: registroGuardado.detalle || "",
      stock:
        Number.isInteger(registroGuardado.stock) && registroGuardado.stock >= 0
          ? registroGuardado.stock
          : 10,
      critico:
        Number.isInteger(registroGuardado.critico) &&
        registroGuardado.critico >= 0
          ? registroGuardado.critico
          : 3,
      // Una imagen propia tiene prioridad sobre la foto del catálogo base.
      imagen:
        typeof registroGuardado.imagen === "string" &&
        registroGuardado.imagen.startsWith("data:")
          ? registroGuardado.imagen
          : productoInicial?.imagen || "",
    });
  }
  return [...productosUnicos.values()];
}
// Agrupa las líneas repetidas y descarta cantidades o precios no válidos.
export function normalizarCarrito(items, productos) {
  const carritoPorProducto = new Map();
  for (const registro of asegurarLista(items)) {
    if (!registro || typeof registro !== "object") {
      continue;
    }
    const id = normalizarId(registro.id);
    const productoActual = productos.find(
      (registroGuardado) => registroGuardado.id === id,
    );
    const precio = Number(registro.precio ?? productoActual?.precio);
    const cantidad =
      registro.cantidad === undefined ? 1 : Number(registro.cantidad);
    if (
      !id ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      continue;
    }
    const lineaCarrito = {
      ...registro,
      id,
      nombre: String(registro.nombre || productoActual?.nombre || "Producto"),
      precio,
      cantidad,
      imagen: productoActual?.imagen || registro.imagen || "",
    };
    if (carritoPorProducto.has(id)) {
      carritoPorProducto.get(id).cantidad += cantidad;
    } else {
      carritoPorProducto.set(id, lineaCarrito);
    }
  }
  return [...carritoPorProducto.values()];
}
export const totalCarrito = (items) =>
  items.reduce(
    (total, registroGuardado) =>
      total + registroGuardado.precio * registroGuardado.cantidad,
    0,
  );
// Recupera el esquema actual o importa el estado de las antiguas versiones.
export function cargarEstado(storage, productosIniciales) {
  const estadoGuardado = leerJSON(storage, CLAVE_TIENDA);
  const esEstadoGuardadoValido =
    [1, 2].includes(estadoGuardado?.version) &&
    Array.isArray(estadoGuardado.usuarios) &&
    (estadoGuardado.version !== 2 || Array.isArray(estadoGuardado.productos));
  const usuariosPrevios = asegurarLista(
    leerJSON(storage, "granoUsuariosReact"),
  );
  const catalogoPrevio = asegurarLista(
    leerJSON(storage, "granoProductosReact"),
  );
  const catalogoCompleto = leerJSON(storage, "granoCatalogoVersion", 0) === 2;
  const datosDeOrigen = esEstadoGuardadoValido
    ? estadoGuardado
    : {
        usuarios: combinarSinDuplicados(
          asegurarLista(leerJSON(storage, "usuarios-grano")),
          usuariosPrevios,
          normalizarCorreo,
        ),
        sesion:
          leerJSON(storage, "sesion-grano") ??
          leerJSON(storage, "granoSesionReact"),
        carrito:
          leerJSON(storage, "carrito-grano") ??
          leerJSON(storage, "granoCarritoReact", []),
        pedidos: combinarSinDuplicados(
          asegurarLista(leerJSON(storage, "pedidos-grano")),
          asegurarLista(leerJSON(storage, "granoPedidosReact")),
          (registroGuardado) => registroGuardado?.id,
        ),
        mensajes: combinarSinDuplicados(
          asegurarLista(leerJSON(storage, "mensajes-grano")),
          asegurarLista(leerJSON(storage, "granoMensajesReact")),
          (mensajeGuardado) =>
            JSON.stringify([
              mensajeGuardado?.fecha,
              mensajeGuardado?.correo,
              mensajeGuardado?.texto,
            ]),
        ),
      };
  let catalogoAImportar;
  if (esEstadoGuardadoValido && estadoGuardado.version === 2) {
    catalogoAImportar = estadoGuardado.productos;
  } else if (esEstadoGuardadoValido) {
    // El esquema 1 no permitía editar productos base. Se recuperan sus cambios
    // sin volver a crear los productos personalizados que el usuario eliminó.
    const productosBase = catalogoCompleto
      ? catalogoPrevio.filter((registroGuardado) =>
          idsProductosBase.includes(normalizarId(registroGuardado?.id)),
        )
      : productosIniciales;
    catalogoAImportar = [
      ...productosBase,
      ...asegurarLista(estadoGuardado.productosNuevos),
    ];
  } else {
    catalogoAImportar = catalogoCompleto
      ? catalogoPrevio
      : [...productosIniciales, ...catalogoPrevio];
  }
  const productos = normalizarProductos(catalogoAImportar, productosIniciales);
  const usuarios = asegurarLista(datosDeOrigen.usuarios)
    .filter(
      (usuarioGuardado) =>
        usuarioGuardado &&
        normalizarCorreo(usuarioGuardado) &&
        typeof usuarioGuardado.nombre === "string" &&
        typeof usuarioGuardado.contrasena === "string",
    )
    .map((usuarioGuardado) => {
      const usuarioAnterior = usuariosPrevios.find(
        (registroGuardado) =>
          normalizarCorreo(registroGuardado) ===
          normalizarCorreo(usuarioGuardado),
      );
      const rolConservado =
        esEstadoGuardadoValido &&
        estadoGuardado.version === 1 &&
        usuarioAnterior?.rol === "vendedor"
          ? "vendedor"
          : usuarioGuardado.rol;
      return {
        ...usuarioGuardado,
        correo: normalizarCorreo(usuarioGuardado),
        rol: ["admin", "vendedor", "comprador"].includes(rolConservado)
          ? rolConservado
          : "comprador",
        activo: usuarioGuardado.activo !== false,
      };
    });
  // Las tres cuentas de prueba conservan siempre sus credenciales y permisos.
  for (const usuarioDemostracion of usuariosDemostracion) {
    const usuarioExistente = usuarios.find(
      (usuarioGuardado) =>
        usuarioGuardado.correo === usuarioDemostracion.correo,
    );
    if (usuarioExistente) {
      Object.assign(usuarioExistente, usuarioDemostracion);
    } else {
      usuarios.push({ ...usuarioDemostracion });
    }
  }
  const usuarioDeSesion = usuarios.find(
    (usuarioGuardado) =>
      usuarioGuardado.correo === datosDeOrigen.sesion?.correo &&
      usuarioGuardado.activo,
  );
  return {
    version: 2,
    productos,
    usuarios,
    sesion: usuarioDeSesion
      ? {
          nombre: usuarioDeSesion.nombre,
          correo: usuarioDeSesion.correo,
          rol: usuarioDeSesion.rol,
        }
      : null,
    carrito: normalizarCarrito(datosDeOrigen.carrito, productos).filter(
      (registroGuardado) =>
        productos.some(
          (productoCatalogo) => productoCatalogo.id === registroGuardado.id,
        ),
    ),
    pedidos: asegurarLista(datosDeOrigen.pedidos)
      .filter(
        (pedidoGuardado) =>
          pedidoGuardado &&
          pedidoGuardado.id &&
          typeof pedidoGuardado.comprador === "string",
      )
      .map((pedidoGuardado) => {
        const productosDelPedido = normalizarCarrito(
          pedidoGuardado.productos,
          productos,
        );
        return {
          ...pedidoGuardado,
          productos: productosDelPedido,
          total: Number.isFinite(Number(pedidoGuardado.total))
            ? Number(pedidoGuardado.total)
            : totalCarrito(productosDelPedido),
          estado: pedidoGuardado.estado || "Recibido",
        };
      }),
    mensajes: asegurarLista(datosDeOrigen.mensajes)
      .filter(
        (mensajeGuardado) =>
          mensajeGuardado && typeof mensajeGuardado.texto === "string",
      )
      .map((mensajeGuardado) => ({
        ...mensajeGuardado,
        estado: mensajeGuardado.estado || "Nuevo",
      })),
  };
}
// Una sola escritura conserva inventario, pedidos y carrito juntos.
export function guardarEstado(storage, estado) {
  storage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
}
