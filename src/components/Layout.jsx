import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Icono from "./Icono.jsx";
export function Header({ path: rutaActual, sesion, cantidad, onCerrar }) {
  const navegar = useNavigate();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => setAbierto(false), [rutaActual]);
  useEffect(() => {
    function escape(evento) {
      if (
        evento.key === "Escape" &&
        document
          .querySelector(".menu-toggle")
          ?.getAttribute("aria-expanded") === "true"
      ) {
        setAbierto(false);
        document.querySelector(".menu-toggle")?.focus();
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  return (
    <>
      <div className="franja text-center py-2">
        Café de especialidad, a tu ritmo.
      </div>
      <header className="cabecera-grano">
        <div className="container barra-grano">
          <Link className="marca" to="/" aria-label="Grano, inicio">
            grano<span className="marca-sub">CAFÉ &amp; RITUALES</span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-controls="menu-principal"
            aria-expanded={abierto}
            onClick={() => setAbierto(!abierto)}
          >
            <Icono tipo="menu" />
            <span>Menú</span>
          </button>
          <nav
            id="menu-principal"
            className={`nav-grano ${abierto ? "menu-abierto" : ""}`}
            aria-label="Navegación principal"
            onClick={(evento) => {
              if (evento.target.closest("a")) {
                setAbierto(false);
              }
            }}
          >
            {[
              ["/", "Inicio"],
              ["/productos", "Nuestro café"],
              ["/nosotros", "Nosotros"],
              ["/contacto", "Contacto"],
            ].map(([ruta, texto]) => (
              <Link
                key={ruta}
                className={`nav-link ${rutaActual === ruta || (ruta === "/productos" && rutaActual.startsWith("/producto/")) ? "active" : ""}`}
                to={ruta}
                aria-current={rutaActual === ruta ? "page" : undefined}
              >
                {texto}
              </Link>
            ))}
            {sesion ? (
              <div className="cuenta-activa">
                <Link
                  className="nombre-cuenta"
                  to={
                    sesion.rol === "admin"
                      ? "/admin"
                      : sesion.rol === "vendedor"
                        ? "/vendedor"
                        : "/cuenta"
                  }
                >
                  {sesion.rol === "admin"
                    ? "Administración"
                    : sesion.rol === "vendedor"
                      ? "Panel de vendedor"
                      : sesion.nombre}
                </Link>
                <button
                  className="cerrar-sesion"
                  onClick={() => {
                    if (onCerrar()) {
                      setAbierto(false);
                      navegar("/");
                    }
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link className="nav-link enlace-login" to="/acceso">
                Iniciar sesión
              </Link>
            )}
          </nav>
          <Link
            className="enlace-carrito"
            to="/carrito"
            aria-label={`Ver carrito, ${cantidad} ${cantidad === 1 ? "producto" : "productos"}`}
          >
            <Icono tipo="bolsa" />
            <span>Carrito</span>
            <span className="contador-carrito">{cantidad}</span>
          </Link>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="pie">
      <div className="container pie-principal">
        <div>
          <Link className="marca" to="/">
            grano<span className="marca-sub">CAFÉ &amp; RITUALES</span>
          </Link>
          <p>
            Una buena taza empieza
            <br />
            con una pausa.
          </p>
        </div>
        <div className="pie-enlaces">
          <p>Encuentra tu ritual.</p>
          <Link to="/productos">
            Nuestro café <Icono />
          </Link>
          <Link to="/productos?categoria=metodos">
            Métodos de preparación <Icono />
          </Link>
          <Link to="/productos?categoria=accesorios">
            Accesorios <Icono />
          </Link>
        </div>
        <div className="pie-enlaces">
          <p>Hablemos de café.</p>
          <Link to="/nosotros">
            Conoce Grano <Icono />
          </Link>
          <Link to="/contacto">
            Contacto <Icono />
          </Link>
          <Link to="/acceso">
            Tu cuenta <Icono />
          </Link>
          <a href="mailto:contacto@grano.cl">contacto@grano.cl</a>
          <a href="tel:+56912345678">+56 9 1234 5678</a>
          <span>Lunes a viernes, 9:00–18:00</span>
        </div>
      </div>
      <div className="container pie-final">
        <span>Grano · Café y rituales</span>
        <span>Hecho para disfrutar sin apuro.</span>
      </div>
    </footer>
  );
}
