import { act } from "react";
import Contacto from "../../src/components/Contacto.jsx";
import AdminCategorias from "../../src/components/admin/AdminCategorias.jsx";
import Inicio from "../../src/components/Inicio.jsx";
import { productos } from "../../src/datos/productos.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Formularios conectados de contenido", () => {
  const vista = crearVista();

  it("contacto espera la respuesta y conserva el texto si falla el envío", async () => {
    let terminar;
    const enviar = jasmine.createSpy("enviar").and.returnValue(
      new Promise((resolver) => {
        terminar = resolver;
      }),
    );
    await vista.mostrar(<Contacto onEnviar={enviar} />);
    await vista.escribir("#contacto-nombre", "Visita");
    await vista.escribir("#contacto-correo", "visita@grano.cl");
    await vista.escribir("#contacto-mensaje", "Quisiera consultar");
    await vista.enviar();
    expect(vista.contenedor.querySelector("fieldset").disabled).toBeTrue();
    await vista.enviar();
    expect(enviar.calls.count()).toBe(1);
    await act(async () => terminar(false));
    expect(vista.contenedor.querySelector("textarea").value).toBe(
      "Quisiera consultar",
    );
    enviar.and.rejectWith(new Error("Sin conexión"));
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain("Tus datos siguen");
    expect(vista.contenedor.querySelector("fieldset").disabled).toBeFalse();
  });

  it("categorías espera al backend y conserva el nombre para corregir una petición rechazada", async () => {
    let terminar;
    const guardar = jasmine.createSpy("guardar").and.returnValue(
      new Promise((resolver) => {
        terminar = resolver;
      }),
    );
    const eliminar = jasmine
      .createSpy("eliminar")
      .and.rejectWith(new Error("Sin conexión"));
    await vista.mostrar(
      <AdminCategorias
        categorias={["Accesorios"]}
        productos={[]}
        onGuardar={guardar}
        onEliminar={eliminar}
      />,
    );
    await vista.escribir("input", "Métodos");
    await vista.enviar();
    expect(vista.contenedor.querySelector("fieldset").disabled).toBeTrue();
    await act(async () => terminar(false));
    expect(vista.contenedor.querySelector("input").value).toBe("Métodos");
    guardar.and.rejectWith(new Error("Sin conexión"));
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain("No pudimos guardar");
    await vista.clic(
      [...vista.contenedor.querySelectorAll("button")].find(
        (boton) => boton.textContent === "Eliminar",
      ),
    );
    expect(vista.contenedor.textContent).toContain("No pudimos eliminar");
  });

  it("la portada mantiene cafés, métodos y filtros después de renombrar sus categorías", async () => {
    const renombrados = productos.map((producto) => ({
      ...producto,
      categoria:
        producto.categoria === "Café en grano"
          ? "Orígenes"
          : producto.categoria === "Métodos"
            ? "Preparación"
            : producto.categoria,
    }));
    await vista.mostrar(
      <Inicio
        productos={renombrados}
        onAgregar={() => {}}
        categoriaCafe="Orígenes"
        categoriaMetodos="Preparación"
      />,
    );
    expect(vista.contenedor.querySelectorAll(".sabores button")).toHaveSize(3);
    expect(vista.contenedor.querySelectorAll(".metodos-enlaces a")).toHaveSize(
      2,
    );
    expect(
      vista.contenedor.querySelector(
        'a[href="/productos?categoria=preparacion"]',
      ),
    ).not.toBeNull();
  });
});
