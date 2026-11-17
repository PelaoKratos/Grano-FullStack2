import { act } from "react";
import AdminProductos from "../../src/components/admin/AdminProductos.jsx";
import { productos } from "../../src/datos/productos.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Administración de productos", () => {
  const vista = crearVista();
  const producto = { ...productos[0], stock: 1 };
  let guardar, eliminar;

  beforeEach(async () => {
    guardar = jasmine.createSpy("guardar").and.returnValue(true);
    eliminar = jasmine.createSpy("eliminar").and.returnValue(true);
    await vista.mostrar(
      <AdminProductos
        productos={[producto]}
        onGuardar={guardar}
        onEliminar={eliminar}
      />,
    );
  });

  async function completar() {
    for (const [campo, valor] of Object.entries({
      nombre: "Nuevo café",
      descripcion: "Descripción",
      detalle: "Bolsa de 250 g",
      precio: "10000",
    })) {
      await vista.escribir(`#producto-${campo}`, valor);
    }
  }

  async function adjuntar(archivo) {
    const datos = new DataTransfer();
    datos.items.add(archivo);
    await act(async () => {
      vista.contenedor.querySelector("#producto-imagen").files = datos.files;
    });
  }

  it("crea un producto sin imagen y limpia los campos después de guardar", async () => {
    await completar();
    await vista.enviar();
    expect(guardar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        nombre: "Nuevo café",
        precio: "10000",
        imagen: "",
      }),
    );
    expect(vista.contenedor.querySelector("#producto-nombre").value).toBe("");
    expect(vista.contenedor.textContent).toContain(
      "Producto guardado correctamente",
    );
    expect(vista.contenedor.textContent).toContain("Stock crítico");
  });

  it("precarga el producto, permite editarlo y mantiene su identificador", async () => {
    await vista.clic(vista.contenedor.querySelector('[aria-label^="Editar"]'));
    expect(document.activeElement.id).toBe("producto-nombre");
    expect(vista.contenedor.querySelector("#producto-nombre").value).toBe(
      producto.nombre,
    );
    await vista.escribir("#producto-precio", "11000");
    await vista.enviar();
    expect(guardar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ id: producto.id, precio: "11000" }),
    );
    expect(vista.contenedor.textContent).not.toContain("Cancelar edición");
  });

  it("cancelar la edición vuelve al formulario nuevo sin guardar", async () => {
    await vista.clic(vista.contenedor.querySelector('[aria-label^="Editar"]'));
    await vista.clic(
      [...vista.contenedor.querySelectorAll("button")].find(
        (b) => b.textContent === "Cancelar edición",
      ),
    );
    expect(vista.contenedor.querySelector("#producto-nombre").value).toBe("");
    expect(guardar).not.toHaveBeenCalled();
  });

  it("si se rechaza el guardado conserva los datos para corregirlos", async () => {
    guardar.and.returnValue(false);
    await completar();
    await vista.enviar();
    expect(vista.contenedor.querySelector("#producto-nombre").value).toBe(
      "Nuevo café",
    );
    expect(vista.contenedor.textContent).toContain("Revisa los datos");
  });

  it("respeta la confirmación, informa un fallo al eliminar y cierra la edición al conseguirlo", async () => {
    const confirmar = spyOn(window, "confirm").and.returnValue(false);
    await vista.clic(vista.contenedor.querySelector('[aria-label^="Quitar"]'));
    expect(eliminar).not.toHaveBeenCalled();
    confirmar.and.returnValue(true);
    eliminar.and.returnValue(false);
    await vista.clic(vista.contenedor.querySelector('[aria-label^="Quitar"]'));
    expect(vista.contenedor.textContent).toContain("No se pudo quitar");
    eliminar.and.returnValue(true);
    await vista.clic(vista.contenedor.querySelector('[aria-label^="Editar"]'));
    await vista.clic(vista.contenedor.querySelector('[aria-label^="Quitar"]'));
    expect(eliminar).toHaveBeenCalledWith(producto.id);
    expect(vista.contenedor.textContent).toContain("Producto quitado");
    expect(vista.contenedor.textContent).not.toContain("Cancelar edición");
  });

  for (const [nombre, archivo] of [
    [
      "formato no admitido",
      () => new File(["gif"], "foto.gif", { type: "image/gif" }),
    ],
    [
      "imagen demasiado grande",
      () =>
        new File([new Uint8Array(500001)], "foto.png", { type: "image/png" }),
    ],
  ]) {
    it(`rechaza ${nombre} sin llamar a guardar`, async () => {
      await completar();
      await adjuntar(archivo());
      await vista.enviar();
      expect(guardar).not.toHaveBeenCalled();
      expect(vista.contenedor.textContent).toContain("hasta 500 KB");
    });
  }

  it("envía la imagen convertida cuando el lector termina correctamente", async () => {
    const imagen = "data:image/png;base64,YQ==";
    spyOn(window, "FileReader").and.callFake(function () {
      this.readAsDataURL = () => {
        this.result = imagen;
        this.onload();
      };
    });
    await completar();
    await adjuntar(new File(["a"], "foto.png", { type: "image/png" }));
    await vista.enviar();
    expect(guardar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ imagen }),
    );
  });

  it("informa el error de lectura y no guarda una imagen incompleta", async () => {
    spyOn(window, "FileReader").and.callFake(function () {
      this.readAsDataURL = () => this.onerror();
    });
    await completar();
    await adjuntar(new File(["a"], "foto.png", { type: "image/png" }));
    await vista.enviar();
    expect(guardar).not.toHaveBeenCalled();
    expect(vista.contenedor.textContent).toContain("No se pudo leer la imagen");
  });
});
