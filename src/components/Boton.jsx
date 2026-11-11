// Así usamos el mismo botón en los formularios y en las demás pantallas.
const estilos = {
  principal: "btn btn-success",
  secundario: "btn btn-outline-success boton-secundario",
  control: "",
};

export default function Boton({
  children,
  type = "button",
  variante = "principal",
  className = "",
  ...propiedades
}) {
  return (
    <button
      type={type}
      className={`${estilos[variante] ?? estilos.principal} ${className}`.trim()}
      {...propiedades}
    >
      {children}
    </button>
  );
}
