import { act } from "react";
import App from "../../src/App.jsx";
import { productos } from "../../src/datos/productos.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Pantallas durante actualizaciones del backend", () => {
  const vista = crearVista();
  const clave = "grano-tienda-api-v1";
  const admin = {
    id: "admin",
    nombre: "Administrador",
    correo: "admin@grano.cl",
    rol: "admin",
    activo: true,
  };
  let respaldo, modo, terminarCatalogo;
  const respuesta = (datos, status = 200) => ({
    status,
    ok: status < 400,
    json: async () => datos,
  });

  beforeEach(() => {
    respaldo = localStorage.getItem(clave);
    localStorage.removeItem(clave);
    modo = "normal";
    spyOn(window, "fetch").and.callFake(async (url, opciones) => {
      if (url.endsWith("/auth/me")) return respuesta(admin);
      if (url.endsWith("/usuarios")) return respuesta([admin]);
      if (url.endsWith("/categorias"))
        return respuesta([
          { id: "cafe", nombre: "Café en grano", clave: "cafe" },
          { id: "metodos", nombre: "Métodos", clave: "metodos" },
        ]);
      if (url.endsWith("/productos")) {
        if (modo === "error")
          return respuesta({ mensaje: "Catálogo no disponible" }, 503);
        if (modo === "retener")
          return new Promise((resolver, rechazar) => {
            terminarCatalogo = () => resolver(respuesta(productos));
            opciones.signal.addEventListener(
              "abort",
              () => rechazar(new DOMException("Cancelado", "AbortError")),
              { once: true },
            );
          });
        return respuesta(productos);
      }
      return respuesta([]);
    });
  });

  afterEach(() => {
    if (respaldo === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, respaldo);
  });

  const botonCatalogo = () =>
    [...vista.contenedor.querySelectorAll("button")].find(
      (boton) => boton.textContent === "Actualizar catálogo",
    );

  it("actualizar el catálogo no desmonta el formulario ni borra un producto a medio escribir", async () => {
    await vista.mostrar(<App apiUrl="/api" />, "/admin/productos");
    await vista.escribir("#producto-nombre", "Café pendiente de completar");
    const input = vista.contenedor.querySelector("#producto-nombre");
    modo = "retener";
    await vista.clic(botonCatalogo());
    expect(vista.contenedor.querySelector("#producto-nombre")).toBe(input);
    expect(input.value).toBe("Café pendiente de completar");
    await act(async () => terminarCatalogo());
    expect(vista.contenedor.querySelector("#producto-nombre")).toBe(input);
    expect(input.value).toBe("Café pendiente de completar");
  });

  it("un fallo inicial no se confunde con un producto inexistente y se puede reintentar", async () => {
    modo = "error";
    await vista.mostrar(<App apiUrl="/api" />, `/producto/${productos[0].id}`);
    expect(vista.contenedor.querySelector("#contenido").textContent).toContain(
      "No pudimos cargar los datos",
    );
    modo = "normal";
    await vista.clic(botonCatalogo());
    expect(vista.contenedor.querySelector("#contenido h1").textContent).toBe(
      productos[0].nombre,
    );
  });
});
