import imagenHero from "../assets/hero.svg";

function Inicio() {
  return (
    <>
      <section className="presentacion">
        <div>
          <p className="etiqueta">CAFÉ &amp; RITUALES</p>
          <h1>Tu día empieza con un buen café.</h1>
          <p>Cafés de origen y pequeños detalles para disfrutar sin apuro. Encuentra tu próxima taza favorita.</p>
          <a className="boton-enlace" href="#productos">Conoce nuestro café ↗</a>
        </div>
        <img src={imagenHero} alt="Bolsas de café Grano junto a una taza" />
      </section>
      <section className="inicio-destacados">
        <p className="etiqueta">CONOCE GRANO</p>
        <h2>Hay una historia detrás de cada taza.</h2>
        <a className="boton-enlace" href="#nosotros">Sobre nosotros</a>
      </section>
    </>
  );
}

export default Inicio;
