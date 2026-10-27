function AdminMensajes({ mensajes, onMarcar }) {
  return (
    <section className="panel-formulario">
      <h2>Mensajes recibidos</h2>
      {mensajes.length === 0 ? <p>Aún no hay mensajes recibidos.</p> : (
        <ul className="lista-admin">
          {mensajes.map((mensaje, indice) => (
            <li key={`${mensaje.fecha}-${indice}`}>
              <strong>{mensaje.nombre}</strong> · {mensaje.correo} · {mensaje.fecha} · {mensaje.estado}
              <p>{mensaje.texto}</p>
              {mensaje.estado !== "Leído" && <button className="boton-secundario" type="button" onClick={() => onMarcar(indice)}>Marcar como leído</button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminMensajes;
