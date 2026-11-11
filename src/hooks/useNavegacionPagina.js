import { useEffect, useRef } from "react";
import { articulos } from "../datos/articulos.js";

// Al navegar cambiamos el título y dejamos el teclado en el contenido.
export function useNavegacionPagina(rutaActual, productos) {
  const contenidoPrincipalRef = useRef(null);
  const esPrimeraRutaRef = useRef(true);

  // Actualiza el título, el desplazamiento y el foco al navegar entre
  // pantallas.
  useEffect(() => {
    const titulosPorRuta = {
      "/": "Inicio",
      "/productos": "Nuestro café",
      "/carrito": "Carrito",
      "/acceso": "Iniciar sesión",
      "/registro": "Crear cuenta",
      "/cambiar-clave": "Cambiar contraseña",
      "/vendedor": "Productos y pedidos",
      "/cuenta": "Mi cuenta",
      "/admin": "Administración",
      "/contacto": "Contacto",
      "/nosotros": "Nosotros",
      "/checkout": "Finalizar compra",
      "/categorias": "Categorías",
      "/ofertas": "Ofertas",
      "/blog": "Historias del café",
      "/compra/error": "Resultado de compra",
    };
    let tituloPagina = titulosPorRuta[rutaActual];

    if (rutaActual.startsWith("/admin/")) {
      tituloPagina = "Administración";
    }
    if (rutaActual.startsWith("/compra/confirmada/")) {
      tituloPagina = "Pedido registrado";
    }

    if (!tituloPagina) {
      const productoActual = productos.find(
        (productoCatalogo) => rutaActual === `/producto/${productoCatalogo.id}`,
      );
      const articuloActual = articulos.find(
        (articulo) => rutaActual === `/blog/${articulo.slug}`,
      );
      tituloPagina =
        productoActual?.nombre ||
        articuloActual?.titulo ||
        "Página no encontrada";
    }

    document.title = `${tituloPagina} | Grano`;
    if (esPrimeraRutaRef.current) {
      esPrimeraRutaRef.current = false;
      return;
    }
    // Al cambiar de pantalla, el teclado continúa desde el contenido principal.
    window.scrollTo({ top: 0, behavior: "instant" });
    contenidoPrincipalRef.current?.focus({ preventScroll: true });
  }, [rutaActual]);

  return contenidoPrincipalRef;
}
