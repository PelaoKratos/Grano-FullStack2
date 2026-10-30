import { useState } from "react";
import Icono from "./Icono.jsx";
import TarjetaProducto from "./TarjetaProducto.jsx";
import fotografia from "../assets/ritual-grano.png";
export default function Inicio({ productos, onAgregar }) {
  const [sabor, setSabor] = useState("colombia");
  const cafes = productos.filter((p) => p.categoria === "Café en grano");
  const cafe = cafes.find((p) => p.id === sabor) || cafes[0];
  return (
    <>
      <section className="container portada" aria-labelledby="titulo-portada">
        <div className="portada-intro">
          <h1 id="titulo-portada">
            Tu día empieza
            <br />
            con un <em>buen café.</em>
          </h1>
          <div className="portada-invitacion">
            <p>
              Cafés de origen y pequeños detalles para disfrutar sin apuro.
              Encuentra tu próxima taza favorita.
            </p>
            <a className="enlace-flecha" href="#/productos">
              Conoce nuestro café <Icono />
            </a>
          </div>
        </div>
        <div className="mesa-cafe">
          <img
            className="foto-ritual"
            src={fotografia}
            alt="Una taza de café humeante y una bolsa Grano sobre una mesa de madera, junto a un paño verde"
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <div className="mostrador">
            {cafe ? (
              <>
                <div
                  className="sabores"
                  role="group"
                  aria-label="Elige un perfil de sabor"
                >
                  {[
                    ["colombia", "Cacao"],
                    ["etiopia", "Flores"],
                    ["blend", "Chocolate"],
                  ]
                    .filter(([id]) => cafes.some((p) => p.id === id))
                    .map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={cafe.id === id}
                        onClick={() => setSabor(id)}
                      >
                        {label}
                      </button>
                    ))}
                </div>
                <div
                  className="mostrador-producto"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <h2>{cafe.nombre}</h2>
                  <p>{cafe.notas}</p>
                  <div className="mostrador-compra">
                    <span className="precio">
                      ${cafe.precio.toLocaleString("es-CL")} <small>CLP</small>
                    </span>
                    <button
                      className="btn btn-success"
                      disabled={cafe.stock === 0}
                      onClick={() => onAgregar(cafe)}
                      aria-label={`Añadir ${cafe.nombre} al carrito`}
                    >
                      {cafe.stock === 0 ? "Agotado" : "Añadir"} <Icono />
                    </button>
                  </div>
                </div>
                <a className="mostrador-detalle" href={`#/producto/${cafe.id}`}>
                  Conocer este café <Icono />
                </a>
              </>
            ) : (
              <>
                <h2>Estamos preparando nuestra próxima selección.</h2>
                <a href="#/productos">Explorar la colección</a>
              </>
            )}
          </div>
          <span className="nota-mesa">Un café. Un momento para ti.</span>
        </div>
        <div className="firma-portada">
          <span>Café en grano</span>
          <span>Tueste cuidado</span>
          <span>A tu ritmo</span>
        </div>
      </section>
      <section
        className="container seleccion-grano"
        aria-labelledby="titulo-seleccion"
      >
        <div className="titulo-seccion">
          <div>
            <h2 id="titulo-seleccion">
              Cada origen,
              <br />
              una forma de disfrutar.
            </h2>
            <p>De lo dulce a lo floral. ¿Por cuál empiezas?</p>
          </div>
          <a className="enlace-flecha" href="#/productos">
            Ver la colección <Icono />
          </a>
        </div>
        <div className="seleccion-productos">
          {cafes.slice(0, 3).map((p) => (
            <TarjetaProducto
              key={p.id}
              producto={p}
              onAgregar={onAgregar}
              portada
            />
          ))}
        </div>
      </section>
      <section className="ritual-seccion" aria-labelledby="titulo-ritual">
        <div className="container ritual-contenido">
          <div className="ritual-texto">
            <h2 id="titulo-ritual">
              El mejor ritual
              <br />
              es el tuyo.
            </h2>
            <p>
              Una pausa, una taza. Encuentra los métodos y accesorios para
              preparar tu café como más te gusta.
            </p>
            <a className="btn btn-crema" href="#/productos?categoria=metodos">
              Encuentra tu método <Icono />
            </a>
          </div>
          <div className="metodos-enlaces">
            {productos
              .filter((p) => ["dripper", "prensa"].includes(p.id))
              .map((p) => (
                <a key={p.id} href={`#/producto/${p.id}`}>
                  <img
                    src={p.imagen}
                    alt=""
                    width="1200"
                    height="1200"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    {p.nombre} <Icono />
                  </span>
                </a>
              ))}
          </div>
        </div>
      </section>
      <section className="container pausa-grano">
        <p>
          En Grano reunimos cafés de distintos orígenes y accesorios sencillos
          para quienes disfrutan preparar una taza en casa.
        </p>
        <a className="enlace-flecha" href="#/nosotros">
          Hay una historia detrás de cada taza <Icono />
        </a>
      </section>
    </>
  );
}
