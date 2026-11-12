import Cuenta from "../../src/components/Cuenta.jsx";
import { crearVista } from "../ayudas/renderizar.jsx";
import { comprador } from "../ayudas/datos.js";

describe("Teléfono del perfil", () => {
  const vista = crearVista();
  it("muestra ayuda y bloquea el guardado de un teléfono inválido", async () => {
    const guardar = jasmine.createSpy("guardar");
    await vista.mostrar(<Cuenta usuario={comprador} onGuardar={guardar} />);
    await vista.escribir("#cuenta-telefono", "abc");
    await vista.enviar();
    expect(guardar).not.toHaveBeenCalled();
    expect(
      vista.contenedor.querySelector('[role="status"]').textContent,
    ).toContain("9 dígitos");
  });
  it("permite guardar el perfil sin teléfono", async () => {
    const guardar = jasmine.createSpy("guardar").and.returnValue(true);
    await vista.mostrar(<Cuenta usuario={comprador} onGuardar={guardar} />);
    await vista.escribir("#cuenta-telefono", "");
    await vista.enviar();
    expect(guardar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ telefono: "" }),
    );
  });
});
