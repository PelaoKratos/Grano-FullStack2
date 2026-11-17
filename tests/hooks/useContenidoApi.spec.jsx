import { act } from "react";
import { useCategoriasApi } from "../../src/hooks/useCategoriasApi.js";
import { useMensajesApi } from "../../src/hooks/useMensajesApi.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Categorías y contacto conectados", () => {
  const vista = crearVista();
  const admin = { id: "admin", rol: "admin" };
  let categorias, mensajes, listaCategorias, listaMensajes, atender, peticion;
  const responder = (datos, status = 200) =>
    Promise.resolve({ status, ok: status < 400, json: async () => datos });

  function Pantalla({ usuario = null, direccion = "/api" }) {
    categorias = useCategoriasApi(direccion);
    mensajes = useMensajesApi(direccion, usuario);
    return null;
  }

  beforeEach(() => {
    listaCategorias = [{ id: "cafe", nombre: "Café en grano", clave: "cafe" }];
    listaMensajes = [
      {
        id: "m1",
        nombre: "Visita",
        correo: "visita@grano.cl",
        texto: "Hola",
        estado: "Nuevo",
      },
    ];
    atender = (url, opciones = {}) => {
      if (url.endsWith("/csrf"))
        return responder({ headerName: "X-CSRF-TOKEN", token: "csrf" });
      if (url.endsWith("/categorias") && !opciones.method)
        return responder(listaCategorias);
      if (url.endsWith("/mensajes") && !opciones.method)
        return responder(listaMensajes);
      if (url.includes("/categorias")) {
        const id = url.endsWith("/categorias")
          ? "nueva"
          : url.split("/").at(-1);
        if (opciones.method === "DELETE") {
          listaCategorias = listaCategorias.filter((item) => item.id !== id);
          return responder(null, 204);
        }
        const categoria = { id, nombre: JSON.parse(opciones.body).nombre };
        listaCategorias = [
          ...listaCategorias.filter((item) => item.id !== id),
          categoria,
        ];
        return responder(categoria);
      }
      if (url.endsWith("/mensajes")) {
        const mensaje = {
          ...JSON.parse(opciones.body),
          id: "m2",
          estado: "Nuevo",
        };
        listaMensajes = [mensaje, ...listaMensajes];
        return responder(mensaje, 201);
      }
      const id = url.split("/").at(-2);
      const mensaje = {
        ...listaMensajes.find((item) => item.id === id),
        estado: "Leído",
      };
      listaMensajes = listaMensajes.map((item) =>
        item.id === id ? mensaje : item,
      );
      return responder(mensaje);
    };
    peticion = spyOn(window, "fetch").and.callFake(atender);
  });

  it("crea, renombra y elimina usando las ID del servidor", async () => {
    await vista.mostrar(<Pantalla />);
    await act(async () =>
      expect(await categorias.guardar("", " Métodos ")).toBeTrue(),
    );
    expect(
      categorias.categorias.find((item) => item.id === "nueva").nombre,
    ).toBe("Métodos");
    await act(async () =>
      expect(await categorias.guardar("Café en grano", "Orígenes")).toBeTrue(),
    );
    expect(
      categorias.categorias.find((item) => item.id === "cafe").nombre,
    ).toBe("Orígenes");
    await act(async () =>
      expect(await categorias.eliminar("Orígenes")).toBeTrue(),
    );
    expect(categorias.categorias).toHaveSize(1);
    await act(async () =>
      expect(await categorias.guardar("Eliminada", "Otra")).toBeFalse(),
    );
    await act(async () =>
      expect(await categorias.eliminar("Eliminada")).toBeFalse(),
    );
  });

  it("no quita categorías de la pantalla si el servidor rechaza eliminarlas", async () => {
    await vista.mostrar(<Pantalla />);
    peticion.and.callFake((url, opciones) =>
      opciones.method === "DELETE"
        ? responder({ mensaje: "Tiene productos" }, 409)
        : atender(url, opciones),
    );
    await act(async () =>
      expect(await categorias.eliminar("Café en grano")).toBeFalse(),
    );
    expect(categorias.error).toBe("Tiene productos");
    expect(categorias.categorias).toHaveSize(1);
    peticion.and.callFake(atender);
    await act(async () => categorias.recargar());
    expect(categorias.error).toBe("");
  });

  it("no reemplaza un cambio de categoría con una lectura mientras guarda", async () => {
    await vista.mostrar(<Pantalla />);
    let terminar, cambio;
    peticion.and.callFake((url, opciones) =>
      opciones.method === "PUT"
        ? new Promise((resolver) => {
            terminar = async () => resolver(await atender(url, opciones));
          })
        : atender(url, opciones),
    );
    await act(async () => {
      cambio = categorias.guardar("Café en grano", "Orígenes");
    });
    const cantidad = peticion.calls.count();
    await act(async () => {
      categorias.recargar();
      expect(await categorias.eliminar("Café en grano")).toBeFalse();
    });
    expect(peticion.calls.count()).toBe(cantidad);
    await act(async () => {
      await terminar();
      expect(await cambio).toBeTrue();
    });
    expect(categorias.categorias[0].nombre).toBe("Orígenes");
  });

  it("un visitante envía contacto y la bandeja solo se carga para administración", async () => {
    await vista.mostrar(<Pantalla />);
    expect(
      peticion.calls.allArgs().some(([url]) => url.endsWith("/mensajes")),
    ).toBeFalse();
    await act(async () =>
      expect(
        await mensajes.enviar({
          nombre: "Visita",
          correo: "visita@grano.cl",
          texto: "Consulta",
        }),
      ).toBeTrue(),
    );
    expect(mensajes.mensajes).toEqual([]);
    await vista.mostrar(<Pantalla usuario={admin} />);
    expect(mensajes.mensajes).toHaveSize(2);
    await act(async () => expect(await mensajes.marcar("m1")).toBeTrue());
    expect(mensajes.mensajes.find((item) => item.id === "m1").estado).toBe(
      "Leído",
    );
    expect(mensajes.mensajes.find((item) => item.id === "m2").estado).toBe(
      "Nuevo",
    );
    await vista.mostrar(
      <Pantalla usuario={{ id: "cliente", rol: "comprador" }} />,
    );
    expect(mensajes.mensajes).toEqual([]);
  });

  it("conserva mensajes si falla la marca y permite volver a consultar", async () => {
    await vista.mostrar(<Pantalla usuario={admin} />);
    peticion.and.callFake((url, opciones) =>
      opciones.method === "PUT"
        ? responder({ mensaje: "No disponible" }, 503)
        : atender(url, opciones),
    );
    await act(async () => expect(await mensajes.marcar("m1")).toBeFalse());
    expect(mensajes.mensajes[0].estado).toBe("Nuevo");
    expect(mensajes.error).toBe("No disponible");
    peticion.and.callFake(atender);
    await act(async () => mensajes.recargar());
    expect(mensajes.error).toBe("");
  });

  it("evita enviar contacto dos veces mientras espera la respuesta", async () => {
    await vista.mostrar(<Pantalla />);
    let terminar, envio;
    peticion.and.callFake((url, opciones) =>
      opciones.method === "POST"
        ? new Promise((resolver) => {
            terminar = async () => resolver(await atender(url, opciones));
          })
        : atender(url, opciones),
    );
    const datos = {
      nombre: "Visita",
      correo: "visita@grano.cl",
      texto: "Hola",
    };
    await act(async () => {
      envio = mensajes.enviar(datos);
    });
    await act(async () => {
      mensajes.recargar();
      expect(await mensajes.enviar(datos)).toBeFalse();
    });
    expect(
      peticion.calls
        .allArgs()
        .filter(([, opciones]) => opciones.method === "POST"),
    ).toHaveSize(1);
    await act(async () => {
      await terminar();
      expect(await envio).toBeTrue();
    });
  });

  it("informa formatos de respuesta incorrectos, cancela al salir y respeta el modo local", async () => {
    peticion.and.callFake((url) =>
      url.endsWith("/categorias") || url.endsWith("/mensajes")
        ? responder({})
        : atender(url),
    );
    await vista.mostrar(<Pantalla usuario={admin} />);
    expect(categorias.error).toContain("leer las categorías");
    expect(mensajes.error).toContain("leer los mensajes");
    let resolver;
    peticion.and.callFake(
      () =>
        new Promise((terminar) => {
          resolver = terminar;
        }),
    );
    await act(async () => categorias.recargar());
    const signal = peticion.calls.mostRecent().args[1].signal;
    await vista.reiniciar();
    expect(signal.aborted).toBeTrue();
    await act(async () =>
      resolver({ status: 200, ok: true, json: async () => [] }),
    );
    peticion.calls.reset();
    await vista.mostrar(<Pantalla direccion="" />);
    expect(peticion).not.toHaveBeenCalled();
  });
});
