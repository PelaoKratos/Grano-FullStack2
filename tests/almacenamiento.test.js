import test from "node:test";
import assert from "node:assert/strict";
import {
  CLAVE_TIENDA,
  cargarEstado,
  guardarEstado,
  normalizarCarrito,
  totalCarrito,
} from "../src/datos/almacenamiento.js";
import { leerRuta, rutasAnteriores } from "../src/datos/rutas.js";
import { esRutValido } from "../src/datos/rut.js";
const catalogo = [
  {
    id: "colombia",
    nombre: "Origen Colombia",
    precio: 12990,
    imagen: "/colombia.svg",
  },
  {
    id: "etiopia",
    nombre: "Origen Etiopía",
    precio: 14990,
    imagen: "/etiopia.svg",
  },
];
function storage(datos = {}) {
  const map = new Map(
    Object.entries(datos).map(([k, v]) => [k, JSON.stringify(v)]),
  );
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    map,
  };
}
const buyer = {
  nombre: "Comprador",
  correo: "cliente@example.com",
  contrasena: "prueba123",
  rol: "comprador",
  comuna: "Ñuñoa",
  region: "Metropolitana",
};

test("migra carrito HTML con cantidades y conserva perfil, sesión e historial", () => {
  const store = storage({
    "carrito-grano": [
      {
        id: "colombia",
        nombre: "Origen Colombia",
        precio: 12990,
        cantidad: 3,
        imagen: "assets/colombia.svg",
      },
    ],
    "usuarios-grano": [buyer],
    "sesion-grano": buyer,
    "pedidos-grano": [
      {
        id: "GR-1",
        comprador: buyer.correo,
        total: 20000,
        productos: [
          {
            id: "colombia",
            nombre: "Origen Colombia",
            precio: 10000,
            cantidad: 2,
          },
        ],
      },
    ],
  });
  const estado = cargarEstado(store, catalogo);
  assert.equal(totalCarrito(estado.carrito), 38970);
  assert.equal(estado.carrito[0].imagen, "/colombia.svg");
  assert.equal(
    estado.usuarios.find((u) => u.correo === buyer.correo).comuna,
    "Ñuñoa",
  );
  assert.equal(estado.sesion.correo, buyer.correo);
  assert.equal(estado.pedidos[0].productos[0].precio, 10000);
  assert.equal(estado.pedidos[0].total, 20000);
  guardarEstado(store, estado);
  assert.equal(store.map.has("usuarios-grano"), true);
});
test("convierte IDs numéricos y artículos repetidos de la práctica React", () => {
  const store = storage({
    granoCarritoReact: [
      { id: 2, precio: 14990 },
      { id: 2, precio: 14990 },
    ],
  });
  const estado = cargarEstado(store, catalogo);
  assert.equal(estado.carrito.length, 1);
  assert.equal(estado.carrito[0].id, "etiopia");
  assert.equal(estado.carrito[0].cantidad, 2);
  assert.equal(totalCarrito(estado.carrito), 29980);
});
test("combina usuarios de ambas versiones y prioriza datos del sitio principal", () => {
  const estado = cargarEstado(
    storage({
      "usuarios-grano": [buyer],
      granoUsuariosReact: [
        { ...buyer, nombre: "Viejo" },
        { ...buyer, correo: "otro@example.com" },
      ],
    }),
    catalogo,
  );
  assert.equal(
    estado.usuarios.filter((u) => u.correo === buyer.correo).length,
    1,
  );
  assert.equal(
    estado.usuarios.find((u) => u.correo === buyer.correo).nombre,
    "Comprador",
  );
  assert.ok(estado.usuarios.find((u) => u.correo === "otro@example.com"));
});
test("un carrito vaciado y un producto eliminado no reaparecen al recargar", () => {
  const store = storage({
    "carrito-grano": [{ id: "colombia", precio: 12990 }],
    granoProductosReact: [{ id: "nuevo-1", nombre: "Temporal", precio: 5000 }],
  });
  const estado = cargarEstado(store, catalogo);
  guardarEstado(store, {
    ...estado,
    carrito: [],
    productos: estado.productos.filter((p) => p.id !== "nuevo-1"),
  });
  const restored = cargarEstado(store, catalogo);
  assert.deepEqual(restored.carrito, []);
  assert.equal(
    restored.productos.some((p) => p.id === "nuevo-1"),
    false,
  );
});
test("JSON dañado, usuarios inválidos y cantidades inválidas no rompen la tienda", () => {
  const store = storage({
    "usuarios-grano": [null, { correo: 7 }],
    "carrito-grano": [
      { id: "colombia", precio: 12990, cantidad: -1 },
      { id: "colombia", precio: "NaN" },
      null,
    ],
  });
  store.map.set(CLAVE_TIENDA, "{invalido");
  const estado = cargarEstado(store, catalogo);
  assert.equal(estado.usuarios.length, 3);
  assert.deepEqual(estado.carrito, []);
});
test("una escritura rechazada no destruye el pedido guardado anteriormente", () => {
  const store = storage({
    [CLAVE_TIENDA]: {
      version: 1,
      usuarios: [buyer],
      pedidos: [],
      carrito: [{ id: "colombia", precio: 12990, cantidad: 1 }],
    },
  });
  const before = store.getItem(CLAVE_TIENDA);
  const bloqueado = {
    ...store,
    setItem: () => {
      throw new Error("quota");
    },
  };
  assert.throws(() =>
    guardarEstado(bloqueado, {
      version: 1,
      usuarios: [],
      carrito: [],
      pedidos: [{ id: "nuevo" }],
    }),
  );
  assert.equal(store.getItem(CLAVE_TIENDA), before);
});
test("rutas compartibles y enlaces anteriores conservan detalle y filtros", () => {
  assert.equal(rutasAnteriores["producto-colombia.html"], "/producto/colombia");
  const ruta = leerRuta("#/productos?categoria=metodos");
  assert.equal(ruta.path, "/productos");
  assert.equal(ruta.params.get("categoria"), "metodos");
  assert.equal(leerRuta("").path, "/");
  assert.equal(leerRuta("#inicio").path, "/");
  assert.equal(leerRuta("#login").path, "/acceso");
  assert.equal(leerRuta("#producto/1").path, "/producto/colombia");
  assert.equal(leerRuta("#admin/productos").path, "/admin/productos");
  assert.equal(leerRuta("#registro").path, "/registro");
  assert.equal(leerRuta("#cambiar-clave").path, "/cambiar-clave");
});
test("el registro mantiene la validación del dígito verificador del RUT", () => {
  assert.equal(esRutValido("12.345.678-5"), true);
  assert.equal(esRutValido("12.345.678-9"), false);
});
