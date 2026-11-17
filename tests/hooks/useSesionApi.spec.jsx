import { act } from "react";
import { useSesionApi } from "../../src/hooks/useSesionApi.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Sesión del servidor", () => {
  const vista = crearVista();
  const cliente = {
    id: "cliente",
    nombre: "Cliente",
    correo: "cliente@grano.cl",
    rol: "comprador",
    activo: true,
  };
  const admin = {
    id: "admin",
    nombre: "Admin",
    correo: "admin@grano.cl",
    rol: "admin",
    activo: true,
  };
  let sesion, actual, usuarios, peticion, atender;
  const respuesta = (datos, status = 200) =>
    Promise.resolve({ status, ok: status < 400, json: async () => datos });

  function Pantalla({ direccion = "/api" }) {
    sesion = useSesionApi(direccion);
    return null;
  }

  beforeEach(() => {
    actual = null;
    usuarios = [admin, cliente];
    atender = (url, opciones = {}) => {
      if (url.endsWith("/csrf"))
        return respuesta({ headerName: "X-CSRF-TOKEN", token: "csrf" });
      if (url.endsWith("/me"))
        return respuesta(
          actual || { mensaje: "Sin sesión" },
          actual ? 200 : 401,
        );
      if (url.endsWith("/login")) {
        actual = usuarios.find(
          (cuenta) =>
            cuenta.correo === new URLSearchParams(opciones.body).get("correo"),
        );
        return respuesta(actual);
      }
      if (url.endsWith("/logout")) {
        actual = null;
        return respuesta(null, 204);
      }
      if (
        url.endsWith("/registro") ||
        (url.endsWith("/usuarios") && opciones.method === "POST")
      ) {
        const { contrasena, ...datos } = JSON.parse(opciones.body);
        const creado = {
          ...datos,
          id: "nueva-cuenta",
          rol: url.endsWith("/registro") ? "comprador" : datos.rol,
        };
        usuarios = [...usuarios, creado];
        return respuesta(creado, 201);
      }
      if (url.endsWith("/perfil")) {
        actual = { ...actual, ...JSON.parse(opciones.body) };
        usuarios = usuarios.map((cuenta) =>
          cuenta.id === actual.id ? actual : cuenta,
        );
        return respuesta(actual);
      }
      if (url.endsWith("/clave")) return respuesta(null, 204);
      if (opciones.method === "PUT") {
        const editado = JSON.parse(opciones.body);
        usuarios = usuarios.map((cuenta) =>
          cuenta.id === editado.id ? editado : cuenta,
        );
        return respuesta(editado);
      }
      return respuesta(usuarios);
    };
    peticion = spyOn(window, "fetch").and.callFake(atender);
  });

  it("registra y abre la sesión nueva usando cookies y un token de seguridad", async () => {
    await vista.mostrar(<Pantalla />);
    expect(sesion.usuario).toBeNull();
    expect(sesion.verificada).toBeTrue();
    await act(async () =>
      expect(
        await sesion.registrar(
          {
            nombre: "Nuevo",
            correo: "nuevo@grano.cl",
            rut: "12345678-5",
            contrasena: "Clave123",
          },
          true,
        ),
      ).toBeTrue(),
    );
    expect(sesion.usuario.correo).toBe("nuevo@grano.cl");
    expect(sesion.usuario.contrasena).toBeUndefined();
    const opciones = peticion.calls
      .allArgs()
      .find(([url]) => url.endsWith("/registro"))[1];
    expect(opciones.credentials).toBe("include");
    expect(opciones.headers["X-CSRF-TOKEN"]).toBe("csrf");
  });

  it("recupera la sesión administrativa y gestiona cuentas desde la API", async () => {
    actual = admin;
    await vista.mostrar(<Pantalla />);
    expect(sesion.usuarios).toHaveSize(2);
    await act(async () =>
      expect(
        await sesion.registrar(
          {
            nombre: "Venta",
            correo: "venta@grano.cl",
            rol: "vendedor",
            contrasena: "Clave123",
          },
          false,
        ),
      ).toBeTrue(),
    );
    expect(sesion.usuarios).toHaveSize(3);
    await act(async () =>
      expect(await sesion.editar({ ...cliente, activo: false })).toBeTrue(),
    );
    expect(
      sesion.usuarios.find((cuenta) => cuenta.id === cliente.id).activo,
    ).toBeFalse();
    await act(async () => sesion.editar({ ...admin, nombre: "Admin editado" }));
    expect(sesion.usuario.nombre).toBe("Admin editado");
  });

  it("guarda el perfil, cambia la clave y cierra la sesión del usuario", async () => {
    actual = cliente;
    await vista.mostrar(<Pantalla />);
    await act(async () =>
      expect(
        await sesion.perfil({
          nombre: "Cliente editado",
          telefono: "912345678",
        }),
      ).toBeTrue(),
    );
    expect(sesion.usuario.nombre).toBe("Cliente editado");
    await act(async () =>
      expect(
        await sesion.clave(cliente.correo, "Clave123", "Nueva123"),
      ).toBeTrue(),
    );
    expect(sesion.usuario).toBeNull();
    await act(async () => sesion.iniciar(admin.correo, "Clave123"));
    await act(async () =>
      expect(
        await sesion.clave(cliente.correo, "Nueva123", "Otra123"),
      ).toBeTrue(),
    );
    expect(sesion.usuario.id).toBe(admin.id);
    await act(async () => expect(await sesion.cerrar()).toBeTrue());
    expect(sesion.usuarios).toEqual([]);
  });

  it("permite reintentar la conexión sin confiar en una sesión local", async () => {
    peticion.and.rejectWith(new TypeError("Sin red"));
    await vista.mostrar(<Pantalla />);
    expect(sesion.verificada).toBeFalse();
    expect(sesion.error).toContain("No pudimos conectar");
    actual = cliente;
    peticion.and.callFake(atender);
    await act(async () => sesion.recargar());
    expect(sesion.usuario.id).toBe(cliente.id);
    expect(sesion.error).toBe("");
  });

  it("una respuesta 401 en una acción protegida termina la sesión", async () => {
    actual = cliente;
    await vista.mostrar(<Pantalla />);
    peticion.and.callFake((url, opciones) =>
      url.endsWith("/perfil")
        ? respuesta({ mensaje: "Sesión vencida" }, 401)
        : atender(url, opciones),
    );
    await act(async () =>
      expect(await sesion.perfil({ nombre: "Otro" })).toBeFalse(),
    );
    expect(sesion.usuario).toBeNull();
    expect(sesion.error).toContain("Sesión vencida");
  });

  it("conserva la sesión si falla el cierre en el servidor", async () => {
    actual = cliente;
    await vista.mostrar(<Pantalla />);
    peticion.and.callFake((url, opciones) =>
      url.endsWith("/logout")
        ? respuesta({ mensaje: "Servidor no disponible" }, 503)
        : atender(url, opciones),
    );
    await act(async () => expect(await sesion.cerrar()).toBeFalse());
    expect(sesion.usuario.id).toBe(cliente.id);
    expect(sesion.error).toBe("Servidor no disponible");
  });

  it("cancela la lectura inicial al salir y no consulta si el modo API está apagado", async () => {
    let resolver;
    peticion.and.callFake(
      () =>
        new Promise((terminar) => {
          resolver = terminar;
        }),
    );
    await vista.mostrar(<Pantalla />);
    const signal = peticion.calls.mostRecent().args[1].signal;
    await vista.reiniciar();
    expect(signal.aborted).toBeTrue();
    await act(async () =>
      resolver({ status: 200, ok: true, json: async () => cliente }),
    );
    peticion.calls.reset();
    await vista.mostrar(<Pantalla direccion="" />);
    expect(peticion).not.toHaveBeenCalled();
  });
});
