import { useEffect, useRef, useState } from "react";
import {
  cargarEstado,
  guardarEstado,
  CLAVE_TIENDA,
} from "../datos/almacenamiento.js";
import { operar } from "../datos/operaciones.js";
import { productos as productosIniciales } from "../datos/productos.js";
import imagenDeRespaldo from "../assets/ritual-grano.png";

// Este adaptador permite reutilizar las funciones de almacenamiento en las pruebas.
const almacenamiento = {
  getItem: (clave) => window.localStorage.getItem(clave),
  setItem: (clave, valor) => window.localStorage.setItem(clave, valor),
};

// El hook conecta las reglas de la tienda, el almacenamiento y las pantallas React.
export function useTienda() {
  const [estado, setEstado] = useState(() =>
    cargarEstado(almacenamiento, productosIniciales),
  );
  const estadoActualRef = useRef(estado);
  const [error, setError] = useState("");

  function ejecutar(accion) {
    // Se vuelve a leer el navegador por si otra pestaña cambió el stock o la sesión.
    const estadoGuardado = cargarEstado(almacenamiento, productosIniciales);
    const respuesta = operar(estadoGuardado, accion);

    if (respuesta.resultado === false) {
      estadoActualRef.current = estadoGuardado;
      setEstado(estadoGuardado);
      setError(respuesta.mensaje);
      return false;
    }

    try {
      // Se guarda el estado completo: inventario, pedido y carrito van juntos.
      guardarEstado(almacenamiento, respuesta.estado);
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
      guardarEstado(almacenamiento, estadoActualRef.current);
    } catch {
      setError("El almacenamiento del navegador no está disponible.");
    }

    function sincronizar(evento) {
      if (evento.key === CLAVE_TIENDA) {
        const estadoGuardado = cargarEstado(almacenamiento, productosIniciales);
        estadoActualRef.current = estadoGuardado;
        setEstado(estadoGuardado);
      }
    }

    // El evento storage permite recibir cambios hechos en otras pestañas.
    window.addEventListener("storage", sincronizar);
    return () => window.removeEventListener("storage", sincronizar);
  }, []);

  const productos = estado.productos.map((producto) => ({
    ...producto,
    imagen: producto.imagen || imagenDeRespaldo,
  }));

  const carrito = estado.carrito.map((lineaCarrito) => ({
    ...lineaCarrito,
    ...productos.find((producto) => producto.id === lineaCarrito.id),
    cantidad: lineaCarrito.cantidad,
  }));

  function guardarProducto(producto) {
    return ejecutar({
      tipo: "PRODUCTO_GUARDAR",
      producto,
      idNuevo: `nuevo-${crypto.randomUUID()}`,
    });
  }

  function comprar() {
    return ejecutar({
      tipo: "COMPRAR",
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
    quitarProducto: (id) => ejecutar({ tipo: "PRODUCTO_ELIMINAR", id }),
    guardarUsuario: (usuario) => ejecutar({ tipo: "USUARIO_GUARDAR", usuario }),
    marcarMensaje: (indice) => ejecutar({ tipo: "MENSAJE_LEIDO", indice }),
    cambiarEstadoPedido: (id, estado) =>
      ejecutar({ tipo: "PEDIDO_ESTADO", id, estado }),
  };
}
