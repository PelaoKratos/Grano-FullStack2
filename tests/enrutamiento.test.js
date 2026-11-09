import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";
import { CLAVE_TIENDA } from "../src/datos/almacenamiento.js";
import { usuariosDemostracion } from "../src/datos/usuarios.js";

let servidor, App, productos;
before(async () => {
  servidor = await createServer({
    cacheDir: "node_modules/.vite-tests",
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: "custom",
    logLevel: "error",
  });
  ({ default: App } = await servidor.ssrLoadModule("/src/App.jsx"));
  ({ productos } = await servidor.ssrLoadModule("/src/datos/productos.js"));
});
after(async () => {
  await servidor?.close();
  delete globalThis.window;
});

// Render the real route tree, including lazy panels, without a browser or HTTP server.
async function pantalla(ruta, rol) {
  const sesion = usuariosDemostracion.find((u) => u.rol === rol) || null;
  const estado = JSON.stringify({
    version: 2,
    productos,
    usuarios: [],
    sesion,
    carrito: [],
    pedidos: [],
    mensajes: [],
  });
  globalThis.window = {
    localStorage: {
      getItem: (clave) => (clave === CLAVE_TIENDA ? estado : null),
    },
  };
  const stream = await renderToReadableStream(
    createElement(MemoryRouter, { initialEntries: [ruta] }, createElement(App)),
  );
  await stream.allReady;
  const html = await new Response(stream).text();
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || "";
}

test("React Router abre el catálogo con filtros y enlaces de detalle", async () => {
  const html = await pantalla("/productos?categoria=metodos");
  assert.match(html, /Dripper cerámico/);
  assert.match(html, /Prensa francesa/);
  assert.doesNotMatch(html, /Origen Colombia/);
  assert.match(html, /href="\/producto\/dripper"/);
});

test("la ruta dinámica identifica el producto y contempla productos ausentes", async () => {
  assert.match(await pantalla("/producto/etiopia"), /Tueste claro/);
  assert.match(
    await pantalla("/producto/no-existe"),
    /Este producto no está disponible/,
  );
});

test("las rutas desconocidas y los segmentos extra muestran la página no encontrada", async () => {
  for (const ruta of [
    "/no-existe",
    "/producto/etiopia/extra",
    "/vendedor/extra",
  ]) {
    assert.match(await pantalla(ruta), /No encontramos esta página/);
  }
});

test("las rutas privadas no exponen paneles sin sesión", async () => {
  for (const ruta of ["/admin", "/admin/productos", "/cuenta", "/vendedor"]) {
    assert.match(await pantalla(ruta), /Inicia sesión para continuar/);
  }
});

test("administración resuelve sus subrutas y marca la sección activa", async () => {
  for (const [seccion, titulo] of [
    ["productos", "Productos y stock"],
    ["pedidos", "Pedidos"],
    ["usuarios", "Usuarios"],
    ["mensajes", "Mensajes"],
  ]) {
    const html = await pantalla(`/admin/${seccion}`, "admin");
    assert.match(html, new RegExp(titulo));
    assert.match(
      html,
      new RegExp(`aria-current="page"[^>]*href="/admin/${seccion}"`),
    );
  }
  assert.match(
    await pantalla("/admin/seccion-inexistente", "admin"),
    /No encontramos esta sección/,
  );
});

test("cada rol accede a su panel y no puede entrar a los paneles ajenos", async () => {
  assert.match(await pantalla("/cuenta", "comprador"), /Mis datos/);
  assert.match(
    await pantalla("/vendedor", "vendedor"),
    /Disponibilidad de productos/,
  );
  assert.match(
    await pantalla("/vendedor", "admin"),
    /Disponibilidad de productos/,
  );
  for (const [ruta, rol] of [
    ["/admin/productos", "comprador"],
    ["/admin/usuarios", "vendedor"],
    ["/cuenta", "vendedor"],
    ["/vendedor", "comprador"],
  ]) {
    assert.match(await pantalla(ruta, rol), /No tienes acceso a esta sección/);
  }
});

test("crear cuenta y volver al acceso conservan el destino del carrito", async () => {
  assert.match(
    await pantalla("/acceso?destino=carrito"),
    /href="\/registro\?destino=carrito"/,
  );
  assert.match(
    await pantalla("/registro?destino=carrito"),
    /href="\/acceso\?destino=carrito"/,
  );
});

test("las nuevas vistas públicas resuelven categorías, ofertas y artículos", async () => {
  assert.match(await pantalla("/categorias"), /Café en grano/);
  assert.match(await pantalla("/ofertas"), /Por ahora no hay ofertas/);
  assert.match(await pantalla("/blog"), /Elegir un café por sus notas/);
  assert.match(
    await pantalla("/blog/elegir-por-sabor"),
    /ingredientes añadidos/,
  );
  assert.match(
    await pantalla("/blog/desconocido"),
    /No encontramos esta historia/,
  );
});

test("checkout y comprobantes requieren comprador y no exponen pedidos ajenos", async () => {
  for (const ruta of [
    "/checkout",
    "/compra/error",
    "/compra/confirmada/GR-AJENO",
  ]) {
    assert.match(await pantalla(ruta), /Inicia sesión para continuar/);
    assert.match(await pantalla(ruta, "vendedor"), /No tienes acceso/);
  }
  assert.match(
    await pantalla("/compra/confirmada/GR-AJENO", "comprador"),
    /No encontramos el resumen/,
  );
});

test("categorías, reportes y perfil administrativo conservan permisos y navegación", async () => {
  for (const [ruta, titulo] of [
    ["categorias", /Categorías del catálogo/],
    ["reportes", /Reportes de la tienda/],
    ["perfil", /Mis datos/],
  ]) {
    assert.match(await pantalla(`/admin/${ruta}`, "admin"), titulo);
    assert.match(
      await pantalla(`/admin/${ruta}`, "comprador"),
      /No tienes acceso/,
    );
  }
});
