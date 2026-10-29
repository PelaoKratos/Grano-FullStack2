import { useEffect, useRef, useState } from "react";
import {
  cargarEstado,
  guardarEstado,
  CLAVE_TIENDA,
} from "../datos/almacenamiento.js";
import { operar } from "../datos/operaciones.js";
import { productos as iniciales } from "../datos/productos.js";
import imagenNueva from "../assets/producto-nuevo.svg";
const storage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
export function useTienda() {
  const [estado, setEstado] = useState(() => cargarEstado(storage, iniciales));
  const referencia = useRef(estado),
    [error, setError] = useState("");
  function ejecutar(accion) {
    // Read persisted changes before validation, then save inventory, order and cart together.
    const actual = cargarEstado(storage, iniciales);
    const respuesta = operar(actual, accion);
    if (respuesta.resultado === false) {
      referencia.current = actual;
      setEstado(actual);
      setError(respuesta.mensaje);
      return false;
    }
    try {
      guardarEstado(storage, respuesta.estado);
    } catch {
      setError(
        "No pudimos guardar los cambios. Libera espacio en este navegador y vuelve a intentarlo.",
      );
      return false;
    }
    referencia.current = respuesta.estado;
    setEstado(respuesta.estado);
    setError("");
    return respuesta.resultado;
  }
  useEffect(() => {
    try {
      guardarEstado(storage, referencia.current);
    } catch {
      setError("El almacenamiento del navegador no está disponible.");
    }
    function sincronizar(event) {
      if (event.key === CLAVE_TIENDA) {
        const actual = cargarEstado(storage, iniciales);
        referencia.current = actual;
        setEstado(actual);
      }
    }
    window.addEventListener("storage", sincronizar);
    return () => window.removeEventListener("storage", sincronizar);
  }, []);
  const productos = estado.productos.map((p) => ({
    ...p,
    imagen: p.imagen || imagenNueva,
  }));
  const carrito = estado.carrito.map((item) => ({
    ...item,
    ...productos.find((p) => p.id === item.id),
    cantidad: item.cantidad,
  }));
  const guardarProducto = (producto) =>
    ejecutar({
      tipo: "PRODUCTO_GUARDAR",
      producto,
      idNuevo: `nuevo-${crypto.randomUUID()}`,
    });
  return {
    ...estado,
    productos,
    carrito,
    error,
    agregar: (producto) => ejecutar({ tipo: "AGREGAR", id: producto.id }),
    cambiarCantidad: (id, cambio) => ejecutar({ tipo: "CANTIDAD", id, cambio }),
    quitar: (id) => ejecutar({ tipo: "QUITAR", id }),
    comprar: () =>
      ejecutar({
        tipo: "COMPRAR",
        idPedido: `GR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        fecha: new Date().toLocaleDateString("es-CL"),
      }),
    iniciar: (correo, contrasena) =>
      ejecutar({ tipo: "INICIAR", correo, contrasena }),
    cerrar: () => ejecutar({ tipo: "CERRAR" }),
    registrar: (usuario, entrar = false) =>
      ejecutar({ tipo: "REGISTRAR", usuario, entrar }),
    cambiarClave: (correo, actual, nueva) =>
      ejecutar({ tipo: "CLAVE", correo, actual, nueva }),
    guardarPerfil: (usuario) => ejecutar({ tipo: "PERFIL", usuario }),
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
