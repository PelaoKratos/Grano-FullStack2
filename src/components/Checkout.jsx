import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { totalCarrito } from "../datos/almacenamiento.js";
import { normalizarEntrega, validarEntrega } from "../datos/compra.js";
import ResumenPedido from "./ResumenPedido.jsx";

export default function Checkout({ usuario, carrito, onComprar }) {
  const { state } = useLocation();
  const [entrega, setEntrega] = useState(() =>
    normalizarEntrega({ ...usuario, metodo: "domicilio", ...state?.entrega }),
  );
  const [resultadoPago, setResultadoPago] = useState("aprobado");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    setEntrega({ ...entrega, [evento.target.name]: evento.target.value });
  }
  function confirmar(evento) {
    evento.preventDefault();
    if (enviando) {
      return;
    }
    const datos = normalizarEntrega(entrega);
    const mensaje = validarEntrega(datos);
    setError(mensaje);
    if (mensaje) {
      return;
    }
    setEnviando(true);
    try {
      onComprar(datos, resultadoPago);
    } finally {
      setEnviando(false);
    }
  }
  if (!carrito.length) {
    return (
      <section>
        <h1>Tu carrito está vacío.</h1>
        <Link className="btn btn-success mt-4" to="/productos">
          Ver la colección
        </Link>
      </section>
    );
  }
  return (
    <section>
      <div className="encabezado mb-4">
        <h1>Finalizar compra</h1>
        <p>
          Confirma tus datos y elige cómo recibir tu pedido de demostración.
        </p>
      </div>
      <div className="columnas-formularios">
        <section className="panel-formulario">
          <h2>Contacto y entrega</h2>
          <form onSubmit={confirmar}>
            {[
              ["nombre", "Nombre completo", "text", "name"],
              ["correo", "Correo electrónico", "email", "email"],
              ["telefono", "Teléfono", "tel", "tel"],
            ].map(([campo, etiqueta, tipo, autocomplete]) => (
              <div key={campo}>
                <label htmlFor={`entrega-${campo}`}>{etiqueta}</label>
                <input
                  id={`entrega-${campo}`}
                  name={campo}
                  type={tipo}
                  autoComplete={autocomplete}
                  value={entrega[campo]}
                  maxLength={250}
                  onChange={cambiar}
                  required
                />
              </div>
            ))}
            <label htmlFor="entrega-metodo">Opción de entrega</label>
            <select
              id="entrega-metodo"
              name="metodo"
              value={entrega.metodo}
              onChange={cambiar}
            >
              <option value="domicilio">Envío a domicilio</option>
              <option value="retiro">Retiro en tienda</option>
            </select>
            {entrega.metodo === "domicilio" &&
              [
                ["direccion", "Dirección", "street-address"],
                ["comuna", "Comuna", "address-level2"],
                ["region", "Región", "address-level1"],
              ].map(([campo, etiqueta, autocomplete]) => (
                <div key={campo}>
                  <label htmlFor={`entrega-${campo}`}>{etiqueta}</label>
                  <input
                    id={`entrega-${campo}`}
                    name={campo}
                    autoComplete={autocomplete}
                    value={entrega[campo]}
                    maxLength={250}
                    onChange={cambiar}
                    required
                  />
                </div>
              ))}
            <label htmlFor="entrega-indicaciones">
              Indicaciones adicionales (opcional)
            </label>
            <textarea
              id="entrega-indicaciones"
              name="indicaciones"
              rows="3"
              value={entrega.indicaciones}
              maxLength={250}
              onChange={cambiar}
            />
            <label htmlFor="resultado-pago">Pago de demostración</label>
            <select
              id="resultado-pago"
              value={resultadoPago}
              onChange={(evento) => setResultadoPago(evento.target.value)}
            >
              <option value="aprobado">Simular pago aprobado</option>
              <option value="rechazado">Simular pago rechazado</option>
            </select>
            <p className="ayuda-formulario">
              No se solicitan datos bancarios ni se realizan cobros o despachos
              reales.
            </p>
            {error && (
              <p role="alert" className="mensaje-formulario mb-3">
                {error}
              </p>
            )}
            <button type="submit" disabled={enviando}>
              {enviando ? "Registrando pedido…" : "Confirmar pedido"}
            </button>
          </form>
        </section>
        <ResumenPedido
          pedido={{ productos: carrito, total: totalCarrito(carrito), entrega }}
        />
      </div>
      <Link className="btn btn-outline-success" to="/carrito">
        Volver al carrito
      </Link>
    </section>
  );
}
