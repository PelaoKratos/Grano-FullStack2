function Encabezado({ pagina }) {
  let claseInicio = "nav-link";
  let claseProductos = "nav-link";

  if (pagina === "inicio") {
    claseInicio = "nav-link active";
  }

  if (pagina === "productos" || pagina === "producto") {
    claseProductos = "nav-link active";
  }

  return (
    <>
      <div className="franja text-center py-2">Café de especialidad, a tu ritmo.</div>
      <header className="border-bottom">
        {/* Uso las clases de Bootstrap para ordenar el menú cuando cambia el tamaño de pantalla. */}
        <div className="navbar container py-3 gap-3 flex-wrap navegacion-grano">
          <a className="navbar-brand marca" href="./">
            grano<span className="marca-sub">CAFÉ &amp; RITUALES</span>
          </a>
          <nav className="nav gap-1" aria-label="Navegación principal">
            <a className={claseInicio} href="./">Inicio</a>
            <a className={claseProductos} href="./productos.html">Nuestro café</a>
            <a className="nav-link" href="../nosotros.html">Nosotros</a>
            <a className="nav-link" href="../contacto.html">Contacto</a>
            <a className="nav-link enlace-login" href="../login.html">Iniciar sesión</a>
            <a className="nav-link enlace-carrito" href="../carrito.html">
              Carrito <span className="contador-carrito">0</span>
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Encabezado;
