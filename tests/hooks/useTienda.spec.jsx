import { act } from "react";
import { useTienda } from "../../src/hooks/useTienda.js";
import { cargarEstado, CLAVE_TIENDA } from "../../src/datos/almacenamiento.js";
import { productos } from "../../src/datos/productos.js";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Hook useTienda", () => {
  const vista = crearVista();
  let tienda;

  function PantallaDePrueba() {
    tienda = useTienda();
    return <output>{tienda.carrito.length}</output>;
  }

  beforeEach(async () => {
    const estado = cargarEstado({ getItem: () => null }, productos);
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
    await vista.mostrar(<PantallaDePrueba />);
  });

  it("actualiza el carrito y conserva el cambio al volver a montar el hook", async () => {
    await act(async () => {
      tienda.agregar(productos[0]);
    });
    expect(tienda.carrito[0].cantidad).toBe(1);
    await vista.reiniciar();
    await vista.mostrar(<PantallaDePrueba />);
    expect(tienda.carrito[0].id).toBe(productos[0].id);
    expect(tienda.carrito[0].cantidad).toBe(1);
  });

  it("consulta el stock guardado antes de añadir aunque otra pestaña lo haya cambiado", async () => {
    const estado = JSON.parse(localStorage.getItem(CLAVE_TIENDA));
    estado.productos[0].stock = 0;
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
    let resultado;
    await act(async () => {
      resultado = tienda.agregar(productos[0]);
    });
    expect(resultado).toBeFalse();
    expect(tienda.carrito.length).toBe(0);
    expect(tienda.productos[0].stock).toBe(0);
    expect(tienda.error).not.toBe("");
  });

  it("si falla el guardado mantiene el estado anterior y muestra el error", async () => {
    const antes = localStorage.getItem(CLAVE_TIENDA);
    const guardar = spyOn(Storage.prototype, "setItem").and.throwError(
      "Sin espacio",
    );
    try {
      let resultado;
      await act(async () => {
        resultado = tienda.agregar(productos[0]);
      });
      expect(resultado).toBeFalse();
      expect(tienda.carrito.length).toBe(0);
      expect(localStorage.getItem(CLAVE_TIENDA)).toBe(antes);
      expect(tienda.error).toContain("No pudimos guardar");
    } finally {
      guardar.and.callThrough();
    }
  });

  it("actualiza la pantalla cuando llega un cambio desde otra pestaña", async () => {
    const estado = JSON.parse(localStorage.getItem(CLAVE_TIENDA));
    estado.productos[0].stock = 7;
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
    await act(async () => {
      window.dispatchEvent(new StorageEvent("storage", { key: CLAVE_TIENDA }));
    });
    expect(tienda.productos[0].stock).toBe(7);
  });

  it("al cerrar sesión vacía el carrito tanto en pantalla como en el almacenamiento", async () => {
    await act(async () => {
      tienda.iniciar("comprador@duocuc.cl", "Cliente123");
    });
    await act(async () => {
      tienda.agregar(productos[0]);
    });
    await act(async () => {
      tienda.cerrar();
    });
    const guardado = JSON.parse(localStorage.getItem(CLAVE_TIENDA));
    expect(tienda.sesion).toBeNull();
    expect(tienda.carrito.length).toBe(0);
    expect(guardado.sesion).toBeNull();
    expect(guardado.carrito).toEqual([]);
  });
});
