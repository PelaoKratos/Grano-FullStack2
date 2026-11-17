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
  // El modo API tiene su propia copia de sesión y carrito. La demostración local queda intacta.
  const clave = apiUrl ? "grano-tienda-api-v1" : CLAVE_TIENDA;
  const storage = useMemo(
    () =>
      apiUrl
        ? {
            getItem: (nombre) =>
              nombre === CLAVE_TIENDA ? almacenamiento.getItem(clave) : null,
            setItem: (_, valor) => almacenamiento.setItem(clave, valor),
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
    return guardado;
  }

  // Aplica las reglas de la tienda y actualiza la pantalla cuando se confirma
  // el guardado.
  function ejecutar(accion) {
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
      guardarEstado(storage, estadoActualRef.current);
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

  const productos = (apiUrl ? catalogo.productos : estado.productos).map(
    (producto) => ({
      ...producto,
      imagen: producto.imagen || imagenDeRespaldo,
    }),
  );

  const carrito = estado.carrito
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

  // Las pantallas reciben datos y funciones; no necesitan escribir localStorage.
  return {
    ...estado,
    productos,
    carrito,
    error,
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
      ejecutar({ tipo: "INICIAR", correo, contrasena }),
    cerrar: () => ejecutar({ tipo: "CERRAR" }),
    registrar: (usuario, entrar = false) =>
      ejecutar({ tipo: "REGISTRAR", usuario, entrar }),
    cambiarClave: (correo, actual, nueva) =>
      ejecutar({ tipo: "CLAVE", correo, actual, nueva }),
    guardarPerfil: (usuario) => ejecutar({ tipo: "PERFIL", usuario }),

    // Contacto y operaciones de administración.
    enviar: (mensaje) => ejecutar({ tipo: "MENSAJE_ENVIAR", mensaje }),
    guardarProducto,
    crearProducto: guardarProducto,
    quitarProducto,
    guardarUsuario: (usuario) => ejecutar({ tipo: "USUARIO_GUARDAR", usuario }),
    guardarCategoria: (anterior, nombre) =>
      ejecutar({ tipo: "CATEGORIA_GUARDAR", anterior, nombre }),
    quitarCategoria: (nombre) =>
      ejecutar({ tipo: "CATEGORIA_ELIMINAR", nombre }),
    marcarMensaje: (indice) => ejecutar({ tipo: "MENSAJE_LEIDO", indice }),
    cambiarEstadoPedido: (id, estado) =>
      ejecutar({ tipo: "PEDIDO_ESTADO", id, estado }),
  };
}
