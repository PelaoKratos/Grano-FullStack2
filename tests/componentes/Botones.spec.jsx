import { crearVista } from "../ayudas/renderizar.jsx";
import Boton from "../../src/components/Boton.jsx";
import DetalleProducto from "../../src/components/DetalleProducto.jsx";
import { productos } from "../../src/datos/productos.js";

describe("Botones reutilizables", () => {
  const vista = crearVista();

  it("una acción no envía el formulario y el botón submit sí lo hace", async () => {
    const cancelar = jasmine.createSpy("cancelar");
    const guardar = jasmine.createSpy("guardar");
    await vista.mostrar(
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          guardar();
        }}
      >
        <Boton
          variante="secundario"
          onClick={cancelar}
          aria-label="Cancelar edición"
        >
          Cancelar
        </Boton>
        <Boton type="submit">Guardar</Boton>
      </form>,
    );
    await vista.clic(
      vista.contenedor.querySelector('[aria-label="Cancelar edición"]'),
    );
    expect(cancelar).toHaveBeenCalledTimes(1);
    expect(guardar).not.toHaveBeenCalled();
    await vista.clic(vista.contenedor.querySelector('[type="submit"]'));
    expect(guardar).toHaveBeenCalledTimes(1);
  });

  it("el detalle añade el producto y bloquea la acción cuando se agota", async () => {
    const agregar = jasmine.createSpy("agregar");
    await vista.mostrar(
      <DetalleProducto producto={productos[0]} onAgregar={agregar} />,
    );
    await vista.clic(vista.contenedor.querySelector("button"));
    expect(agregar).toHaveBeenCalledOnceWith(productos[0]);
    await vista.mostrar(
      <DetalleProducto
        producto={{ ...productos[0], stock: 0 }}
        onAgregar={agregar}
      />,
    );
    const boton = vista.contenedor.querySelector("button");
    expect(boton.disabled).toBeTrue();
    expect(boton.textContent).toContain("Agotado");
    await vista.clic(boton);
    expect(agregar).toHaveBeenCalledTimes(1);
  });
});
