import { crearVista } from "../ayudas/renderizar.jsx";
import Catalogo from "../../src/components/Catalogo.jsx";
import Contacto from "../../src/components/Contacto.jsx";
import { productos } from "../../src/datos/productos.js";
import { comprador } from "../ayudas/datos.js";

describe("Búsqueda, filtros y contacto", () => {
  const vista = crearVista();

  it("actualiza la búsqueda al escribir y muestra solo las coincidencias", async () => {
    await vista.mostrar(
      <Catalogo productos={productos} onAgregar={() => {}} />,
    );
    await vista.escribir("#buscar-producto", "Etiopía");
    expect(vista.contenedor.querySelectorAll("article").length).toBe(1);
    expect(vista.contenedor.textContent).toContain("Origen Etiopía");
    expect(vista.contenedor.querySelector("#buscar-producto").value).toBe(
      "Etiopía",
    );
  });
  it("cambia la categoría al hacer clic en un filtro", async () => {
    await vista.mostrar(
      <Catalogo productos={productos} onAgregar={() => {}} />,
    );
    await vista.clic(
      [...vista.contenedor.querySelectorAll("button")].find(
        (boton) => boton.textContent === "Métodos",
      ),
    );
    expect(vista.contenedor.querySelectorAll("article").length).toBe(2);
    expect(vista.contenedor.textContent).not.toContain("Origen Colombia");
  });
  it("muestra un estado vacío cuando la búsqueda no tiene resultados", async () => {
    await vista.mostrar(
      <Catalogo productos={productos} onAgregar={() => {}} />,
    );
    await vista.escribir("#buscar-producto", "inexistente");
    expect(vista.contenedor.querySelectorAll("article").length).toBe(0);
    expect(vista.contenedor.textContent).toContain("No encontramos productos");
  });
  it("muestra el error del formulario solo después de un envío rechazado", async () => {
    await vista.mostrar(
      <Contacto usuario={comprador} onEnviar={() => false} />,
    );
    expect(vista.contenedor.textContent).not.toContain("No pudimos guardar");
    const campo = vista.contenedor.querySelector("textarea");
    campo.value = "Consulta sobre un café";
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain(
      "No pudimos guardar el mensaje",
    );
  });
});
