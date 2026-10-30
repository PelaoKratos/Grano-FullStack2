import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import TarjetaProducto from "../src/components/TarjetaProducto.jsx";
import Catalogo from "../src/components/Catalogo.jsx";
import Checkout from "../src/components/Checkout.jsx";
import Contacto from "../src/components/Contacto.jsx";
import Ofertas from "../src/components/Ofertas.jsx";
import App from "../src/App.jsx";
import { cargarEstado, CLAVE_TIENDA } from "../src/datos/almacenamiento.js";
import { productos } from "../src/datos/productos.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let contenedor, raiz, respaldo;
beforeEach(() => {
  contenedor = document.createElement("div");
  document.body.append(contenedor);
  raiz = createRoot(contenedor);
  respaldo = localStorage.getItem(CLAVE_TIENDA);
});
afterEach(async () => {
  await act(async () => raiz.unmount());
  contenedor.remove();
  if (respaldo === null) {
    localStorage.removeItem(CLAVE_TIENDA);
  } else {
    localStorage.setItem(CLAVE_TIENDA, respaldo);
  }
});
async function mostrar(componente, ruta = "/") {
  await act(async () =>
    raiz.render(
      <MemoryRouter initialEntries={[ruta]}>{componente}</MemoryRouter>,
    ),
  );
}
async function clic(elemento) {
  expect(elemento).not.toBeNull();
  await act(async () => elemento.click());
}
async function escribir(selector, valor) {
  const input = contenedor.querySelector(selector);
  const prototipo =
    input instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototipo, "value").set.call(input, valor);
    input.dispatchEvent(
      new Event(input instanceof HTMLSelectElement ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
}
async function enviar() {
  await act(async () =>
    contenedor
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
}
const comprador = {
  nombre: "Cliente",
  correo: "comprador@duocuc.cl",
  telefono: "+56912345678",
  direccion: "Calle Café 123",
  comuna: "Santiago",
  region: "Metropolitana",
};
const carrito = [{ ...productos[0], cantidad: 2 }];

describe("Renderizado y props", () => {
  it("muestra el nombre, precio e imagen recibidos", async () => {
    await mostrar(
      <TarjetaProducto producto={productos[0]} onAgregar={() => {}} />,
    );
    expect(contenedor.textContent).toContain(productos[0].nombre);
    expect(contenedor.querySelector("img").alt).toBe(productos[0].nombre);
    expect(contenedor.querySelector("a").getAttribute("href")).toBe(
      `/producto/${productos[0].id}`,
    );
  });
  it("renderiza todos los productos del conjunto recibido", async () => {
    await mostrar(<Catalogo productos={productos} onAgregar={() => {}} />);
    expect(contenedor.querySelectorAll("article").length).toBe(
      productos.length,
    );
  });
  it("ejecuta el callback con el producto al hacer clic", async () => {
    const agregar = jasmine.createSpy("agregar");
    await mostrar(
      <TarjetaProducto producto={productos[0]} onAgregar={agregar} />,
    );
    await clic(contenedor.querySelector("button"));
    expect(agregar).toHaveBeenCalledOnceWith(productos[0]);
  });
  it("deshabilita Añadir cuando el producto está agotado", async () => {
    const agregar = jasmine.createSpy("agregar");
    await mostrar(
      <TarjetaProducto
        producto={{ ...productos[0], stock: 0 }}
        onAgregar={agregar}
      />,
    );
    await clic(contenedor.querySelector("button"));
    expect(agregar).not.toHaveBeenCalled();
    expect(contenedor.textContent).toContain("Agotado");
  });
});

describe("Estado y eventos", () => {
  it("actualiza la búsqueda al escribir y muestra solo las coincidencias", async () => {
    await mostrar(<Catalogo productos={productos} onAgregar={() => {}} />);
    await escribir("#buscar-producto", "Etiopía");
    expect(contenedor.querySelectorAll("article").length).toBe(1);
    expect(contenedor.textContent).toContain("Origen Etiopía");
    expect(contenedor.querySelector("#buscar-producto").value).toBe("Etiopía");
  });
  it("cambia la categoría al hacer clic en un filtro", async () => {
    await mostrar(<Catalogo productos={productos} onAgregar={() => {}} />);
    await clic(
      [...contenedor.querySelectorAll("button")].find(
        (boton) => boton.textContent === "Métodos",
      ),
    );
    expect(contenedor.querySelectorAll("article").length).toBe(2);
    expect(contenedor.textContent).not.toContain("Origen Colombia");
  });
  it("muestra un estado vacío cuando la búsqueda no tiene resultados", async () => {
    await mostrar(<Catalogo productos={productos} onAgregar={() => {}} />);
    await escribir("#buscar-producto", "inexistente");
    expect(contenedor.querySelectorAll("article").length).toBe(0);
    expect(contenedor.textContent).toContain("No encontramos productos");
  });
  it("muestra el error del formulario solo después de un envío rechazado", async () => {
    await mostrar(<Contacto usuario={comprador} onEnviar={() => false} />);
    expect(contenedor.textContent).not.toContain("No pudimos guardar");
    const campo = contenedor.querySelector("textarea");
    campo.value = "Consulta sobre un café";
    await enviar();
    expect(contenedor.textContent).toContain("No pudimos guardar el mensaje");
  });
});

describe("Checkout y resultados", () => {
  it("precarga los datos del comprador y confirma los datos editados", async () => {
    const comprar = jasmine.createSpy("comprar");
    await mostrar(
      <Checkout usuario={comprador} carrito={carrito} onComprar={comprar} />,
    );
    expect(contenedor.querySelector("#entrega-direccion").value).toBe(
      comprador.direccion,
    );
    await escribir("#entrega-direccion", "Otra calle 456");
    await enviar();
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
    await mostrar(
      <Checkout
        usuario={{ ...comprador, direccion: "" }}
        carrito={carrito}
        onComprar={comprar}
      />,
    );
    await escribir("#entrega-metodo", "retiro");
    expect(contenedor.querySelector("#entrega-direccion")).toBeNull();
    await escribir("#resultado-pago", "rechazado");
    await enviar();
    expect(comprar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ metodo: "retiro" }),
      "rechazado",
    );
  });
  it("impide confirmar una entrega incompleta", async () => {
    const comprar = jasmine.createSpy("comprar");
    await mostrar(
      <Checkout
        usuario={{ ...comprador, direccion: "" }}
        carrito={carrito}
        onComprar={comprar}
      />,
    );
    await enviar();
    expect(comprar).not.toHaveBeenCalled();
    expect(contenedor.querySelector('[role="alert"]').textContent).toContain(
      "dirección",
    );
  });
  it("ofrece volver al catálogo cuando el carrito está vacío", async () => {
    await mostrar(
      <Checkout usuario={comprador} carrito={[]} onComprar={() => {}} />,
    );
    expect(contenedor.textContent).toContain("Tu carrito está vacío");
    expect(contenedor.querySelector("form")).toBeNull();
  });
  it("filtra las ofertas sin cambiar el precio del producto", async () => {
    await mostrar(
      <Ofertas
        productos={[{ ...productos[0], precioAnterior: 15000 }, productos[1]]}
        onAgregar={() => {}}
      />,
    );
    expect(contenedor.querySelectorAll("article").length).toBe(1);
    expect(contenedor.querySelector("del")).not.toBeNull();
  });
  it("presenta un estado vacío cuando no hay ofertas configuradas", async () => {
    await mostrar(<Ofertas productos={productos} onAgregar={() => {}} />);
    expect(contenedor.querySelectorAll("article").length).toBe(0);
    expect(contenedor.textContent).toContain("Por ahora no hay ofertas");
  });
  it("si falla el guardado no registra pedido ni descuenta inventario", async () => {
    const estado = cargarEstado({ getItem: () => null }, productos);
    const usuario = estado.usuarios.find(
      (usuario) => usuario.rol === "comprador",
    );
    Object.assign(usuario, comprador);
    estado.sesion = { ...usuario };
    estado.carrito = carrito;
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
    await mostrar(<App />, "/checkout");
    const antes = localStorage.getItem(CLAVE_TIENDA);
    const guardar = spyOn(Storage.prototype, "setItem").and.throwError(
      "Sin espacio",
    );
    try {
      await enviar();
      expect(contenedor.textContent).toContain(
        "No pudimos completar la compra",
      );
      expect(localStorage.getItem(CLAVE_TIENDA)).toBe(antes);
    } finally {
      guardar.and.callThrough();
    }
  });
  it("registra una compra completa y conserva el comprobante al abrir su URL", async () => {
    const estado = cargarEstado({ getItem: () => null }, productos);
    const usuario = estado.usuarios.find(
      (usuario) => usuario.rol === "comprador",
    );
    Object.assign(usuario, comprador);
    estado.sesion = { ...usuario };
    estado.carrito = carrito;
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
    await mostrar(<App />, "/checkout");
    await enviar();
    expect(contenedor.textContent).toContain("Tu pedido quedó registrado");
    const guardado = JSON.parse(localStorage.getItem(CLAVE_TIENDA));
    expect(guardado.pedidos.length).toBe(1);
    expect(guardado.carrito.length).toBe(0);
    expect(guardado.productos[0].stock).toBe(productos[0].stock - 2);
    expect(guardado.pedidos[0].entrega.direccion).toBe(comprador.direccion);
    await act(async () => raiz.unmount());
    raiz = createRoot(contenedor);
    await mostrar(<App />, `/compra/confirmada/${guardado.pedidos[0].id}`);
    expect(contenedor.textContent).toContain(guardado.pedidos[0].id);
  });
  it("un pago rechazado conserva carrito, pedidos e inventario y permite reintentar", async () => {
    const estado = cargarEstado({ getItem: () => null }, productos);
    const usuario = estado.usuarios.find(
      (usuario) => usuario.rol === "comprador",
    );
    Object.assign(usuario, comprador);
    estado.sesion = { ...usuario };
    estado.carrito = carrito;
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
    await mostrar(<App />, "/checkout");
    await escribir("#resultado-pago", "rechazado");
    await enviar();
    expect(contenedor.textContent).toContain("No pudimos completar la compra");
    const guardado = JSON.parse(localStorage.getItem(CLAVE_TIENDA));
    expect(guardado.carrito[0].cantidad).toBe(2);
    expect(guardado.pedidos.length).toBe(0);
    expect(guardado.productos[0].stock).toBe(productos[0].stock);
    await clic(
      [...contenedor.querySelectorAll("a")].find(
        (enlace) => enlace.textContent === "Volver a intentar",
      ),
    );
    expect(contenedor.querySelector("#entrega-direccion").value).toBe(
      comprador.direccion,
    );
  });
});
