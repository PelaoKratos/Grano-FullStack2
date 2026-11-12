import { crearVista } from "../ayudas/renderizar.jsx";
import TarjetaProducto from "../../src/components/TarjetaProducto.jsx";
import Catalogo from "../../src/components/Catalogo.jsx";
import { productos } from "../../src/datos/productos.js";

describe("Renderizado y props de productos", () => {
  const vista = crearVista();

  it("muestra el nombre, precio e imagen recibidos", async () => {
    await vista.mostrar(
      <TarjetaProducto producto={productos[0]} onAgregar={() => {}} />,
    );
    expect(vista.contenedor.textContent).toContain(productos[0].nombre);
    expect(vista.contenedor.querySelector("img").alt).toBe(productos[0].nombre);
    expect(vista.contenedor.querySelector("a").getAttribute("href")).toBe(
      `/producto/${productos[0].id}`,
    );
  });
  it("renderiza todos los productos del conjunto recibido", async () => {
    await vista.mostrar(
      <Catalogo productos={productos} onAgregar={() => {}} />,
    );
    expect(vista.contenedor.querySelectorAll("article").length).toBe(
      productos.length,
    );
  });
  it("ejecuta el callback con el producto al hacer clic", async () => {
    const agregar = jasmine.createSpy("agregar");
    await vista.mostrar(
      <TarjetaProducto producto={productos[0]} onAgregar={agregar} />,
    );
    await vista.clic(vista.contenedor.querySelector("button"));
    expect(agregar).toHaveBeenCalledOnceWith(productos[0]);
  });
  it("deshabilita Añadir cuando el producto está agotado", async () => {
    const agregar = jasmine.createSpy("agregar");
    await vista.mostrar(
      <TarjetaProducto
        producto={{ ...productos[0], stock: 0 }}
        onAgregar={agregar}
      />,
    );
    await vista.clic(vista.contenedor.querySelector("button"));
    expect(agregar).not.toHaveBeenCalled();
    expect(vista.contenedor.textContent).toContain("Agotado");
  });
});
