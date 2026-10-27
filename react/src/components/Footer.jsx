function Footer() {
  return (
    <footer className="pie">
      <div className="pie-contenido">
        <section className="pie-marca">
          <h2>Grano</h2>
          <p>Café y rituales para disfrutar cada día.</p>
        </section>

        <section>
          <h3>Contacto</h3>
          <a href="mailto:contacto@grano.cl">contacto@grano.cl</a>
          <a href="tel:+56912345678">+56 9 1234 5678</a>
          <p>Lunes a viernes, de 9:00 a 18:00</p>
        </section>

        <section>
          <h3>Explora</h3>
          <a href="#nuestrocafe">Nuestros cafés</a>
          <a href="#nosotros">Sobre Grano</a>
          <a href="#contacto">Escríbenos</a>
        </section>
      </div>
      <div className="pie-final">
        <p>© {new Date().getFullYear()} Grano · Café y rituales</p>
      </div>
    </footer>
  );
}

export default Footer;
