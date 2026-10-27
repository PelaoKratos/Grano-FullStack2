function Navbar({ sesion, cantidad, onSalir }) {
  return (
    <header className="encabezado">
      <a className="marca" href="#inicio">
        grano
        <span className="marca-sub">CAFÉ &amp; RITUALES</span>
      </a>
      <nav aria-label="Navegación principal">
        <a className="enlace-menu" href="#inicio">Inicio</a>
        <a className="enlace-menu" href="#productos">Nuestro café</a>
        <a className="enlace-menu" href="#nosotros">Nosotros</a>
        <a className="enlace-menu" href="#contacto">Contacto</a>
        {sesion ? (
          <>
            <a className="enlace-menu" href={sesion.rol === "admin" ? "#admin" : "#cuenta"}>
              {sesion.rol === "admin" ? "Administración" : "Mi cuenta"}
            </a>
            <button className="enlace-menu" type="button" onClick={onSalir}>Salir</button>
          </>
        ) : (
          <a className="enlace-menu" href="#login">Iniciar sesión</a>
        )}
        <a className="boton-carrito boton-enlace" href="#carrito">Carrito ({cantidad})</a>
      </nav>
    </header>
  );
}

export default Navbar;
