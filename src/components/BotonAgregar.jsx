import Boton from "./Boton.jsx";
import Icono from "./Icono.jsx";

// Dejamos aquí el estado de agotado para no repetirlo en cada producto.
export default function BotonAgregar({
  producto,
  onAgregar,
  texto = "Añadir",
  conIcono = false,
}) {
  const agotado = producto.stock === 0;

  return (
    <Boton
      disabled={agotado}
      onClick={() => onAgregar(producto)}
      aria-label={
        agotado
          ? `${producto.nombre} agotado`
          : `Añadir ${producto.nombre} al carrito`
      }
    >
      {agotado ? "Agotado" : texto}
      {conIcono && (
        <>
          {" "}
          <Icono />
        </>
      )}
    </Boton>
  );
}
