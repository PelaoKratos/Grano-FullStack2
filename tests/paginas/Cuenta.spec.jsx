import Cuenta from "../../src/components/Cuenta.jsx";
import CambiarContrasena from "../../src/pages/CambiarContrasena.jsx";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Perfil y contraseña", () => {
  const vista = crearVista();
  const usuario = { nombre: "Cliente", correo: "cliente@example.test" };

  it("normaliza y guarda los datos personales y conserva el correo de la cuenta", async () => {
    const guardar = jasmine.createSpy("guardar").and.returnValue(true);
    await vista.mostrar(<Cuenta usuario={usuario} onGuardar={guardar} />);
    for (const [campo, valor] of Object.entries({
      nombre: " Nombre nuevo ",
      telefono: " 912345678 ",
      direccion: " Calle 123 ",
      comuna: " Santiago ",
      region: " Metropolitana ",
    })) {
      await vista.escribir(`#cuenta-${campo}`, valor);
    }
    await vista.enviar();
    expect(guardar).toHaveBeenCalledOnceWith({
      nombre: "Nombre nuevo",
      correo: usuario.correo,
      telefono: "912345678",
      direccion: "Calle 123",
      comuna: "Santiago",
      region: "Metropolitana",
    });
    expect(vista.contenedor.textContent).toContain("Tus datos se actualizaron");
    expect(
      vista.contenedor.querySelector("#cuenta-correo").readOnly,
    ).toBeTrue();
    expect(vista.contenedor.textContent).toContain("Todavía no tienes compras");
  });

  it("informa el fallo de guardado y permite ocultar el historial en el perfil administrativo", async () => {
    await vista.mostrar(
      <Cuenta
        usuario={{
          ...usuario,
          telefono: "912345678",
          direccion: "Calle",
          comuna: "Santiago",
          region: "RM",
        }}
        onGuardar={() => false}
        mostrarHistorial={false}
      />,
    );
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain(
      "No pudimos guardar los datos",
    );
    expect(vista.contenedor.textContent).not.toContain("Historial de pedidos");
  });

  it("enlaza los pedidos del perfil con su comprobante", async () => {
    const pedido = {
      id: "GR-1",
      fecha: "16/11/2026",
      estado: "Recibido",
      total: 1000,
      productos: [{ nombre: "Café", cantidad: 1 }],
    };
    await vista.mostrar(
      <Cuenta usuario={usuario} pedidos={[pedido]} onGuardar={() => true} />,
    );
    expect(vista.contenedor.textContent).toContain("Café × 1");
    expect(vista.contenedor.querySelector("a").getAttribute("href")).toBe(
      "/compra/confirmada/GR-1",
    );
  });

  it("conserva los campos cuando falla el cambio de contraseña y los limpia al completarse", async () => {
    const cambiar = jasmine.createSpy("cambiar").and.returnValue(false);
    await vista.mostrar(
      <CambiarContrasena onCambiarContrasena={cambiar} />,
      "/cambiar-clave?destino=carrito",
    );
    await vista.escribir("#clave-correo", "CLIENTE@EXAMPLE.TEST");
    await vista.escribir("#clave-actual", "Anterior123");
    await vista.escribir("#clave-nueva", "Nueva123");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain("No pudimos validar");
    expect(vista.contenedor.querySelector("#clave-nueva").value).toBe(
      "Nueva123",
    );
    cambiar.and.returnValue(true);
    await vista.enviar();
    expect(cambiar).toHaveBeenCalledWith(
      "cliente@example.test",
      "Anterior123",
      "Nueva123",
    );
    expect(vista.contenedor.querySelector("#clave-nueva").value).toBe("");
    expect(vista.contenedor.textContent).toContain("Contraseña actualizada");
    expect(vista.contenedor.querySelector("a").getAttribute("href")).toBe(
      "/acceso?destino=carrito",
    );
  });
});
