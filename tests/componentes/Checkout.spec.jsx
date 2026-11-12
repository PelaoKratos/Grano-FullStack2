import { crearVista } from "../ayudas/renderizar.jsx";
import Checkout from "../../src/components/Checkout.jsx";
import { comprador, carrito } from "../ayudas/datos.js";

describe("Formulario de compra", () => {
  const vista = crearVista();
  it("bloquea un teléfono inválido y permite corregirlo antes de comprar", async () => {
    const comprar = jasmine.createSpy("comprar");
    await vista.mostrar(
      <Checkout usuario={comprador} carrito={carrito} onComprar={comprar} />,
    );
    await vista.escribir("#entrega-telefono", "abc");
    await vista.enviar();
    expect(comprar).not.toHaveBeenCalled();
    expect(
      vista.contenedor.querySelector('[role="alert"]').textContent,
    ).toContain("9 dígitos");
    await vista.escribir("#entrega-telefono", "+56 9 1234 5678");
    await vista.enviar();
    expect(comprar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ telefono: "+56 9 1234 5678" }),
      "aprobado",
    );
  });
  it("precarga los datos del comprador y confirma los datos editados", async () => {
    const comprar = jasmine.createSpy("comprar");
    await vista.mostrar(
      <Checkout usuario={comprador} carrito={carrito} onComprar={comprar} />,
    );
    expect(vista.contenedor.querySelector("#entrega-direccion").value).toBe(
      comprador.direccion,
    );
    await vista.escribir("#entrega-direccion", "Otra calle 456");
    await vista.enviar();
    expect(comprar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        direccion: "Otra calle 456",
        metodo: "domicilio",
      }),
      "aprobado",
    );
  });
  it("permite retirar sin dirección y simular un pago rechazado", async () => {
    const comprar = jasmine.createSpy("comprar");
    await vista.mostrar(
      <Checkout
        usuario={{ ...comprador, direccion: "" }}
        carrito={carrito}
        onComprar={comprar}
      />,
    );
    await vista.escribir("#entrega-metodo", "retiro");
    expect(vista.contenedor.querySelector("#entrega-direccion")).toBeNull();
    await vista.escribir("#resultado-pago", "rechazado");
    await vista.enviar();
    expect(comprar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ metodo: "retiro" }),
      "rechazado",
    );
  });
  it("impide confirmar una entrega incompleta", async () => {
    const comprar = jasmine.createSpy("comprar");
    await vista.mostrar(
      <Checkout
        usuario={{ ...comprador, direccion: "" }}
        carrito={carrito}
        onComprar={comprar}
      />,
    );
    await vista.enviar();
    expect(comprar).not.toHaveBeenCalled();
    expect(
      vista.contenedor.querySelector('[role="alert"]').textContent,
    ).toContain("dirección");
  });
  it("ofrece volver al catálogo cuando el carrito está vacío", async () => {
    await vista.mostrar(
      <Checkout usuario={comprador} carrito={[]} onComprar={() => {}} />,
    );
    expect(vista.contenedor.textContent).toContain("Tu carrito está vacío");
    expect(vista.contenedor.querySelector("form")).toBeNull();
  });
});
