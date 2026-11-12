import { crearVista } from "../ayudas/renderizar.jsx";
import Ofertas from "../../src/components/Ofertas.jsx";
import { productos } from "../../src/datos/productos.js";

describe("Productos en oferta", () => {
  const vista = crearVista();
  it("filtra las ofertas sin cambiar el precio del producto", async () => {
    await vista.mostrar(
      <Ofertas
        productos={[{ ...productos[0], precioAnterior: 15000 }, productos[1]]}
        onAgregar={() => {}}
      />,
    );
    expect(vista.contenedor.querySelectorAll("article").length).toBe(1);
    expect(vista.contenedor.querySelector("del")).not.toBeNull();
  });
  it("presenta un estado vacío cuando no hay ofertas configuradas", async () => {
    await vista.mostrar(<Ofertas productos={productos} onAgregar={() => {}} />);
    expect(vista.contenedor.querySelectorAll("article").length).toBe(0);
    expect(vista.contenedor.textContent).toContain("Por ahora no hay ofertas");
  });
});
