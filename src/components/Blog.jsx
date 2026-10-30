import { Link, useParams } from "react-router-dom";
import { articulos } from "../datos/articulos.js";

export function Blog() {
  return (
    <section>
      <div className="encabezado mb-4">
        <h1>Historias del café</h1>
        <p>
          Una pausa para conocer los sabores y objetos de nuestra colección.
        </p>
      </div>
      <ul className="lista-admin">
        {articulos.map((articulo) => (
          <li key={articulo.slug}>
            <h2 className="h4">
              <Link to={`/blog/${articulo.slug}`}>{articulo.titulo}</Link>
            </h2>
            <p>{articulo.resumen}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Articulo() {
  const { slug } = useParams();
  const articulo = articulos.find((articulo) => articulo.slug === slug);
  return (
    <article>
      {articulo ? (
        <>
          <h1>{articulo.titulo}</h1>
          <div className="mt-4">
            {articulo.parrafos.map((parrafo) => (
              <p key={parrafo} className="mb-4">
                {parrafo}
              </p>
            ))}
          </div>
          <Link className="btn btn-success mt-3" to="/productos">
            Explorar la colección
          </Link>
        </>
      ) : (
        <h1>No encontramos esta historia.</h1>
      )}
      <p className="mt-4">
        <Link to="/blog">Volver a historias del café</Link>
      </p>
    </article>
  );
}
