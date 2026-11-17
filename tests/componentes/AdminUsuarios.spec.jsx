import { act } from "react";
import AdminUsuarios from "../../src/components/admin/AdminUsuarios.jsx";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Administración de usuarios", () => {
  const vista = crearVista();
  const usuario = {
    nombre: "Cliente",
    correo: "cliente@example.test",
    rol: "comprador",
    activo: true,
  };
  let guardar, crear;
  async function mostrar(usuarios = [usuario], pedidos = []) {
    await vista.mostrar(
      <AdminUsuarios
        usuarios={usuarios}
        pedidos={pedidos}
        sesion={{ correo: "admin@example.test" }}
        onCrear={crear}
        onGuardar={guardar}
      />,
    );
  }
  beforeEach(() => {
    guardar = jasmine.createSpy("guardar").and.returnValue(true);
    crear = jasmine.createSpy("crear").and.returnValue(true);
  });

  it("crea un vendedor normalizando los datos y limpia el formulario", async () => {
    await mostrar([]);
    await vista.escribir("#admin-nombre", "  Nuevo vendedor  ");
    await vista.escribir("#admin-correo", "VENTAS@EXAMPLE.TEST");
    await vista.escribir("#admin-clave", "Prueba123");
    await vista.escribir("#admin-rol", "vendedor");
    await vista.enviar();
    expect(crear).toHaveBeenCalledOnceWith({
      nombre: "Nuevo vendedor",
      correo: "ventas@example.test",
      contrasena: "Prueba123",
      rol: "vendedor",
    });
    expect(vista.contenedor.querySelector("#admin-nombre").value).toBe("");
    expect(vista.contenedor.textContent).toContain(
      "Usuario creado correctamente",
    );
  });

  it("conserva el formulario si se rechaza un correo repetido", async () => {
    crear.and.returnValue(false);
    await mostrar([]);
    await vista.escribir("#admin-nombre", "Cliente");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain("Ya existe una cuenta");
    expect(vista.contenedor.querySelector("#admin-nombre").value).toBe(
      "Cliente",
    );
  });

  it("cambia el rol y la activación, y muestra un error si se rechaza guardar", async () => {
    await mostrar();
    await vista.escribir('[id^="rol-"]', "vendedor");
    expect(guardar).toHaveBeenCalledWith(
      jasmine.objectContaining({ rol: "vendedor" }),
    );
    await vista.clic(vista.contenedor.querySelector("li button"));
    expect(guardar).toHaveBeenCalledWith(
      jasmine.objectContaining({ activo: false }),
    );
    guardar.and.returnValue(false);
    await vista.escribir('[id^="rol-"]', "admin");
    expect(vista.contenedor.textContent).toContain("No se pudo guardar");
    await mostrar([{ ...usuario, activo: false }]);
    guardar.and.returnValue(true);
    await vista.clic(vista.contenedor.querySelector("li button"));
    expect(guardar).toHaveBeenCalledWith(
      jasmine.objectContaining({ activo: true }),
    );
  });

  it("guarda los datos editados y muestra solo el historial de esa cuenta", async () => {
    await mostrar(
      [usuario],
      [
        { id: "GR-PROPIO", comprador: usuario.correo, estado: "Recibido" },
        { id: "GR-AJENO", comprador: "otro@example.test" },
      ],
    );
    await vista.escribir('li input[name="nombre"]', "  Nombre corregido  ");
    await vista.escribir('li input[name="comuna"]', " Santiago ");
    await act(async () =>
      vista.contenedor
        .querySelector("li form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    expect(guardar).toHaveBeenCalledWith(
      jasmine.objectContaining({
        nombre: "Nombre corregido",
        comuna: "Santiago",
      }),
    );
    expect(vista.contenedor.querySelector("a").getAttribute("href")).toBe(
      "/admin/pedidos/GR-PROPIO",
    );
    expect(vista.contenedor.textContent).not.toContain("GR-AJENO");
  });

  it("protege las cuentas de prueba y la cuenta del administrador activo", async () => {
    await mostrar([
      { ...usuario, cuentaDemostracion: true },
      { ...usuario, correo: "admin@example.test", rol: "admin" },
    ]);
    for (const fila of vista.contenedor.querySelectorAll("li")) {
      expect(fila.querySelector("select").disabled).toBeTrue();
      await vista.clic(fila.querySelector("button"));
    }
    expect(guardar).not.toHaveBeenCalled();
    expect(vista.contenedor.textContent).toContain("Sin compras registradas");
  });
});
