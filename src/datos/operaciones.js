import { esRutValido, formatearRut } from "./rut.js";
const categorias = ["Café en grano", "Métodos", "Accesorios"];
const roles = ["comprador", "vendedor", "admin"];
export const estadosPedido = ["Recibido", "En preparación", "Entregado"];
const entero = (value) =>
  value !== "" &&
  value !== null &&
  Number.isInteger(Number(value)) &&
  Number(value) >= 0;
const sesionDe = (u) => ({ nombre: u.nombre, correo: u.correo, rol: u.rol });
export function operar(estado, accion) {
  const usuario = estado.usuarios.find(
    (u) => u.correo === estado.sesion?.correo && u.activo !== false,
  );
  const correcto = (cambios, resultado = true) => ({
    estado: { ...estado, ...cambios },
    resultado,
  });
  const error = (mensaje) => ({ estado, resultado: false, mensaje });
  if (
    [
      "PRODUCTO_GUARDAR",
      "PRODUCTO_ELIMINAR",
      "USUARIO_GUARDAR",
      "PEDIDO_ESTADO",
      "MENSAJE_LEIDO",
    ].includes(accion.tipo) &&
    usuario?.rol !== "admin"
  )
    return error("Inicia sesión como administrador para realizar esta acción.");
  switch (accion.tipo) {
    case "INICIAR": {
      const user = estado.usuarios.find(
        (u) =>
          u.correo === accion.correo.trim().toLowerCase() &&
          u.contrasena === accion.contrasena &&
          u.activo !== false,
      );
      return user
        ? correcto({ sesion: sesionDe(user) }, user)
        : error("Correo o contraseña incorrectos, o cuenta desactivada.");
    }
    case "CERRAR":
      return correcto({ sesion: null, carrito: [] });
    case "REGISTRAR": {
      if (!accion.entrar && usuario?.rol !== "admin")
        return error("Esta acción requiere una cuenta de administrador.");
      const datos = accion.usuario,
        correo = datos.correo.trim().toLowerCase(),
        nombre = datos.nombre.trim();
      if (
        !nombre ||
        !/^\S+@\S+\.\S+$/.test(correo) ||
        datos.contrasena.length < 6 ||
        !roles.includes(datos.rol)
      )
        return error("Revisa el nombre, correo, rol y contraseña.");
      if (accion.entrar && !esRutValido(datos.rut || ""))
        return error("Ingresa un RUT válido.");
      const rut = datos.rut ? formatearRut(datos.rut) : "";
      if (
        estado.usuarios.some(
          (u) =>
            u.correo === correo ||
            (rut && u.rut && formatearRut(u.rut) === rut),
        )
      )
        return error("Ya existe una cuenta con ese RUT o correo.");
      const nuevo = {
        ...datos,
        nombre,
        correo,
        ...(rut ? { rut } : {}),
        rol: accion.entrar ? "comprador" : datos.rol,
        activo: true,
        cuentaDemostracion: false,
      };
      return correcto({
        usuarios: [...estado.usuarios, nuevo],
        sesion: accion.entrar ? sesionDe(nuevo) : estado.sesion,
      });
    }
    case "PERFIL": {
      if (!usuario || accion.usuario.correo !== usuario.correo)
        return error("Inicia sesión para guardar tu perfil.");
      const nombre = accion.usuario.nombre.trim();
      if (!nombre) return error("Ingresa tu nombre.");
      const actualizado = { ...usuario, nombre };
      for (const campo of ["telefono", "direccion", "comuna", "region"])
        actualizado[campo] = String(accion.usuario[campo] || "").trim();
      return correcto({
        usuarios: estado.usuarios.map((u) =>
          u.correo === usuario.correo ? actualizado : u,
        ),
        sesion: sesionDe(actualizado),
      });
    }
    case "CLAVE": {
      const user = estado.usuarios.find(
        (u) =>
          u.correo === accion.correo.trim().toLowerCase() &&
          u.contrasena === accion.actual &&
          u.activo !== false,
      );
      if (!user || user.cuentaDemostracion || accion.nueva.length < 6)
        return error(
          user?.cuentaDemostracion
            ? "Las cuentas de prueba mantienen sus contraseñas de demostración."
            : "No pudimos validar los datos o la contraseña nueva.",
        );
      return correcto({
        usuarios: estado.usuarios.map((u) =>
          u.correo === user.correo ? { ...u, contrasena: accion.nueva } : u,
        ),
      });
    }
    case "AGREGAR": {
      const p = estado.productos.find((p) => p.id === accion.id),
        linea = estado.carrito.find((p) => p.id === accion.id);
      if (!p || (linea?.cantidad || 0) >= p.stock)
        return error("No hay más stock disponible de este producto.");
      return correcto({
        carrito: linea
          ? estado.carrito.map((item) =>
              item.id === p.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item,
            )
          : [...estado.carrito, { ...p, cantidad: 1 }],
      });
    }
    case "CANTIDAD": {
      const p = estado.productos.find((p) => p.id === accion.id);
      if (!p || !p.stock)
        return error(
          "Este producto está agotado. Puedes quitarlo del carrito.",
        );
      if (![-1, 1].includes(accion.cambio)) return error("Cantidad no válida.");
      return correcto({
        carrito: estado.carrito.map((item) =>
          item.id === p.id
            ? {
                ...item,
                cantidad: Math.max(
                  1,
                  Math.min(p.stock, item.cantidad + accion.cambio),
                ),
              }
            : item,
        ),
      });
    }
    case "QUITAR":
      return correcto({
        carrito: estado.carrito.filter((item) => item.id !== accion.id),
      });
    case "COMPRAR": {
      if (usuario?.rol !== "comprador" || !estado.carrito.length)
        return error(
          "Inicia sesión como comprador y agrega productos al carrito.",
        );
      const lineas = estado.carrito.map((item) => ({
        item,
        producto: estado.productos.find((p) => p.id === item.id),
      }));
      if (
        lineas.some(
          ({ item, producto }) =>
            !producto || item.cantidad > producto.stock || item.cantidad < 1,
        )
      )
        return error("Revisa las cantidades: el stock disponible cambió.");
      const productosPedido = lineas.map(({ item, producto }) => ({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: item.cantidad,
      }));
      const pedido = {
        id: accion.idPedido,
        fecha: accion.fecha,
        comprador: usuario.correo,
        estado: "Recibido",
        productos: productosPedido,
        total: productosPedido.reduce((t, p) => t + p.precio * p.cantidad, 0),
      };
      return correcto(
        {
          productos: estado.productos.map((p) => ({
            ...p,
            stock:
              p.stock -
              (estado.carrito.find((item) => item.id === p.id)?.cantidad || 0),
          })),
          pedidos: [pedido, ...estado.pedidos],
          carrito: [],
        },
        pedido,
      );
    }
    case "PRODUCTO_GUARDAR": {
      const datos = accion.producto,
        nombre = datos.nombre.trim(),
        precio = Number(datos.precio),
        stock = datos.stock ?? 10,
        critico = datos.critico ?? 3;
      const anterior = estado.productos.find((p) => p.id === datos.id);
      if (
        !nombre ||
        !Number.isFinite(precio) ||
        precio <= 0 ||
        !entero(stock) ||
        !entero(critico) ||
        !categorias.includes(datos.categoria) ||
        !datos.descripcion.trim() ||
        !datos.detalle.trim() ||
        estado.productos.some(
          (p) =>
            p.id !== anterior?.id &&
            p.nombre.toLowerCase() === nombre.toLowerCase(),
        )
      )
        return error(
          "Revisa el nombre, precio, stock y descripción del producto.",
        );
      if (
        datos.imagen &&
        !/^data:image\/(png|jpeg|webp);base64,/.test(datos.imagen)
      )
        return error("Elige una imagen JPG, PNG o WebP.");
      if (
        datos.imagen &&
        Math.floor((datos.imagen.split(",")[1].length * 3) / 4) > 500000
      )
        return error("La imagen no puede superar 500 KB.");
      const producto = {
        ...anterior,
        id: anterior?.id || accion.idNuevo,
        nombre,
        categoria: datos.categoria,
        descripcion: datos.descripcion.trim(),
        detalle: datos.detalle.trim(),
        precio,
        stock: Number(stock),
        critico: Number(critico),
        imagen: datos.imagen || anterior?.imagen || "",
        notas:
          anterior && anterior.descripcion === datos.descripcion.trim()
            ? anterior.notas
            : datos.descripcion.trim(),
      };
      return correcto({
        productos: anterior
          ? estado.productos.map((p) => (p.id === anterior.id ? producto : p))
          : [...estado.productos, producto],
      });
    }
    case "PRODUCTO_ELIMINAR":
      return correcto({
        productos: estado.productos.filter((p) => p.id !== accion.id),
        carrito: estado.carrito.filter((p) => p.id !== accion.id),
      });
    case "USUARIO_GUARDAR": {
      const anterior = estado.usuarios.find(
          (u) => u.correo === accion.usuario.correo,
        ),
        datos = accion.usuario;
      if (!anterior || anterior.cuentaDemostracion)
        return error(
          "Las cuentas de prueba no se pueden desactivar ni cambiar de rol.",
        );
      if (!roles.includes(datos.rol) || typeof datos.activo !== "boolean")
        return error("Revisa el rol y estado de la cuenta.");
      if (
        anterior.correo === usuario.correo &&
        (datos.rol !== "admin" || !datos.activo)
      )
        return error(
          "No puedes desactivar tu cuenta de administrador ni quitarte ese rol.",
        );
      return correcto({
        usuarios: estado.usuarios.map((u) =>
          u.correo === anterior.correo
            ? { ...u, rol: datos.rol, activo: datos.activo }
            : u,
        ),
      });
    }
    case "MENSAJE_ENVIAR": {
      if (!accion.mensaje.texto.trim())
        return error("Escribe un mensaje antes de enviarlo.");
      return correcto({
        mensajes: [{ ...accion.mensaje, estado: "Nuevo" }, ...estado.mensajes],
      });
    }
    case "MENSAJE_LEIDO":
      return correcto({
        mensajes: estado.mensajes.map((m, i) =>
          i === accion.indice ? { ...m, estado: "Leído" } : m,
        ),
      });
    case "PEDIDO_ESTADO": {
      if (!estadosPedido.includes(accion.estado))
        return error("El estado del pedido no es válido.");
      return correcto({
        pedidos: estado.pedidos.map((p) =>
          p.id === accion.id ? { ...p, estado: accion.estado } : p,
        ),
      });
    }
    default:
      return error("Acción no disponible.");
  }
}
