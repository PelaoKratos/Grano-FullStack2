import { act } from "react";
import { Routes, Route } from "react-router-dom";
import Inicio from "../../src/components/Inicio.jsx";
import Nosotros from "../../src/components/Nosotros.jsx";
import Categorias from "../../src/components/Categorias.jsx";
import { Blog, Articulo } from "../../src/components/Blog.jsx";
import { Header } from "../../src/components/Layout.jsx";
import { productos } from "../../src/datos/productos.js";
import { articulos } from "../../src/datos/articulos.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Interacciones de las páginas públicas", () => {
  const vista = crearVista();

  it("cambiar de sabor en inicio actualiza el café que se añade al carrito", async () => {
    const agregar = jasmine.createSpy("agregar");
    await vista.mostrar(<Inicio productos={productos} onAgregar={agregar} />);
    await vista.clic(
      [...vista.contenedor.querySelectorAll(".sabores button")].find(
        (b) => b.textContent === "Flores",
      ),
    );
    expect(
      vista.contenedor.querySelector(".mostrador-producto h2").textContent,
    ).toBe("Origen Etiopía");
    await vista.clic(
      vista.contenedor.querySelector(".mostrador-compra button"),
    );
    expect(agregar).toHaveBeenCalledOnceWith(
      productos.find((p) => p.id === "etiopia"),
    );
  });

  it("inicio permite seguir al catálogo aunque no queden cafés disponibles", async () => {
    await vista.mostrar(<Inicio productos={[]} onAgregar={() => {}} />);
    expect(vista.contenedor.textContent).toContain(
      "Estamos preparando nuestra próxima selección",
    );
    expect(
      vista.contenedor.querySelector(".mostrador a").getAttribute("href"),
    ).toBe("/productos");
  });

  it("inicio permite elegir cafés y métodos con identificadores nuevos del servidor", async () => {
    const nuevos = productos.map((producto, indice) => ({
      ...producto,
      id: `nuevo-java-${indice}`,
    }));
    const agregar = jasmine.createSpy("agregar");
    await vista.mostrar(<Inicio productos={nuevos} onAgregar={agregar} />);
    const opciones = vista.contenedor.querySelectorAll(".sabores button");
    expect(opciones).toHaveSize(3);
    await vista.clic(opciones[1]);
    await vista.clic(
      vista.contenedor.querySelector(".mostrador-compra button"),
    );
    expect(agregar).toHaveBeenCalledOnceWith(nuevos[1]);
    expect(vista.contenedor.querySelectorAll(".metodos-enlaces a")).toHaveSize(
      2,
    );
    expect(
      vista.contenedor.querySelector(".metodos-enlaces a").getAttribute("href"),
    ).toContain("nuevo-java-");
  });

  it("el carrusel permite avanzar y retroceder entre la primera y última imagen", async () => {
    await vista.mostrar(<Nosotros />);
    const primera = vista.contenedor.querySelector("img").alt;
    await vista.clic(
      vista.contenedor.querySelector('[aria-label="Imagen anterior"]'),
    );
    expect(
      vista.contenedor.querySelector('[role="status"]').textContent,
    ).toContain("Imagen 3 de 3");
    expect(vista.contenedor.querySelector("img").alt).not.toBe(primera);
    await vista.clic(
      vista.contenedor.querySelector('[aria-label="Imagen siguiente"]'),
    );
    expect(vista.contenedor.querySelector("img").alt).toBe(primera);
  });

  it("las categorías cuentan sus productos y enlazan al filtro correspondiente", async () => {
    await vista.mostrar(
      <Categorias
        categorias={["Café en grano", "Sin productos"]}
        productos={[productos[0]]}
      />,
    );
    const filas = vista.contenedor.querySelectorAll("li");
    expect(filas[0].textContent).toContain("categoría: 1");
    expect(filas[1].textContent).toContain("categoría: 0");
    expect(filas[0].querySelector("a").getAttribute("href")).toBe(
      "/productos?categoria=cafe",
    );
  });

  it("el blog incluye un enlace a cada historia disponible", async () => {
    await vista.mostrar(<Blog />);
    expect(vista.contenedor.querySelectorAll("li").length).toBe(
      articulos.length,
    );
    expect(vista.contenedor.querySelector("a").getAttribute("href")).toBe(
      `/blog/${articulos[0].slug}`,
    );
  });

  for (const [slug, texto] of [
    ["elegir-por-sabor", "ingredientes añadidos"],
    ["no-existe", "No encontramos esta historia"],
  ]) {
    it(`la lectura de ${slug} muestra el contenido o informa que no existe`, async () => {
      await vista.mostrar(
        <Routes>
          <Route path="/blog/:slug" element={<Articulo />} />
        </Routes>,
        `/blog/${slug}`,
      );
      expect(vista.contenedor.textContent).toContain(texto);
    });
  }

  it("el menú responde a Escape y al pulsar un enlace, y conserva el foco del teclado", async () => {
    await vista.mostrar(<Header path="/" cantidad={1} onCerrar={() => true} />);
    const menu = vista.contenedor.querySelector(".menu-toggle");
    await vista.clic(menu);
    expect(menu.getAttribute("aria-expanded")).toBe("true");
    await act(async () =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(menu.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(menu);
    await vista.clic(menu);
    await vista.clic(vista.contenedor.querySelector("nav a"));
    expect(menu.getAttribute("aria-expanded")).toBe("false");
  });
});
