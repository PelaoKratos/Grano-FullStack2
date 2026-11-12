import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { CLAVE_TIENDA } from "../../src/datos/almacenamiento.js";

// Cada grupo crea su contenedor y restaura los datos al terminar cada caso.
export function crearVista() {
  const vista = { contenedor: null };
  let raiz;
  let respaldo;

  beforeEach(() => {
    vista.contenedor = document.createElement("div");
    document.body.append(vista.contenedor);
    raiz = createRoot(vista.contenedor);
    respaldo = localStorage.getItem(CLAVE_TIENDA);
  });

  afterEach(async () => {
    await act(async () => raiz.unmount());
    vista.contenedor.remove();
    if (respaldo === null) localStorage.removeItem(CLAVE_TIENDA);
    else localStorage.setItem(CLAVE_TIENDA, respaldo);
  });

  vista.mostrar = async (componente, ruta = "/") => {
    await act(async () =>
      raiz.render(
        <MemoryRouter initialEntries={[ruta]}>{componente}</MemoryRouter>,
      ),
    );
  };

  vista.reiniciar = async () => {
    await act(async () => raiz.unmount());
    raiz = createRoot(vista.contenedor);
  };

  vista.clic = async (elemento) => {
    expect(elemento).not.toBeNull();
    await act(async () => elemento.click());
  };

  vista.escribir = async (selector, valor) => {
    const input = vista.contenedor.querySelector(selector);
    const prototipo =
      input instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : input instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
    await act(async () => {
      Object.getOwnPropertyDescriptor(prototipo, "value").set.call(
        input,
        valor,
      );
      input.dispatchEvent(
        new Event(input instanceof HTMLSelectElement ? "change" : "input", {
          bubbles: true,
        }),
      );
    });
  };

  // Este envío permite comprobar las validaciones escritas en JavaScript.
  vista.enviar = async () => {
    await act(async () =>
      vista.contenedor
        .querySelector("form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
  };

  // Este otro respeta required y el formato de correo del navegador.
  vista.enviarComoUsuario = async () => {
    await act(async () =>
      vista.contenedor.querySelector("form").requestSubmit(),
    );
  };
  return vista;
}
