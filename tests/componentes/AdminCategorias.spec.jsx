import AdminCategorias from "../../src/components/admin/AdminCategorias.jsx";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Administración de categorías", () => {
  const vista = crearVista();
  let guardar, eliminar;
  beforeEach(async () => {
    guardar = jasmine.createSpy("guardar").and.returnValue(true);
    eliminar = jasmine.createSpy("eliminar").and.returnValue(true);
    await vista.mostrar(
      <AdminCategorias
        categorias={["Café", "Accesorios"]}
        productos={[{ categoria: "Café" }]}
        onGuardar={guardar}
        onEliminar={eliminar}
      />,
    );
  });

  it("crea una categoría y limpia el nombre", async () => {
    await vista.escribir("#categoria-nombre", "Métodos");
    await vista.enviar();
    expect(guardar).toHaveBeenCalledOnceWith("", "Métodos");
    expect(vista.contenedor.querySelector("input").value).toBe("");
  });

  it("permite renombrar, cancelar y conservar el nombre cuando se rechaza el cambio", async () => {
    const editar = () =>
      vista.clic(vista.contenedor.querySelectorAll("li button")[2]);
    await editar();
    await vista.escribir("#categoria-nombre", "Tazas");
    guardar.and.returnValue(false);
    await vista.enviar();
    expect(guardar).toHaveBeenCalledWith("Accesorios", "Tazas");
    expect(vista.contenedor.textContent).toContain(
      "no puede estar vacío ni repetido",
    );
    await vista.clic(
      [...vista.contenedor.querySelectorAll("button")].find(
        (b) => b.textContent === "Cancelar",
      ),
    );
    expect(vista.contenedor.querySelector("input").value).toBe("");
    await editar();
    guardar.and.returnValue(true);
    await vista.escribir("#categoria-nombre", "Tazas");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain("Categoría guardada");
  });

  it("bloquea eliminar categorías con productos", async () => {
    const boton = vista.contenedor.querySelectorAll("li button")[1];
    expect(boton.disabled).toBeTrue();
    await vista.clic(boton);
    expect(eliminar).not.toHaveBeenCalled();
  });

  it("muestra el rechazo al eliminar y limpia la edición si después se elimina", async () => {
    eliminar.and.returnValue(false);
    await vista.clic(vista.contenedor.querySelectorAll("li button")[3]);
    expect(vista.contenedor.textContent).toContain("No se puede eliminar");
    await vista.clic(vista.contenedor.querySelectorAll("li button")[2]);
    eliminar.and.returnValue(true);
    await vista.clic(vista.contenedor.querySelectorAll("li button")[3]);
    expect(eliminar).toHaveBeenCalledWith("Accesorios");
    expect(vista.contenedor.querySelector("input").value).toBe("");
    expect(vista.contenedor.textContent).toContain("Categoría eliminada");
  });
});
