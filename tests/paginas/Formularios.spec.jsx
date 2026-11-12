import Login from "../../src/pages/Login.jsx";
import Registro from "../../src/pages/Registro.jsx";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Validaciones nativas de los formularios", () => {
  const vista = crearVista();

  it("el navegador bloquea el login vacío o con correo incorrecto antes de llamar al acceso", async () => {
    const iniciar = jasmine.createSpy("iniciar").and.returnValue(false);
    await vista.mostrar(<Login onIniciar={iniciar} />);
    await vista.enviarComoUsuario();
    expect(iniciar).not.toHaveBeenCalled();
    await vista.escribir("#login-correo", "correo-sin-arroba");
    await vista.escribir("#login-contrasena", "1234");
    await vista.enviarComoUsuario();
    expect(iniciar).not.toHaveBeenCalled();
    await vista.escribir("#login-correo", "admin@duocuc.cl");
    await vista.enviarComoUsuario();
    expect(iniciar).toHaveBeenCalledOnceWith("admin@duocuc.cl", "1234");
  });

  it("el registro exige confirmar la contraseña antes de enviar los datos", async () => {
    const registrar = jasmine.createSpy("registrar").and.returnValue(true);
    await vista.mostrar(<Registro onRegistrar={registrar} />);
    await vista.escribir("#registro-nombre", "Cliente prueba");
    await vista.escribir("#registro-rut", "12.345.678-5");
    await vista.escribir("#registro-correo", "cliente@example.test");
    await vista.escribir("#registro-contrasena", "Prueba123");
    await vista.enviarComoUsuario();
    expect(registrar).not.toHaveBeenCalled();
    await vista.escribir("#registro-confirmacion", "Prueba123");
    await vista.enviarComoUsuario();
    expect(registrar).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        correo: "cliente@example.test",
        rol: "comprador",
        rut: "12.345.678-5",
      }),
    );
  });
});
