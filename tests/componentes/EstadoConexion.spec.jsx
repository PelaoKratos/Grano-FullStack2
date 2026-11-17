import EstadoConexion from "../../src/components/EstadoConexion.jsx";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Avisos de conexión", () => {
  const vista = crearVista();

  it("el modo local no agrega un panel vacío y conserva los errores de la tienda", async () => {
    await vista.mostrar(
      <EstadoConexion tienda={{ usarApi: false }} ruta="/" />,
    );
    expect(vista.contenedor.querySelector(".container")).toBeNull();
    await vista.mostrar(
      <EstadoConexion
        tienda={{ usarApi: false, error: "Sin espacio" }}
        ruta="/"
      />,
    );
    expect(vista.contenedor.querySelector('[role="alert"]').textContent).toBe(
      "Sin espacio",
    );
  });

  it("agrupa errores repetidos y permite actualizar cada recurso", async () => {
    const tienda = {
      usarApi: true,
      sesion: { rol: "admin" },
      errorProductos: "Sin conexión",
      errorCategorias: "Sin conexión",
      errorSesion: "Sin conexión",
      recargarProductos: jasmine.createSpy("catalogo"),
      recargarPedidos: jasmine.createSpy("pedidos"),
      recargarMensajes: jasmine.createSpy("mensajes"),
      recargarSesion: jasmine.createSpy("sesion"),
    };
    await vista.mostrar(<EstadoConexion tienda={tienda} ruta="/admin" />);
    expect(vista.contenedor.querySelectorAll('[role="alert"]')).toHaveSize(1);
    for (const boton of vista.contenedor.querySelectorAll("button"))
      await vista.clic(boton);
    expect(tienda.recargarProductos).toHaveBeenCalledTimes(1);
    expect(tienda.recargarPedidos).toHaveBeenCalledTimes(1);
    expect(tienda.recargarMensajes).toHaveBeenCalledTimes(1);
    expect(tienda.recargarSesion).toHaveBeenCalledTimes(1);
    await vista.mostrar(
      <EstadoConexion
        tienda={{
          ...tienda,
          cargandoProductos: true,
          cargandoPedidos: true,
          cargandoMensajes: true,
        }}
        ruta="/admin"
      />,
    );
    const botones = vista.contenedor.querySelectorAll("button");
    expect(botones[0].disabled).toBeTrue();
    expect(botones[1].disabled).toBeTrue();
    expect(botones[2].disabled).toBeTrue();
  });

  it("oculta controles administrativos fuera de sus pantallas y evita duplicar el error de compra", async () => {
    await vista.mostrar(
      <EstadoConexion
        tienda={{
          usarApi: true,
          sesion: { rol: "comprador" },
          errorPedidos: "Pago rechazado",
        }}
        ruta="/compra/error"
      />,
    );
    expect(vista.contenedor.querySelector('[role="alert"]')).toBeNull();
    expect(vista.contenedor.textContent).not.toContain("Actualizar mensajes");
    await vista.mostrar(
      <EstadoConexion
        tienda={{ usarApi: true, sesion: { rol: "admin" } }}
        ruta="/contacto"
      />,
    );
    expect(vista.contenedor.textContent).not.toContain("Actualizar mensajes");
    expect(vista.contenedor.textContent).not.toContain("Actualizar pedidos");
  });
});
