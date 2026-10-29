import imagenOrigenes from "../assets/origenes.svg";
import imagenHero from "../assets/hero.svg";
import imagenColombia from "../assets/colombia.svg";
import { useState } from "react";
import Icono from "./Icono.jsx";

function Nosotros() {
  const [actual, setActual] = useState(0);
  const imagenes = [imagenOrigenes, imagenHero, imagenColombia];
  return (
    <section className="nosotros">
      <h1>Somos Grano.</h1>

      <div className="contenido-nosotros">
        <div
          className="carrusel-react"
          aria-roledescription="carrusel"
          aria-label="Nuestros cafés"
        >
          <img
            src={imagenes[actual]}
            alt={
              actual === 2
                ? "Origen Colombia"
                : "Bolsas de café Grano de distintos orígenes"
            }
          />
          <button
            className="control-carrusel control-anterior"
            type="button"
            aria-label="Imagen anterior"
            onClick={() => setActual((actual + 2) % 3)}
          >
            <span
              style={{ display: "inline-flex", transform: "rotate(180deg)" }}
            >
              <Icono />
            </span>
          </button>
          <button
            className="control-carrusel control-siguiente"
            type="button"
            aria-label="Imagen siguiente"
            onClick={() => setActual((actual + 1) % 3)}
          >
            <Icono />
          </button>
          <span className="visually-hidden" role="status">
            Imagen {actual + 1} de 3
          </span>
        </div>
        <div>
          <h2>El café como una pausa.</h2>
          <p>
            En Grano reunimos cafés de distintos orígenes y accesorios sencillos
            para quienes disfrutan preparar una taza en casa. Queremos que
            encontrar tu café favorito sea parte de un momento agradable del
            día.
          </p>
          <p>
            Nos gustan los sabores que invitan a probar algo distinto y los
            métodos fáciles de incorporar a la rutina. Por eso nuestra colección
            combina café en grano, utensilios de preparación y tazas para
            acompañar cada pausa.
          </p>
          <a className="btn btn-outline-success" href="#/contacto">
            Conversemos
          </a>
        </div>
      </div>
    </section>
  );
}

export default Nosotros;
