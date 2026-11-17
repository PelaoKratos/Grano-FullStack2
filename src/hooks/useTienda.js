import { useEffect, useMemo, useRef, useState } from "react";
import {
  cargarEstado,
  guardarEstado,
  CLAVE_TIENDA,
  normalizarCarrito,
} from "../datos/almacenamiento.js";
import { operar } from "../datos/operaciones.js";
import { productos as productosIniciales } from "../datos/productos.js";
import imagenDeRespaldo from "../assets/ritual-grano.png";
import { useCatalogoApi } from "./useCatalogoApi.js";
import { useSesionApi } from "./useSesionApi.js";
import { obtenerCategorias } from "../datos/categorias.js";

// Este adaptador permite reutilizar las funciones de almacenamiento en las pruebas.
const almacenamiento = {
  getItem: (clave) => window.localStorage.getItem(clave),
  setItem: (clave, valor) => window.localStorage.setItem(clave, valor),
};

// El hook conecta las reglas de la tienda, el almacenamiento y las pantallas React.
export function useTienda({
  apiUrl = import.meta.env.VITE_API_URL || "",
} = {}) {
  const catalogo = useCatalogoApi(apiUrl);
  const cuentas = useSesionApi(apiUrl);
  // El modo API tiene su propia copia de sesión y carrito. La demostración local queda intacta.
  const clave = apiUrl ? "grano-tienda-api-v1" : CLAVE_TIENDA;
  const storage = useMemo(
    () =>
      apiUrl
        ? {
            getItem: (nombre) =>
              nombre === CLAVE_TIENDA ? almacenamiento.getItem(clave) : null,
            setItem: (_, valor) => {
              // Los usuarios y sus contraseñas pertenecen al servidor.
              const datos = JSON.parse(valor);
              almacenamiento.setItem(
                clave,
                JSON.stringify({ ...datos, usuarios: [] }),
              );
            },
          }
        : almacenamiento,
    [apiUrl, clave],
  );
  const [estado, setEstado] = useState(() =>
    cargarEstado(storage, apiUrl ? [] : productosIniciales),
  );
  const estadoActualRef = useRef(estado);
  const [error, setError] = useState("");

  function leerEstado() {
    const guardado = cargarEstado(storage, apiUrl ? [] : productosIniciales);
    if (apiUrl && catalogo.disponible) {
      guardado.productos = catalogo.productos;
      guardado.carrito = normalizarCarrito(
        guardado.carrito,
        catalogo.productos,
      ).filter((linea) =>
        catalogo.productos.some((producto) => producto.id === linea.id),
      );
      guardado.categorias = obtenerCategorias(guardado);
    }
    if (apiUrl) {
      guardado.usuarios = cuentas.usuarios;
      guardado.sesion = cuentas.usuario;
    }
    return guardado;
  }

  // Aplica las reglas de la tienda y actualiza la pantalla cuando se confirma
  // el guardado.
  function ejecutar(accion) {
    if (
      apiUrl &&
      !cuentas.verificada &&
      ["AGREGAR", "CANTIDAD", "QUITAR"].includes(accion.tipo)
    ) {
      setError("Primero comprueba la conexión y la sesión con el servidor.");
      return false;
    }
    // Se vuelve a leer el navegador por si otra pestaña cambió el stock o la sesión.
    if (
      apiUrl &&
      ["AGREGAR", "CANTIDAD"].includes(accion.tipo) &&
      (catalogo.cargando || catalogo.error)
    ) {
      setError(
        "Espera a que el catálogo se conecte antes de realizar cambios.",
      );
      return false;
    }
    if (
      apiUrl &&
      ["COMPRAR", "CATEGORIA_GUARDAR", "CATEGORIA_ELIMINAR"].includes(
        accion.tipo,
      )
    ) {
      setError(
        "Los pedidos y la gestión de categorías del servidor se conectarán en la siguiente etapa.",
      );
      return false;
    }
    const estadoGuardado = leerEstado();
    const respuesta = operar(estadoGuardado, accion);

    if (respuesta.resultado === false) {
      estadoActualRef.current = estadoGuardado;
      setEstado(estadoGuardado);
      setError(respuesta.mensaje);
      return false;
    }

    try {
      // Se guarda el estado completo: inventario, pedido y carrito van juntos.
      guardarEstado(storage, respuesta.estado);
    } catch {
      setError(
        "No pudimos guardar los cambios. Libera espacio en este navegador y vuelve a intentarlo.",
      );
      return false;
    }

    // La pantalla solo muestra el cambio después de haberlo guardado con éxito.
    estadoActualRef.current = respuesta.estado;
    setEstado(respuesta.estado);
    setError("");
    return respuesta.resultado;
  }

  useEffect(() => {
    // En el primer montaje se conserva también cualquier dato recién migrado.
    try {
      if (!apiUrl) guardarEstado(storage, estadoActualRef.current);
      else {
        const anterior = almacenamiento.getItem(clave);
        if (anterior) storage.setItem(CLAVE_TIENDA, anterior);
      }
    } catch {
      setError("El almacenamiento del navegador no está disponible.");
    }

    // Recarga el estado de Grano si otra pestaña modifica la clave de la
    // tienda.
    function sincronizar(evento) {
      if (evento.key === clave) {
        const estadoGuardado = cargarEstado(
          storage,
          apiUrl ? [] : productosIniciales,
        );
        estadoActualRef.current = estadoGuardado;
        setEstado(estadoGuardado);
      }
    }

    // El evento storage permite recibir cambios hechos en otras pestañas.
    window.addEventListener("storage", sincronizar);
    return () => window.removeEventListener("storage", sincronizar);
  }, [storage, clave, apiUrl]);

  useEffect(() => {
    if (!apiUrl || !cuentas.verificada) return;
    // Conservamos el carrito del dueño de la sesión y lo vaciamos al salir o cambiar de cuenta.
    let anterior;
    try {
      anterior = JSON.parse(almacenamiento.getItem(clave));
    } catch {
      anterior = null;
    }
    const guardado = cargarEstado(storage, []);
    if (
      anterior?.sesion?.correo &&
      anterior.sesion.correo !== cuentas.usuario?.correo
    )
      guardado.carrito = [];
    guardado.sesion = cuentas.usuario;
    guardado.usuarios = cuentas.usuarios;
    try {
      guardarEstado(storage, guardado);
    } catch {
      setError("No pudimos guardar el carrito en este navegador.");
    }
    estadoActualRef.current = guardado;
    setEstado(guardado);
  }, [apiUrl, cuentas.usuario, cuentas.verificada, clave, storage]);

  const productos = (apiUrl ? catalogo.productos : estado.productos).map(
    (producto) => ({
      ...producto,
      imagen: producto.imagen || imagenDeRespaldo,
    }),
  );

  const carrito = (apiUrl && !cuentas.verificada ? [] : estado.carrito)
    .filter((linea) => productos.some((producto) => producto.id === linea.id))
    .map((lineaCarrito) => ({
      ...lineaCarrito,
      ...productos.find((producto) => producto.id === lineaCarrito.id),
      cantidad: lineaCarrito.cantidad,
    }));

  // Envía los datos del catálogo y proporciona un identificador para los
  // productos nuevos.
  function guardarProducto(producto) {
    if (apiUrl) {
      // Usamos las mismas reglas del formulario antes de enviar. El ID final lo crea Java.
      const idNuevo = "pendiente-api";
      const respuesta = operar(leerEstado(), {
        tipo: "PRODUCTO_GUARDAR",
        producto,
        idNuevo,
      });
      if (respuesta.resultado === false) {
        setError(respuesta.mensaje);
        return Promise.resolve(false);
      }
      const preparado = respuesta.estado.productos.find(
        (item) => item.id === (producto.id || idNuevo),
      );
      setError("");
      return catalogo.guardar({ ...preparado, id: producto.id });
    }
    return ejecutar({
      tipo: "PRODUCTO_GUARDAR",
      producto,
      idNuevo: `nuevo-${crypto.randomUUID()}`,
    });
  }

  function quitarProducto(id) {
    if (!apiUrl) return ejecutar({ tipo: "PRODUCTO_ELIMINAR", id });
    const respuesta = operar(leerEstado(), { tipo: "PRODUCTO_ELIMINAR", id });
    if (respuesta.resultado === false) {
      setError(respuesta.mensaje);
      return Promise.resolve(false);
    }
    setError("");
    return catalogo.eliminar(id);
  }

  // Envía la compra a las reglas de la tienda con un identificador de pedido y
  // la fecha local.
  function comprar(entrega, resultadoPago = "aprobado") {
    return ejecutar({
      tipo: "COMPRAR",
      entrega,
      resultadoPago,
      idPedido: `GR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      fecha: new Date().toLocaleDateString("es-CL"),
    });
  }

  function usarCuenta(accion, ...datos) {
    setError("");
    return accion(...datos);
  }

  // Las pantallas reciben datos y funciones; no necesitan escribir localStorage.
  return {
    ...estado,
    sesion: apiUrl ? cuentas.usuario : estado.sesion,
    usuarios: apiUrl ? cuentas.usuarios : estado.usuarios,
    productos,
    carrito,
    error: error || cuentas.error,
    cargandoSesion: cuentas.cargando,
    errorSesion: cuentas.error,
    recargarSesion: cuentas.recargar,
    categorias: apiUrl
      ? obtenerCategorias({ ...estado, productos })
      : estado.categorias,
    usarApi: Boolean(apiUrl),
    cargandoProductos: catalogo.cargando,
    errorProductos: catalogo.error,
    recargarProductos: catalogo.recargar,

    // Acciones del carrito y la compra.
    agregar: (producto) => ejecutar({ tipo: "AGREGAR", id: producto.id }),
    cambiarCantidad: (id, cambio) => ejecutar({ tipo: "CANTIDAD", id, cambio }),
    quitar: (id) => ejecutar({ tipo: "QUITAR", id }),
    comprar,

    // Acceso, registro y datos personales.
    iniciar: (correo, contrasena) =>
      apiUrl
        ? usarCuenta(cuentas.iniciar, correo, contrasena)
        : ejecutar({ tipo: "INICIAR", correo, contrasena }),
    cerrar: () =>
      apiUrl ? usarCuenta(cuentas.cerrar) : ejecutar({ tipo: "CERRAR" }),
    registrar: (usuario, entrar = false) =>
      apiUrl
        ? usarCuenta(cuentas.registrar, usuario, entrar)
        : ejecutar({ tipo: "REGISTRAR", usuario, entrar }),
    cambiarClave: (correo, actual, nueva) =>
      apiUrl
        ? usarCuenta(cuentas.clave, correo, actual, nueva)
        : ejecutar({ tipo: "CLAVE", correo, actual, nueva }),
    guardarPerfil: (usuario) =>
      apiUrl
        ? usarCuenta(cuentas.perfil, usuario)
        : ejecutar({ tipo: "PERFIL", usuario }),

    // Contacto y operaciones de administración.
    enviar: (mensaje) => ejecutar({ tipo: "MENSAJE_ENVIAR", mensaje }),
    guardarProducto,
    crearProducto: guardarProducto,
    quitarProducto,
    guardarUsuario: (usuario) =>
      apiUrl
        ? usarCuenta(cuentas.editar, usuario)
        : ejecutar({ tipo: "USUARIO_GUARDAR", usuario }),
    guardarCategoria: (anterior, nombre) =>
      ejecutar({ tipo: "CATEGORIA_GUARDAR", anterior, nombre }),
    quitarCategoria: (nombre) =>
      ejecutar({ tipo: "CATEGORIA_ELIMINAR", nombre }),
    marcarMensaje: (indice) => ejecutar({ tipo: "MENSAJE_LEIDO", indice }),
    cambiarEstadoPedido: (id, estado) =>
      ejecutar({ tipo: "PEDIDO_ESTADO", id, estado }),
  };
}
