import {
  cargaPagina,
  usaPedidos,
  usaMensajes,
} from "../../src/datos/cargaPaginas.js";

describe("Carga de datos por página", () => {
  const base = {
    usarApi: true,
    catalogoDisponible: true,
    categoriasDisponibles: true,
    sesionVerificada: true,
    pedidosDisponibles: true,
    mensajesDisponibles: true,
  };

  it("el modo local no depende del estado de las peticiones", () => {
    expect(
      cargaPagina({ usarApi: false, cargandoProductos: true }, "/productos"),
    ).toBe("lista");
  });

  it("espera el catálogo inicial, informa su fallo y conserva la página al actualizar", () => {
    const tienda = {
      ...base,
      catalogoDisponible: false,
      cargandoProductos: true,
    };
    expect(cargaPagina(tienda, "/producto/prueba")).toBe("cargando");
    tienda.cargandoProductos = false;
    tienda.errorProductos = "Sin conexión";
    expect(cargaPagina(tienda, "/producto/prueba")).toBe("error");
    tienda.catalogoDisponible = true;
    tienda.cargandoProductos = true;
    expect(cargaPagina(tienda, "/producto/prueba")).toBe("lista");
    expect(
      cargaPagina(
        { ...base, categoriasDisponibles: false, cargandoCategorias: true },
        "/categorias",
      ),
    ).toBe("cargando");
  });

  it("los pedidos y mensajes no interrumpen formularios que no los necesitan", () => {
    const tienda = {
      ...base,
      mensajesDisponibles: false,
      cargandoMensajes: true,
      pedidosDisponibles: false,
      cargandoPedidos: true,
    };
    expect(cargaPagina(tienda, "/admin/productos")).toBe("lista");
    expect(cargaPagina(tienda, "/contacto")).toBe("lista");
    expect(cargaPagina(tienda, "/admin/mensajes")).toBe("cargando");
    expect(cargaPagina(tienda, "/cuenta")).toBe("cargando");
    expect(
      cargaPagina({ ...tienda, mensajesDisponibles: true }, "/admin/mensajes"),
    ).toBe("lista");
  });

  it("comprueba la sesión antes de abrir las páginas de cuenta y administración", () => {
    const tienda = { ...base, sesionVerificada: false, cargandoSesion: true };
    for (const ruta of ["/checkout", "/registro", "/admin/perfil", "/carrito"])
      expect(cargaPagina(tienda, ruta)).toBe("cargando");
    for (const ruta of ["/nosotros", "/blog/historia", "/contacto"])
      expect(cargaPagina(tienda, ruta)).toBe("lista");
    expect(
      cargaPagina(
        { ...tienda, cargandoSesion: false, errorSesion: "Sin conexión" },
        "/acceso",
      ),
    ).toBe("error");
  });

  it("distingue una bandeja no cargada de una bandeja vacía", () => {
    const tienda = {
      ...base,
      mensajesDisponibles: false,
      errorMensajes: "Sin conexión",
    };
    expect(cargaPagina(tienda, "/admin/mensajes")).toBe("error");
    expect(
      cargaPagina(
        { ...tienda, mensajesDisponibles: true, cargandoMensajes: true },
        "/admin/mensajes",
      ),
    ).toBe("lista");
  });

  it("asigna pedidos y mensajes a sus propias pantallas", () => {
    for (const ruta of [
      "/admin",
      "/admin/",
      "/admin/pedidos/GR-1",
      "/admin/reportes",
      "/admin/usuarios",
      "/vendedor",
      "/cuenta",
      "/compra/error",
    ])
      expect(usaPedidos(ruta)).toBeTrue();
    for (const ruta of [
      "/contacto",
      "/productos",
      "/admin/perfil",
      "/admin/mensajes",
    ])
      expect(usaPedidos(ruta)).toBeFalse();
    expect(usaMensajes("/admin/mensajes")).toBeTrue();
    expect(usaMensajes("/admin")).toBeTrue();
    expect(usaMensajes("/admin/productos")).toBeFalse();
  });
});
