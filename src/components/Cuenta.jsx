import Boton from "./Boton.jsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import { esTelefonoValido, AYUDA_TELEFONO } from "../datos/telefono.js";

// Presenta los datos editables del perfil y, cuando corresponde, los pedidos
// del usuario.
function Cuenta({ usuario, pedidos = [], onGuardar, mostrarHistorial = true }) {
  const [mensaje, setMensaje] = useState("");

  // Lee los campos del formulario y solicita guardar los cambios del perfil.
  function guardarDatos(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.target);
    const telefono = datos.get("telefono").trim();
    if (telefono && !esTelefonoValido(telefono)) {
      setMensaje(AYUDA_TELEFONO);
      return;
    }
    const guardado = onGuardar({
      ...usuario,
      nombre: datos.get("nombre").trim(),
      telefono,
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
            type="tel"
            autoComplete="tel"
            aria-describedby="cuenta-telefono-ayuda"
            defaultValue={usuario.telefono || ""}
            placeholder="+56 9 1234 5678"
          />
          <p id="cuenta-telefono-ayuda" className="ayuda-formulario">
            Opcional. Usa 9 dígitos, con o sin el prefijo +56.
          </p>
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
          <Boton type="submit">Guardar datos</Boton>
        </form>
        <p className="mensaje-formulario" role="status">
          {mensaje}
        </p>
      </section>

      {mostrarHistorial && (
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
                  <br />
                  <Link to={`/compra/confirmada/${pedido.id}`}>
                    Ver comprobante
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}

export default Cuenta;
