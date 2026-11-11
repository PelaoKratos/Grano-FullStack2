import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { totalCarrito } from "../datos/almacenamiento.js";

// Aquí reunimos las acciones que cambian de pantalla o muestran un aviso.
export function useAccionesTienda(tienda) {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const [aviso, setAviso] = useState("");
  const [mensajeCompra, setMensajeCompra] = useState("");

  // Pide agregar una unidad al carrito y muestra el aviso solo si se guardó.
  function agregarProducto(producto) {
    if (tienda.agregar(producto)) {
      setAviso(`${producto.nombre} añadido.`);
      setMensajeCompra("");
    }
  }
  // Inicia sesión y elige la pantalla de destino según el rol del usuario.
  function iniciarSesion(correo, clave) {
    const usuario = tienda.iniciar(correo, clave);
    if (!usuario) {
      return usuario;
    }

    // Cada perfil entra a su panel; el comprador puede volver al carrito.
    let rutaDestino = "/cuenta";
    if (usuario.rol === "admin") {
      rutaDestino = "/admin";
    } else if (usuario.rol === "vendedor") {
      rutaDestino = "/vendedor";
    } else if (parametros.get("destino") === "carrito") {
      rutaDestino = "/carrito";
    }

    navegar(rutaDestino);
    return usuario;
  }

  // Abre la sesión nueva y conserva el destino solicitado antes del registro.
  function registrarComprador(usuario) {
    if (!tienda.registrar(usuario, true)) {
      return false;
    }
    navegar(parametros.get("destino") === "carrito" ? "/carrito" : "/cuenta");
    return true;
  }
  // Intenta registrar el pedido y dirige al comprobante o al resumen del
  // intento fallido.
  function realizarCompra(entrega, resultadoPago) {
    const resumen = {
      productos: tienda.carrito.map((producto) => ({ ...producto })),
      total: totalCarrito(tienda.carrito),
      entrega,
    };
    const pedido = tienda.comprar(entrega, resultadoPago);
    if (pedido) {
      setMensajeCompra(
        `Pedido ${pedido.id} registrado. Gracias por tu compra.`,
      );
      navegar(`/compra/confirmada/${pedido.id}`);
    } else {
      navegar("/compra/error", {
        state: {
          resumen,
          mensaje:
            resultadoPago === "rechazado"
              ? "El pago de demostración fue rechazado. Tu carrito y el stock se conservan."
              : "No pudimos registrar el pedido. Revisa el stock, los datos y el espacio disponible del navegador.",
        },
      });
    }
    return pedido;
  }

  // Pide cerrar la sesión y limpia los avisos de compra cuando la operación se
  // guarda.
  function cerrarSesion() {
    const cerrado = tienda.cerrar();
    if (cerrado) {
      setAviso("");
      setMensajeCompra("");
    }
    return cerrado;
  }

  return {
    aviso,
    mensajeCompra,
    agregarProducto,
    iniciarSesion,
    registrarComprador,
    realizarCompra,
    cerrarSesion,
    ocultarAviso: () => setAviso(""),
  };
}
