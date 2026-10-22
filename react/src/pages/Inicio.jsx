import TarjetaProducto from "../components/TarjetaProducto.jsx";
import { productos } from "../data/productos.js";
import imagenHero from "../../../assets/hero.svg";

function Inicio() {
  const destacados = productos.filter((producto) => producto.destacado);

  return (
    <main id="contenido" className="container py-5">
      {/* La grilla de Bootstrap deja el texto y la imagen juntos en escritorio y apilados en celular. */}
      <section id="inicio" className="row align-items-center gx-4 gy-5 hero">
        <div className="col-lg-6">
          <p className="etiqueta">CAFÉ &amp; RITUALES</p>
          <h1>Tu día empieza<br />con un buen café.</h1>
          <p className="lead my-4">
            Cafés de origen y pequeños detalles para disfrutar sin apuro. Encuentra tu próxima taza favorita.
          </p>
          <a className="btn btn-success btn-lg" href="#cafes">Conoce nuestro café ↗</a>
          <p className="mt-4 text-secondary small">En grano · Tueste cuidado · A tu ritmo</p>
        </div>
        <div className="col-lg-6">
          <img
            className="img-fluid rounded-4"
            src={imagenHero}
            alt="Bolsas de café Grano junto a una taza"
            width="700"
            height="720"
          />
        </div>
      </section>

      <section id="cafes" className="mt-5 pt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <p className="etiqueta">LOS FAVORITOS</p>
            <h2>Café para todos los días.</h2>
          </div>
          <a href="../productos.html">Ver la colección →</a>
        </div>
        {/* Bootstrap acomoda las tarjetas en una, dos o tres columnas según el ancho. */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {destacados.map((producto) => (
            <div className="col" key={producto.id}>
              <TarjetaProducto producto={producto} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Inicio;
