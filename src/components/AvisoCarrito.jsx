import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Mostramos el aviso unos segundos sin interrumpir a quien usa el teclado.
export default function AvisoCarrito({ aviso, onOcultar }) {
  const avisoRef = useRef(null);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => {
      if (!avisoRef.current?.contains(document.activeElement)) onOcultar();
    }, 5500);
    return () => clearTimeout(temporizador);
  }, [aviso, onOcultar]);

  return (
    <div
      ref={avisoRef}
      className="aviso-carrito"
      hidden={!aviso}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {aviso}{" "}
      <Link to="/carrito" onClick={onOcultar}>
        Ver carrito
      </Link>
    </div>
  );
}
