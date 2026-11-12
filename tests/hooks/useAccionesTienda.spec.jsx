import { act } from "react";
import { useLocation } from "react-router-dom";
import { useAccionesTienda } from "../../src/hooks/useAccionesTienda.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Hook useAccionesTienda", () => {
  const vista = crearVista();
  let tienda, acciones, ruta;

  function PantallaDePrueba() {
    acciones = useAccionesTienda(tienda);
    ruta = useLocation();
    return <output>{ruta.pathname}</output>;
  }

  beforeEach(() => {
    tienda = {
      carrito: [{ id: "cafe", nombre: "Café", precio: 1000, cantidad: 2 }],
      iniciar: jasmine.createSpy("iniciar"),
      registrar: jasmine.createSpy("registrar"),
      comprar: jasmine.createSpy("comprar"),
      agregar: jasmine.createSpy("agregar"),
      cerrar: jasmine.createSpy("cerrar"),
    };
  });

  for (const [rol, destino] of [
    ["admin", "/admin"],
    ["vendedor", "/vendedor"],
    ["comprador", "/carrito"],
  ]) {
    it(`dirige al ${rol} a ${destino} después de iniciar sesión`, async () => {
      tienda.iniciar.and.returnValue({ nombre: "Prueba", rol });
      await vista.mostrar(<PantallaDePrueba />, "/acceso?destino=carrito");
      await act(async () => {
        acciones.iniciarSesion("cuenta@example.test", "Clave123");
      });
      expect(tienda.iniciar).toHaveBeenCalledOnceWith(
        "cuenta@example.test",
        "Clave123",
      );
      expect(ruta.pathname).toBe(destino);
    });
  }

  it("mantiene la página de acceso si se rechazan las credenciales", async () => {
    tienda.iniciar.and.returnValue(false);
    await vista.mostrar(<PantallaDePrueba />, "/acceso");
    await act(async () => {
      acciones.iniciarSesion("cuenta@example.test", "incorrecta");
    });
    expect(ruta.pathname).toBe("/acceso");
  });

  it("no navega ni abre la cuenta si el registro es rechazado", async () => {
    tienda.registrar.and.returnValue(false);
    const usuario = { correo: "duplicado@example.test" };
    await vista.mostrar(<PantallaDePrueba />, "/registro?destino=carrito");
    let resultado;
    await act(async () => {
      resultado = acciones.registrarComprador(usuario);
    });
    expect(resultado).toBeFalse();
    expect(tienda.registrar).toHaveBeenCalledOnceWith(usuario, true);
    expect(ruta.pathname).toBe("/registro");
  });

  it("abre el comprobante solo cuando la compra devuelve un pedido", async () => {
    tienda.comprar.and.returnValue({ id: "GR-PRUEBA" });
    await vista.mostrar(<PantallaDePrueba />, "/checkout");
    await act(async () => {
      acciones.realizarCompra({ metodo: "retiro" }, "aprobado");
    });
    expect(ruta.pathname).toBe("/compra/confirmada/GR-PRUEBA");
    expect(acciones.mensajeCompra).toContain("GR-PRUEBA");
  });

  it("el rechazo conserva un resumen del intento para mostrar el error y reintentar", async () => {
    tienda.comprar.and.returnValue(false);
    await vista.mostrar(<PantallaDePrueba />, "/checkout");
    const entrega = { metodo: "retiro" };
    await act(async () => {
      acciones.realizarCompra(entrega, "rechazado");
    });
    expect(ruta.pathname).toBe("/compra/error");
    expect(ruta.state.resumen.total).toBe(2000);
    expect(ruta.state.resumen.productos).toEqual(tienda.carrito);
    expect(ruta.state.resumen.productos[0]).not.toBe(tienda.carrito[0]);
    expect(ruta.state.mensaje).toContain("rechazado");
  });

  it("muestra el aviso solo al agregar y lo limpia al confirmar el cierre de sesión", async () => {
    await vista.mostrar(<PantallaDePrueba />);
    const producto = tienda.carrito[0];
    tienda.agregar.and.returnValue(false);
    await act(async () => {
      acciones.agregarProducto(producto);
    });
    expect(acciones.aviso).toBe("");
    tienda.agregar.and.returnValue(true);
    await act(async () => {
      acciones.agregarProducto(producto);
    });
    expect(acciones.aviso).toContain("Café añadido");
    tienda.cerrar.and.returnValue(false);
    await act(async () => {
      acciones.cerrarSesion();
    });
    expect(acciones.aviso).not.toBe("");
    tienda.cerrar.and.returnValue(true);
    await act(async () => {
      acciones.cerrarSesion();
    });
    expect(acciones.aviso).toBe("");
  });
});
