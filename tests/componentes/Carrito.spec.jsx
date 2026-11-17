import Carrito from "../../src/components/Carrito.jsx";
import { productos } from "../../src/datos/productos.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Controles del carrito", () => {
  const vista = crearVista();
  const producto = { ...productos[0], cantidad: 2, stock: 3 };
  let cantidad, quitar;
  async function mostrar(
    sesion = { rol: "comprador" },
    linea = producto,
    mensajeCompra = "",
  ) {
    await vista.mostrar(
      <Carrito
        carrito={[linea]}
        sesion={sesion}
        onCantidad={cantidad}
        onQuitar={quitar}
        mensajeCompra={mensajeCompra}
      />,
    );
  }
  beforeEach(() => {
    cantidad = jasmine.createSpy("cantidad");
    quitar = jasmine.createSpy("quitar");
  });

  it("aumenta, disminuye y quita la línea indicando el producto correcto", async () => {
    await mostrar();
    await vista.clic(
      vista.contenedor.querySelector('[aria-label^="Aumentar"]'),
    );
    await vista.clic(
      vista.contenedor.querySelector('[aria-label^="Disminuir"]'),
    );
    await vista.clic(vista.contenedor.querySelector('[aria-label^="Quitar"]'));
    expect(cantidad).toHaveBeenCalledWith(producto.id, 1);
    expect(cantidad).toHaveBeenCalledWith(producto.id, -1);
    expect(quitar).toHaveBeenCalledOnceWith(producto.id);
    expect(
      vista.contenedor.querySelector('a[href="/checkout"]'),
    ).not.toBeNull();
  });

  it("bloquea las cantidades fuera de los límites y evita seguir si falta stock", async () => {
    await mostrar(undefined, { ...producto, cantidad: 1, stock: 1 });
    for (const boton of vista.contenedor.querySelectorAll(
      ".cantidad-carrito button",
    )) {
      expect(boton.disabled).toBeTrue();
      await vista.clic(boton);
    }
    expect(cantidad).not.toHaveBeenCalled();
    await mostrar(undefined, { ...producto, stock: 0 });
    expect(
      vista.contenedor.querySelector('[role="alert"]').textContent,
    ).toContain("El stock cambió");
    const continuar = vista.contenedor.querySelector('[aria-disabled="true"]');
    const evento = new MouseEvent("click", { bubbles: true, cancelable: true });
    continuar.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBeTrue();
  });

  it("solicita acceso al visitante y avisa al vendedor que necesita una cuenta compradora", async () => {
    await mostrar(null);
    expect(
      vista.contenedor.querySelector('a[href="/acceso?destino=carrito"]'),
    ).not.toBeNull();
    await mostrar({ rol: "vendedor" });
    expect(vista.contenedor.textContent).toContain("cuenta de comprador");
    expect(vista.contenedor.querySelector('a[href="/checkout"]')).toBeNull();
  });

  it("presenta el carrito vacío y el mensaje de compra cuando corresponde", async () => {
    await vista.mostrar(
      <Carrito carrito={[]} mensajeCompra="Pedido registrado" />,
    );
    expect(vista.contenedor.textContent).toContain("Todavía no agregas");
    expect(
      vista.contenedor.querySelector('[role="status"]').textContent,
    ).toContain("Pedido registrado");
    expect(vista.contenedor.querySelector(".resumen-compra")).toBeNull();
  });
});
