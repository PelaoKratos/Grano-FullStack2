import { useEffect, useState } from "react";
import Icono from "./Icono.jsx";
import { navegar } from "../hooks/useRuta.js";
export function Header({ path, sesion, cantidad, onCerrar }) {
  const [abierto, setAbierto] = useState(false);
  useEffect(() => setAbierto(false), [path]);
  useEffect(() => {
    function escape(e) {
      if (
        e.key === "Escape" &&
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
          <a className="marca" href="#/" aria-label="Grano, inicio">
            grano<span className="marca-sub">CAFÉ &amp; RITUALES</span>
          </a>
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
            onClick={(event) => {
              if (event.target.closest("a")) setAbierto(false);
            }}
          >
            {[
              ["/", "Inicio"],
              ["/productos", "Nuestro café"],
              ["/nosotros", "Nosotros"],
              ["/contacto", "Contacto"],
            ].map(([ruta, texto]) => (
              <a
                key={ruta}
                className={`nav-link ${path === ruta || (ruta === "/productos" && path.startsWith("/producto/")) ? "active" : ""}`}
                href={`#${ruta}`}
                aria-current={path === ruta ? "page" : undefined}
              >
                {texto}
              </a>
            ))}
            {sesion ? (
              <div className="cuenta-activa">
                <a
                  className="nombre-cuenta"
                  href={
                    sesion.rol === "admin"
                      ? "#/admin"
                      : sesion.rol === "vendedor"
                        ? "#/vendedor"
                        : "#/cuenta"
                  }
                >
                  {sesion.rol === "admin"
                    ? "Administración"
                    : sesion.rol === "vendedor"
                      ? "Panel de vendedor"
                      : sesion.nombre}
                </a>
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
              <a className="nav-link enlace-login" href="#/acceso">
                Iniciar sesión
              </a>
            )}
          </nav>
          <a
            className="enlace-carrito"
            href="#/carrito"
            aria-label={`Ver carrito, ${cantidad} ${cantidad === 1 ? "producto" : "productos"}`}
          >
            <Icono tipo="bolsa" />
            <span>Carrito</span>
            <span className="contador-carrito">{cantidad}</span>
          </a>
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
          <a className="marca" href="#/">
            grano<span className="marca-sub">CAFÉ &amp; RITUALES</span>
          </a>
          <p>
            Una buena taza empieza
            <br />
            con una pausa.
          </p>
        </div>
        <div className="pie-enlaces">
          <p>Encuentra tu ritual.</p>
          <a href="#/productos">
            Nuestro café <Icono />
          </a>
          <a href="#/productos?categoria=metodos">
            Métodos de preparación <Icono />
          </a>
          <a href="#/productos?categoria=accesorios">
            Accesorios <Icono />
          </a>
        </div>
        <div className="pie-enlaces">
          <p>Hablemos de café.</p>
          <a href="#/nosotros">
            Conoce Grano <Icono />
          </a>
          <a href="#/contacto">
            Contacto <Icono />
          </a>
          <a href="#/acceso">
            Tu cuenta <Icono />
          </a>
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
