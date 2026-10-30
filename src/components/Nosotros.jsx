import imagenRitual from "../assets/ritual-grano.png";
import imagenTaza from "../assets/fotografia/taza.webp";
import imagenColombia from "../assets/fotografia/colombia.webp";
import { useState } from "react";
import Icono from "./Icono.jsx";

function Nosotros() {
  const [actual, setActual] = useState(0);
  const imagenes = [
    {
      src: imagenRitual,
      alt: "Café recién preparado junto a una bolsa Grano sobre madera y lino verde",
      width: 1536,
      height: 1024,
    },
    {
      src: imagenTaza,
      alt: "Taza de cerámica color arena sobre una mesa de madera junto a un paño verde",
      width: 1200,
      height: 1200,
    },
    {
      src: imagenColombia,
      alt: "Bolsa de café Origen Colombia de Grano en papel kraft con etiqueta crema",
      width: 1200,
      height: 1200,
    },
  ];
  const imagen = imagenes[actual];
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
            src={imagen.src}
            alt={imagen.alt}
            width={imagen.width}
            height={imagen.height}
            decoding="async"
          />
          <button
            className="control-carrusel control-anterior"
            type="button"
            aria-label="Imagen anterior"
            onClick={() =>
              setActual((actual + imagenes.length - 1) % imagenes.length)
            }
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
            onClick={() => setActual((actual + 1) % imagenes.length)}
          >
            <Icono />
          </button>
          <span className="visually-hidden" role="status">
            Imagen {actual + 1} de {imagenes.length}
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
