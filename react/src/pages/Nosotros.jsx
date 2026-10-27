import imagenOrigenes from "../assets/origenes.svg";

function Nosotros({ onIrContacto }) {
  return (
    <section className="nosotros">
      <p className="etiqueta">NUESTRA HISTORIA</p>
      <h1>Somos Grano.</h1>

      <div className="contenido-nosotros">
        <img
          src={imagenOrigenes}
          alt="Bolsas de café Grano de distintos orígenes"
        />
        <div>
          <h2>El café como una pausa.</h2>
          <p>
            En Grano reunimos cafés de distintos orígenes y accesorios sencillos
            para quienes disfrutan preparar una taza en casa. Queremos que
            encontrar tu café favorito sea parte de un momento agradable del día.
          </p>
          <p>
            Nos gustan los sabores que invitan a probar algo distinto y los
            métodos fáciles de incorporar a la rutina. Por eso nuestra colección
            combina café en grano, utensilios de preparación y tazas para
            acompañar cada pausa.
          </p>
          <button type="button" onClick={onIrContacto}>Conversemos</button>
        </div>
      </div>
    </section>
  );
}

export default Nosotros;
