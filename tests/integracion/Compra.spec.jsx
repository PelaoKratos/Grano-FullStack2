import { crearVista } from "../ayudas/renderizar.jsx";
import App from "../../src/App.jsx";
import { cargarEstado, CLAVE_TIENDA } from "../../src/datos/almacenamiento.js";
import { productos } from "../../src/datos/productos.js";
import { comprador, carrito } from "../ayudas/datos.js";

describe("Compra, persistencia y resultados", () => {
  const vista = crearVista();
  it("si falla el guardado no registra pedido ni descuenta inventario", async () => {
    const estado = cargarEstado({ getItem: () => null }, productos);
    const usuario = estado.usuarios.find(
      (usuario) => usuario.rol === "comprador",
    );
    Object.assign(usuario, comprador);
    estado.sesion = { ...usuario };
    estado.carrito = carrito;
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
    await vista.mostrar(<App />, "/checkout");
    const antes = localStorage.getItem(CLAVE_TIENDA);
    const guardar = spyOn(Storage.prototype, "setItem").and.throwError(
      "Sin espacio",
    );
    try {
      await vista.enviar();
      expect(vista.contenedor.textContent).toContain(
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
    await vista.mostrar(<App />, "/checkout");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain(
      "Tu pedido quedó registrado",
    );
    const guardado = JSON.parse(localStorage.getItem(CLAVE_TIENDA));
    expect(guardado.pedidos.length).toBe(1);
    expect(guardado.carrito.length).toBe(0);
    expect(guardado.productos[0].stock).toBe(productos[0].stock - 2);
    expect(guardado.pedidos[0].entrega.direccion).toBe(comprador.direccion);
    await vista.reiniciar();
    await vista.mostrar(
      <App />,
      `/compra/confirmada/${guardado.pedidos[0].id}`,
    );
    expect(vista.contenedor.textContent).toContain(guardado.pedidos[0].id);
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
    await vista.mostrar(<App />, "/checkout");
    await vista.escribir("#resultado-pago", "rechazado");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain(
      "No pudimos completar la compra",
    );
    const guardado = JSON.parse(localStorage.getItem(CLAVE_TIENDA));
    expect(guardado.carrito[0].cantidad).toBe(2);
    expect(guardado.pedidos.length).toBe(0);
    expect(guardado.productos[0].stock).toBe(productos[0].stock);
    await vista.clic(
      [...vista.contenedor.querySelectorAll("a")].find(
        (enlace) => enlace.textContent === "Volver a intentar",
      ),
    );
    expect(vista.contenedor.querySelector("#entrega-direccion").value).toBe(
      comprador.direccion,
    );
  });
});
