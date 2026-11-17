import { act } from "react";
import { useTienda } from "../../src/hooks/useTienda.js";
import { useCatalogoApi } from "../../src/hooks/useCatalogoApi.js";
import { CLAVE_TIENDA } from "../../src/datos/almacenamiento.js";
import { crearVista } from "../ayudas/renderizar.jsx";
import { usuariosDemostracion } from "../../src/datos/usuarios.js";

// La respuesta simulada evita depender de los tiempos de lectura de un stream real.
function respuestaJSON(texto, { status = 200 } = {}) {
  return { status, ok: status < 400, json: async () => JSON.parse(texto) };
}

describe("Tienda conectada al backend", () => {
  const vista = crearVista();
  const claveApi = "grano-tienda-api-v1";
  const base = {
    id: "id-de-java",
    nombre: "Café del servidor",
    categoria: "Café en grano",
    descripcion: "Tueste medio",
    detalle: "Bolsa de 250 g",
    precio: 9000,
    stock: 5,
    critico: 2,
    imagen: "data:image/png;base64,YQ==",
  };
  let tienda, peticion, respaldo, catalogo, atender, sesionServidor;

  function Pantalla() {
    tienda = useTienda({ apiUrl: "http://localhost:8080/api" });
    return <output>{tienda.productos.length}</output>;
  }

  beforeEach(() => {
    respaldo = localStorage.getItem(claveApi);
    localStorage.removeItem(claveApi);
    catalogo = [{ ...base }];
    sesionServidor = null;
    atender = async (url, opciones = {}) => {
      if (url.endsWith("/auth/csrf"))
        return respuestaJSON(
          JSON.stringify({ headerName: "X-CSRF-TOKEN", token: "csrf" }),
        );
      if (url.endsWith("/auth/me"))
        return respuestaJSON(
          JSON.stringify(sesionServidor || { mensaje: "Inicia sesión" }),
          { status: sesionServidor ? 200 : 401 },
        );
      if (url.endsWith("/auth/login")) {
        const datos = new URLSearchParams(opciones.body);
        const cuenta = usuariosDemostracion.find(
          (usuario) => usuario.correo === datos.get("correo"),
        );
        const { contrasena, ...publico } = cuenta;
        sesionServidor = { ...publico, id: cuenta.correo };
        return respuestaJSON(JSON.stringify(sesionServidor));
      }
      if (url.endsWith("/auth/logout")) {
        sesionServidor = null;
        return respuestaJSON(null, { status: 204 });
      }
      if (url.endsWith("/usuarios"))
        return respuestaJSON(JSON.stringify([sesionServidor]));
      if (opciones.method === "DELETE") {
        catalogo = [];
        return respuestaJSON(null, { status: 204 });
      }
      if (opciones.method) {
        const producto = {
          ...JSON.parse(opciones.body),
          id: opciones.method === "POST" ? "nuevo-java" : base.id,
        };
        catalogo = [
          ...catalogo.filter((item) => item.id !== producto.id),
          producto,
        ];
        return respuestaJSON(JSON.stringify(producto), {
          status: opciones.method === "POST" ? 201 : 200,
        });
      }
      return respuestaJSON(JSON.stringify(catalogo));
    };
    peticion = spyOn(window, "fetch").and.callFake(atender);
  });

  afterEach(() => {
    if (respaldo === null) localStorage.removeItem(claveApi);
    else localStorage.setItem(claveApi, respaldo);
  });

  it("usa el catálogo remoto sin sobrescribir la demostración local", async () => {
    const antes = localStorage.getItem(CLAVE_TIENDA);
    await vista.mostrar(<Pantalla />);
    expect(tienda.usarApi).toBeTrue();
    expect(tienda.cargandoProductos).toBeFalse();
    expect(tienda.productos.map((item) => item.id)).toEqual([base.id]);
    await act(async () => tienda.iniciar("comprador@duocuc.cl", "Cliente123"));
    await act(async () => tienda.agregar(base));
    expect(tienda.carrito[0].imagen).toBe(base.imagen);
    expect(localStorage.getItem(CLAVE_TIENDA)).toBe(antes);
    await vista.reiniciar();
    await vista.mostrar(<Pantalla />);
    expect(tienda.carrito[0].cantidad).toBe(1);
    await act(async () => tienda.cerrar());
    expect(tienda.carrito).toEqual([]);
  });

  it("no guarda contraseñas ni acepta un rol modificado en localStorage", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.iniciar("comprador@duocuc.cl", "Cliente123"));
    await act(async () => tienda.agregar(base));
    const texto = localStorage.getItem(claveApi);
    expect(texto).not.toContain("Cliente123");
    const guardado = JSON.parse(texto);
    expect(guardado.usuarios).toEqual([]);
    guardado.sesion.rol = "admin";
    localStorage.setItem(claveApi, JSON.stringify(guardado));
    await act(async () =>
      window.dispatchEvent(new StorageEvent("storage", { key: claveApi })),
    );
    expect(tienda.sesion.rol).toBe("comprador");
    await act(async () =>
      expect(await tienda.guardarProducto(base)).toBeFalse(),
    );
  });

  it("vacía el carrito de la cuenta anterior cuando el servidor informa una sesión vencida", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.iniciar("comprador@duocuc.cl", "Cliente123"));
    await act(async () => tienda.agregar(base));
    sesionServidor = null;
    await act(async () => tienda.recargarSesion());
    expect(tienda.sesion).toBeNull();
    expect(tienda.carrito).toEqual([]);
    expect(JSON.parse(localStorage.getItem(claveApi)).carrito).toEqual([]);
  });

  it("valida permisos y datos antes de pedir cambios al servidor", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => {
      expect(await tienda.guardarProducto(base)).toBeFalse();
      expect(await tienda.quitarProducto(base.id)).toBeFalse();
    });
    expect(tienda.error).toContain("administrador");
    expect(
      peticion.calls
        .allArgs()
        .filter(
          ([url, opciones]) => url.includes("/productos") && opciones.method,
        ),
    ).toHaveSize(0);
    await act(async () => tienda.iniciar("admin@duocuc.cl", "1234"));
    await act(async () =>
      expect(await tienda.guardarProducto({ ...base, precio: -1 })).toBeFalse(),
    );
    expect(
      peticion.calls
        .allArgs()
        .filter(
          ([url, opciones]) => url.includes("/productos") && opciones.method,
        ),
    ).toHaveSize(0);
  });

  it("crea con el ID del servidor, conserva la imagen al editar y elimina", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.iniciar("admin@duocuc.cl", "1234"));
    await act(async () =>
      expect(
        await tienda.guardarProducto({
          ...base,
          id: undefined,
          nombre: "Otro café",
          precio: "11000",
        }),
      ).toBeTrue(),
    );
    expect(
      tienda.productos.find((item) => item.nombre === "Otro café").id,
    ).toBe("nuevo-java");
    await act(async () =>
      expect(
        await tienda.guardarProducto({ ...base, imagen: "", precio: "12000" }),
      ).toBeTrue(),
    );
    expect(tienda.productos.find((item) => item.id === base.id).imagen).toBe(
      base.imagen,
    );
    expect(JSON.parse(peticion.calls.mostRecent().args[1].body).precio).toBe(
      12000,
    );
    await act(async () =>
      expect(await tienda.quitarProducto(base.id)).toBeTrue(),
    );
    expect(tienda.productos.some((item) => item.id === base.id)).toBeFalse();
  });

  it("conserva los productos cuando el servidor rechaza una edición y permite reintentar", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.iniciar("admin@duocuc.cl", "1234"));
    peticion.and.callFake((url, opciones) =>
      url.includes("/productos")
        ? Promise.resolve(
            respuestaJSON(JSON.stringify({ mensaje: "Nombre repetido" }), {
              status: 409,
            }),
          )
        : atender(url, opciones),
    );
    await act(async () =>
      expect(await tienda.guardarProducto(base)).toBeFalse(),
    );
    expect(tienda.errorProductos).toBe("Nombre repetido");
    expect(tienda.productos[0].precio).toBe(base.precio);
    catalogo = [];
    peticion.and.callFake(atender);
    await act(async () => tienda.recargarProductos());
    expect(tienda.errorProductos).toBe("");
    expect(tienda.productos).toEqual([]);
  });

  it("no crea pedidos locales ni renombra categorías del servidor", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.iniciar("comprador@duocuc.cl", "Cliente123"));
    await act(async () => tienda.agregar(base));
    await act(async () => expect(tienda.comprar()).toBeFalse());
    expect(tienda.pedidos).toEqual([]);
    expect(tienda.carrito).toHaveSize(1);
    expect(tienda.productos[0].stock).toBe(5);
    await act(async () =>
      expect(tienda.guardarCategoria("Café en grano", "Otro")).toBeFalse(),
    );
    expect(tienda.error).toContain("siguiente etapa");
  });

  it("actualiza precio y stock del carrito y deja de mostrar productos eliminados", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.agregar(base));
    catalogo = [{ ...base, stock: 0, precio: 15000 }];
    await act(async () => tienda.recargarProductos());
    expect(tienda.carrito[0].stock).toBe(0);
    expect(tienda.carrito[0].precio).toBe(15000);
    await act(async () => expect(tienda.agregar(base)).toBeFalse());
    catalogo = [];
    await act(async () => tienda.recargarProductos());
    expect(tienda.carrito).toEqual([]);
  });

  it("informa el backend apagado y permite volver a cargar", async () => {
    peticion.and.rejectWith(new TypeError("Failed to fetch"));
    await vista.mostrar(<Pantalla />);
    expect(tienda.errorProductos).toContain("No pudimos conectar");
    await act(async () => expect(tienda.agregar(base)).toBeFalse());
    peticion.and.callFake(atender);
    await act(async () => tienda.recargarProductos());
    expect(tienda.productos).toHaveSize(1);
    expect(tienda.errorProductos).toBe("");
  });

  it("no borra el carrito guardado al iniciar sesión si el backend está apagado", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.agregar(base));
    await vista.reiniciar();
    peticion.and.rejectWith(new TypeError("Failed to fetch"));
    await vista.mostrar(<Pantalla />);
    await act(async () => tienda.iniciar("comprador@duocuc.cl", "Cliente123"));
    expect(JSON.parse(localStorage.getItem(claveApi)).carrito).toHaveSize(1);
    peticion.and.callFake(atender);
    await act(async () => {
      tienda.recargarProductos();
      tienda.recargarSesion();
    });
    expect(tienda.carrito[0].cantidad).toBe(1);
  });

  it("rechaza respuestas con formato incorrecto y cancela lecturas al salir", async () => {
    let hook;
    function Catalogo() {
      hook = useCatalogoApi("http://localhost:8080/api");
      return null;
    }
    peticion.and.resolveTo(respuestaJSON("{}"));
    await vista.mostrar(<Catalogo />);
    expect(hook.error).toContain("formato esperado");
    let terminar;
    peticion.and.callFake(
      () =>
        new Promise((resolver) => {
          terminar = resolver;
        }),
    );
    await act(async () => hook.recargar());
    expect(hook.cargando).toBeTrue();
    await act(async () => expect(await hook.guardar(base)).toBeFalse());
    const signal = peticion.calls.mostRecent().args[1].signal;
    await vista.reiniciar();
    expect(signal.aborted).toBeTrue();
    await act(async () => terminar(respuestaJSON("[]")));
  });
});
