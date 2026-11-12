import { crearVista } from "../ayudas/renderizar.jsx";
import App from "../../src/App.jsx";
import { cargarEstado, CLAVE_TIENDA } from "../../src/datos/almacenamiento.js";
import { productos } from "../../src/datos/productos.js";

describe("Navegación y registro de cuentas", () => {
  const vista = crearVista();

  beforeEach(() => {
    const estado = cargarEstado({ getItem: () => null }, productos);
    localStorage.setItem(CLAVE_TIENDA, JSON.stringify(estado));
  });

  it("permite ir del login al registro y volver conservando el destino", async () => {
    await vista.mostrar(<App />, "/acceso?destino=carrito");
    expect(vista.contenedor.querySelector("#login-correo")).not.toBeNull();
    expect(vista.contenedor.querySelector("#registro-nombre")).toBeNull();
    await vista.clic(
      vista.contenedor.querySelector(
        'main a[href="/registro?destino=carrito"]',
      ),
    );
    expect(vista.contenedor.querySelector("#login-correo")).toBeNull();
    expect(vista.contenedor.querySelector("#registro-nombre")).not.toBeNull();
    await vista.clic(
      vista.contenedor.querySelector('main a[href="/acceso?destino=carrito"]'),
    );
    expect(vista.contenedor.querySelector("#login-correo")).not.toBeNull();
    expect(vista.contenedor.querySelector("#registro-nombre")).toBeNull();
  });

  it("el enlace antiguo de registro abre la nueva página", async () => {
    await vista.mostrar(<App />, "/acceso?registro&destino=carrito");
    expect(vista.contenedor.querySelector("#registro-nombre")).not.toBeNull();
    expect(vista.contenedor.querySelector("#login-correo")).toBeNull();
    expect(
      vista.contenedor.querySelector('main a[href="/acceso?destino=carrito"]'),
    ).not.toBeNull();
  });

  it("valida el registro y abre la sesión nueva regresando al carrito", async () => {
    await vista.mostrar(<App />, "/registro?destino=carrito");
    await vista.escribir("#registro-nombre", "Cliente nuevo");
    await vista.escribir("#registro-correo", "nuevo-grano@example.test");
    await vista.escribir("#registro-rut", "12.345.678-4");
    await vista.escribir("#registro-contrasena", "Prueba123");
    await vista.escribir("#registro-confirmacion", "Distinta123");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain("Ingresa un RUT válido");
    expect(JSON.parse(localStorage.getItem(CLAVE_TIENDA)).sesion).toBeNull();

    await vista.escribir("#registro-rut", "12.345.678-5");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain(
      "Las contraseñas no coinciden",
    );
    expect(JSON.parse(localStorage.getItem(CLAVE_TIENDA)).sesion).toBeNull();

    await vista.escribir("#registro-confirmacion", "Prueba123");
    await vista.enviar();
    expect(JSON.parse(localStorage.getItem(CLAVE_TIENDA)).sesion.correo).toBe(
      "nuevo-grano@example.test",
    );
    expect(vista.contenedor.querySelector("main h1").textContent).toBe(
      "Carrito",
    );
  });

  it("permite iniciar sesión desde la página individual y regresar al carrito", async () => {
    await vista.mostrar(<App />, "/acceso?destino=carrito");
    await vista.escribir("#login-correo", "comprador@duocuc.cl");
    await vista.escribir("#login-contrasena", "incorrecta");
    await vista.enviar();
    expect(vista.contenedor.textContent).toContain(
      "Correo o contraseña incorrectos",
    );
    await vista.escribir("#login-contrasena", "Cliente123");
    await vista.enviar();
    expect(JSON.parse(localStorage.getItem(CLAVE_TIENDA)).sesion.rol).toBe(
      "comprador",
    );
    expect(vista.contenedor.querySelector("main h1").textContent).toBe(
      "Carrito",
    );
  });
});
