import { esRutValido, formatearRut } from "./rut.js";

const categorias = ["Café en grano", "Métodos", "Accesorios"];
const roles = ["comprador", "vendedor", "admin"];
export const estadosPedido = ["Recibido", "En preparación", "Entregado"];
const esEnteroNoNegativo = (valor) =>
  valor !== "" &&
  valor !== null &&
  Number.isInteger(Number(valor)) &&
  Number(valor) >= 0;
const crearSesionDeUsuario = (cuentaGuardada) => ({
  nombre: cuentaGuardada.nombre,
  correo: cuentaGuardada.correo,
  rol: cuentaGuardada.rol,
});
// Calcula el siguiente estado sin escribir en localStorage ni modificar el recibido.
// useTienda se encarga de guardarlo únicamente cuando la acción resulta válida.
export function operar(estado, accion) {
  const usuario = estado.usuarios.find(
    (cuentaGuardada) =>
      cuentaGuardada.correo === estado.sesion?.correo &&
      cuentaGuardada.activo !== false,
  );
  const respuestaCorrecta = (cambios, resultado = true) => ({
    estado: { ...estado, ...cambios },
    resultado,
  });
  const respuestaConError = (mensaje) => ({
    estado,
    resultado: false,
    mensaje,
  });
  // Estas acciones pertenecen exclusivamente a administración.
  if (
    [
      "PRODUCTO_GUARDAR",
      "PRODUCTO_ELIMINAR",
      "USUARIO_GUARDAR",
      "PEDIDO_ESTADO",
      "MENSAJE_LEIDO",
    ].includes(accion.tipo) &&
    usuario?.rol !== "admin"
  ) {
    return respuestaConError(
      "Inicia sesión como administrador para realizar esta acción.",
    );
  }
  switch (accion.tipo) {
    // Acceso, registro y mantenimiento de las cuentas.
    case "INICIAR": {
      const usuarioEncontrado = estado.usuarios.find(
        (cuentaGuardada) =>
          cuentaGuardada.correo === accion.correo.trim().toLowerCase() &&
          cuentaGuardada.contrasena === accion.contrasena &&
          cuentaGuardada.activo !== false,
      );
      return usuarioEncontrado
        ? respuestaCorrecta(
            { sesion: crearSesionDeUsuario(usuarioEncontrado) },
            usuarioEncontrado,
          )
        : respuestaConError(
            "Correo o contraseña incorrectos, o cuenta desactivada.",
          );
    }
    case "CERRAR":
      return respuestaCorrecta({ sesion: null, carrito: [] });
    case "REGISTRAR": {
      if (!accion.entrar && usuario?.rol !== "admin") {
        return respuestaConError(
          "Esta acción requiere una cuenta de administrador.",
        );
      }
      const datos = accion.usuario;
      const correo = datos.correo.trim().toLowerCase();
      const nombre = datos.nombre.trim();
      if (
        !nombre ||
        !/^\S+@\S+\.\S+$/.test(correo) ||
        datos.contrasena.length < 6 ||
        !roles.includes(datos.rol)
      ) {
        return respuestaConError("Revisa el nombre, correo, rol y contraseña.");
      }
      if (accion.entrar && !esRutValido(datos.rut || "")) {
        return respuestaConError("Ingresa un RUT válido.");
      }
      const rut = datos.rut ? formatearRut(datos.rut) : "";
      if (
        estado.usuarios.some(
          (cuentaGuardada) =>
            cuentaGuardada.correo === correo ||
            (rut &&
              cuentaGuardada.rut &&
              formatearRut(cuentaGuardada.rut) === rut),
        )
      ) {
        return respuestaConError("Ya existe una cuenta con ese RUT o correo.");
      }
      const nuevo = {
        ...datos,
        nombre,
        correo,
        ...(rut ? { rut } : {}),
        rol: accion.entrar ? "comprador" : datos.rol,
        activo: true,
        cuentaDemostracion: false,
      };
      return respuestaCorrecta({
        usuarios: [...estado.usuarios, nuevo],
        sesion: accion.entrar ? crearSesionDeUsuario(nuevo) : estado.sesion,
      });
    }
    case "PERFIL": {
      if (!usuario || accion.usuario.correo !== usuario.correo) {
        return respuestaConError("Inicia sesión para guardar tu perfil.");
      }
      const nombre = accion.usuario.nombre.trim();
      if (!nombre) {
        return respuestaConError("Ingresa tu nombre.");
      }
      const actualizado = { ...usuario, nombre };
      for (const campo of ["telefono", "direccion", "comuna", "region"]) {
        actualizado[campo] = String(accion.usuario[campo] || "").trim();
      }
      return respuestaCorrecta({
        usuarios: estado.usuarios.map((cuentaGuardada) =>
          cuentaGuardada.correo === usuario.correo
            ? actualizado
            : cuentaGuardada,
        ),
        sesion: crearSesionDeUsuario(actualizado),
      });
    }
    case "CLAVE": {
      const usuarioEncontrado = estado.usuarios.find(
        (cuentaGuardada) =>
          cuentaGuardada.correo === accion.correo.trim().toLowerCase() &&
          cuentaGuardada.contrasena === accion.actual &&
          cuentaGuardada.activo !== false,
      );
      if (
        !usuarioEncontrado ||
        usuarioEncontrado.cuentaDemostracion ||
        accion.nueva.length < 6
      ) {
        return respuestaConError(
          usuarioEncontrado?.cuentaDemostracion
            ? "Las cuentas de prueba mantienen sus contraseñas de demostración."
            : "No pudimos validar los datos o la contraseña nueva.",
        );
      }
      return respuestaCorrecta({
        usuarios: estado.usuarios.map((cuentaGuardada) =>
          cuentaGuardada.correo === usuarioEncontrado.correo
            ? { ...cuentaGuardada, contrasena: accion.nueva }
            : cuentaGuardada,
        ),
      });
    }
    // El carrito usa el stock actual y nunca admite más unidades de las disponibles.
    case "AGREGAR": {
      const productoCatalogo = estado.productos.find(
        (productoCatalogo) => productoCatalogo.id === accion.id,
      );
      const linea = estado.carrito.find(
        (productoCatalogo) => productoCatalogo.id === accion.id,
      );
      if (
        !productoCatalogo ||
        (linea?.cantidad || 0) >= productoCatalogo.stock
      ) {
        return respuestaConError(
          "No hay más stock disponible de este producto.",
        );
      }
      return respuestaCorrecta({
        carrito: linea
          ? estado.carrito.map((item) =>
              item.id === productoCatalogo.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item,
            )
          : [...estado.carrito, { ...productoCatalogo, cantidad: 1 }],
      });
    }
    case "CANTIDAD": {
      const productoCatalogo = estado.productos.find(
        (productoCatalogo) => productoCatalogo.id === accion.id,
      );
      if (!productoCatalogo || !productoCatalogo.stock) {
        return respuestaConError(
          "Este producto está agotado. Puedes quitarlo del carrito.",
        );
      }
      if (![-1, 1].includes(accion.cambio)) {
        return respuestaConError("Cantidad no válida.");
      }
      return respuestaCorrecta({
        carrito: estado.carrito.map((item) =>
          item.id === productoCatalogo.id
            ? {
                ...item,
                cantidad: Math.max(
                  1,
                  Math.min(
                    productoCatalogo.stock,
                    item.cantidad + accion.cambio,
                  ),
                ),
              }
            : item,
        ),
      });
    }
    case "QUITAR":
      return respuestaCorrecta({
        carrito: estado.carrito.filter((item) => item.id !== accion.id),
      });
    case "COMPRAR": {
      if (usuario?.rol !== "comprador" || !estado.carrito.length) {
        return respuestaConError(
          "Inicia sesión como comprador y agrega productos al carrito.",
        );
      }
      // Se revisan todas las líneas antes de descontar una sola unidad.
      const lineas = estado.carrito.map((item) => ({
        item,
        producto: estado.productos.find(
          (productoCatalogo) => productoCatalogo.id === item.id,
        ),
      }));
      if (
        lineas.some(
          ({ item, producto }) =>
            !producto || item.cantidad > producto.stock || item.cantidad < 1,
        )
      ) {
        return respuestaConError(
          "Revisa las cantidades: el stock disponible cambió.",
        );
      }
      // El pedido conserva una copia del nombre y precio vigentes al comprar.
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
        total: productosPedido.reduce(
          (importeAcumulado, productoCatalogo) =>
            importeAcumulado +
            productoCatalogo.precio * productoCatalogo.cantidad,
          0,
        ),
      };
      // Inventario, pedido nuevo y vaciado del carrito forman el mismo cambio.
      return respuestaCorrecta(
        {
          productos: estado.productos.map((productoCatalogo) => ({
            ...productoCatalogo,
            stock:
              productoCatalogo.stock -
              (estado.carrito.find((item) => item.id === productoCatalogo.id)
                ?.cantidad || 0),
          })),
          pedidos: [pedido, ...estado.pedidos],
          carrito: [],
        },
        pedido,
      );
    }
    // Administración del catálogo, usuarios, mensajes y pedidos.
    case "PRODUCTO_GUARDAR": {
      const datos = accion.producto;
      const nombre = datos.nombre.trim();
      const precio = Number(datos.precio);
      const stock = datos.stock ?? 10;
      const critico = datos.critico ?? 3;
      const anterior = estado.productos.find(
        (productoCatalogo) => productoCatalogo.id === datos.id,
      );
      if (
        !nombre ||
        !Number.isFinite(precio) ||
        precio <= 0 ||
        !esEnteroNoNegativo(stock) ||
        !esEnteroNoNegativo(critico) ||
        !categorias.includes(datos.categoria) ||
        !datos.descripcion.trim() ||
        !datos.detalle.trim() ||
        estado.productos.some(
          (productoCatalogo) =>
            productoCatalogo.id !== anterior?.id &&
            productoCatalogo.nombre.toLowerCase() === nombre.toLowerCase(),
        )
      ) {
        return respuestaConError(
          "Revisa el nombre, precio, stock y descripción del producto.",
        );
      }
      if (
        datos.imagen &&
        !/^data:image\/(png|jpeg|webp);base64,/.test(datos.imagen)
      ) {
        return respuestaConError("Elige una imagen JPG, PNG o WebP.");
      }
      if (
        datos.imagen &&
        Math.floor((datos.imagen.split(",")[1].length * 3) / 4) > 500000
      ) {
        return respuestaConError("La imagen no puede superar 500 KB.");
      }
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
      return respuestaCorrecta({
        productos: anterior
          ? estado.productos.map((productoCatalogo) =>
              productoCatalogo.id === anterior.id ? producto : productoCatalogo,
            )
          : [...estado.productos, producto],
      });
    }
    case "PRODUCTO_ELIMINAR":
      return respuestaCorrecta({
        productos: estado.productos.filter(
          (productoCatalogo) => productoCatalogo.id !== accion.id,
        ),
        carrito: estado.carrito.filter(
          (productoCatalogo) => productoCatalogo.id !== accion.id,
        ),
      });
    case "USUARIO_GUARDAR": {
      const anterior = estado.usuarios.find(
        (cuentaGuardada) => cuentaGuardada.correo === accion.usuario.correo,
      );
      const datos = accion.usuario;
      if (!anterior || anterior.cuentaDemostracion) {
        return respuestaConError(
          "Las cuentas de prueba no se pueden desactivar ni cambiar de rol.",
        );
      }
      if (!roles.includes(datos.rol) || typeof datos.activo !== "boolean") {
        return respuestaConError("Revisa el rol y estado de la cuenta.");
      }
      if (
        anterior.correo === usuario.correo &&
        (datos.rol !== "admin" || !datos.activo)
      ) {
        return respuestaConError(
          "No puedes desactivar tu cuenta de administrador ni quitarte ese rol.",
        );
      }
      return respuestaCorrecta({
        usuarios: estado.usuarios.map((cuentaGuardada) =>
          cuentaGuardada.correo === anterior.correo
            ? { ...cuentaGuardada, rol: datos.rol, activo: datos.activo }
            : cuentaGuardada,
        ),
      });
    }
    case "MENSAJE_ENVIAR": {
      if (!accion.mensaje.texto.trim()) {
        return respuestaConError("Escribe un mensaje antes de enviarlo.");
      }
      return respuestaCorrecta({
        mensajes: [{ ...accion.mensaje, estado: "Nuevo" }, ...estado.mensajes],
      });
    }
    case "MENSAJE_LEIDO":
      return respuestaCorrecta({
        mensajes: estado.mensajes.map((mensajeGuardado, indiceMensaje) =>
          indiceMensaje === accion.indice
            ? { ...mensajeGuardado, estado: "Leído" }
            : mensajeGuardado,
        ),
      });
    case "PEDIDO_ESTADO": {
      if (!estadosPedido.includes(accion.estado)) {
        return respuestaConError("El estado del pedido no es válido.");
      }
      return respuestaCorrecta({
        pedidos: estado.pedidos.map((pedidoGuardado) =>
          pedidoGuardado.id === accion.id
            ? { ...pedidoGuardado, estado: accion.estado }
            : pedidoGuardado,
        ),
      });
    }
    default:
      return respuestaConError("Acción no disponible.");
  }
}
