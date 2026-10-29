import { useState } from "react";

function Cuenta({ usuario, pedidos, onGuardar }) {
  const [mensaje, setMensaje] = useState("");

  function guardarDatos(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.target);
    const guardado = onGuardar({
      ...usuario,
      nombre: datos.get("nombre").trim(),
      telefono: datos.get("telefono").trim(),
      direccion: datos.get("direccion").trim(),
      comuna: datos.get("comuna").trim(),
      region: datos.get("region").trim(),
    });
    setMensaje(
      guardado
        ? "Tus datos se actualizaron."
        : "No pudimos guardar los datos. Vuelve a intentarlo.",
    );
  }

  return (
    <section className="pantalla-cuenta">
      <h1>Hola, {usuario.nombre}.</h1>

      <section className="panel-formulario">
        <h2>Mis datos</h2>
        <form onSubmit={guardarDatos}>
          <label htmlFor="cuenta-nombre">Nombre completo</label>
          <input
            id="cuenta-nombre"
            name="nombre"
            defaultValue={usuario.nombre}
            required
          />

          <label htmlFor="cuenta-correo">Correo electrónico</label>
          <input id="cuenta-correo" value={usuario.correo} readOnly />

          <label htmlFor="cuenta-telefono">Teléfono</label>
          <input
            id="cuenta-telefono"
            name="telefono"
            defaultValue={usuario.telefono || ""}
            placeholder="+56 9 1234 5678"
          />

          <label htmlFor="cuenta-direccion">Dirección</label>
          <input
            id="cuenta-direccion"
            name="direccion"
            defaultValue={usuario.direccion || ""}
            placeholder="Calle y número"
          />

          <label htmlFor="cuenta-comuna">Comuna</label>
          <input
            id="cuenta-comuna"
            name="comuna"
            defaultValue={usuario.comuna || ""}
          />
          <label htmlFor="cuenta-region">Región</label>
          <input
            id="cuenta-region"
            name="region"
            defaultValue={usuario.region || ""}
          />
          <button type="submit">Guardar datos</button>
        </form>
        <p className="mensaje-formulario" role="status">
          {mensaje}
        </p>
      </section>

      <section className="panel-formulario">
        <h2>Historial de pedidos</h2>
        {pedidos.length === 0 ? (
          <p>Todavía no tienes compras registradas.</p>
        ) : (
          <ul className="lista-pedidos">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                {pedido.id} · {pedido.fecha} · {pedido.estado} · $
                {pedido.total.toLocaleString("es-CL")} CLP
                <br />
                {pedido.productos
                  .map(
                    (producto) => `${producto.nombre} × ${producto.cantidad}`,
                  )
                  .join(", ")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

export default Cuenta;
