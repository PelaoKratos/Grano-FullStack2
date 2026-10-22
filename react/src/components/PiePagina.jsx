function PiePagina() {
  return (
    <footer className="pie mt-4 py-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between gap-4">
        <div>
          <a className="marca" href="./">grano</a>
          <p className="mt-2 mb-0">Una buena taza empieza con una pausa.</p>
        </div>
        <div>
          <a href="../nosotros.html">Conoce Grano</a>
          <br />
          <a href="../contacto.html">Contacto</a>
        </div>
      </div>
    </footer>
  );
}

export default PiePagina;
