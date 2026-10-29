import test from "node:test";
import assert from "node:assert/strict";
import { operar } from "../src/datos/operaciones.js";
import {
  cargarEstado,
  guardarEstado,
  CLAVE_TIENDA,
} from "../src/datos/almacenamiento.js";
const cafe = {
  id: "colombia",
  nombre: "Colombia",
  categoria: "Café en grano",
  descripcion: "Cacao",
  detalle: "250 g",
  precio: 10000,
  stock: 2,
  critico: 1,
  imagen: "/colombia.svg",
};
const buyer = {
  correo: "cliente@example.com",
  nombre: "Cliente",
  rol: "comprador",
  activo: true,
  contrasena: "Cliente123",
  rut: "12.345.678-5",
};
const admin = {
  correo: "operador@example.com",
  nombre: "Operador",
  rol: "admin",
  activo: true,
  contrasena: "Admin123",
};
function store(datos = {}) {
  const mapa = new Map(
    Object.entries(datos).map(([k, v]) => [k, JSON.stringify(v)]),
  );
  return {
    getItem: (k) => mapa.get(k) ?? null,
    setItem: (k, v) => mapa.set(k, v),
  };
}
function estado(rol = "comprador") {
  const e = cargarEstado(store(), [cafe]);
  e.usuarios.push(buyer, admin);
  e.sesion =
    rol === "admin" ? { ...admin } : rol === "comprador" ? { ...buyer } : null;
  return e;
}
const aplicar = (e, a) => {
  const r = operar(e, a);
  assert.notEqual(r.resultado, false, r.mensaje);
  return r.estado;
};

test("el carrito respeta stock y cantidad mínima, y puede quitar líneas", () => {
  let e = estado();
  e = aplicar(e, { tipo: "AGREGAR", id: "colombia" });
  e = aplicar(e, { tipo: "AGREGAR", id: "colombia" });
  assert.equal(operar(e, { tipo: "AGREGAR", id: "colombia" }).resultado, false);
  e = aplicar(e, { tipo: "CANTIDAD", id: "colombia", cambio: -1 });
  e = aplicar(e, { tipo: "CANTIDAD", id: "colombia", cambio: -1 });
  assert.equal(e.carrito[0].cantidad, 1);
  e = aplicar(e, { tipo: "CANTIDAD", id: "colombia", cambio: 1 });
  assert.equal(e.carrito[0].cantidad, 2);
  assert.deepEqual(aplicar(e, { tipo: "QUITAR", id: "colombia" }).carrito, []);
});
test("la compra descuenta stock, usa precio actual y conserva una instantánea histórica", () => {
  let e = aplicar(estado(), { tipo: "AGREGAR", id: "colombia" });
  e.productos = [{ ...cafe, precio: 12000 }];
  const anterior = structuredClone(e);
  const r = operar(e, {
    tipo: "COMPRAR",
    idPedido: "GR-1",
    fecha: "29-10-2026",
  });
  assert.equal(r.resultado.total, 12000);
  assert.equal(r.estado.productos[0].stock, 1);
  assert.deepEqual(r.estado.carrito, []);
  assert.deepEqual(e, anterior);
  const editado = aplicar(
    { ...r.estado, sesion: admin },
    {
      tipo: "PRODUCTO_GUARDAR",
      producto: { ...cafe, precio: 15000, imagen: "" },
    },
  );
  assert.equal(editado.pedidos[0].productos[0].precio, 12000);
});
test("un cambio de stock bloquea la compra completa sin perder el carrito", () => {
  let e = aplicar(estado(), { tipo: "AGREGAR", id: "colombia" });
  e.productos = [{ ...cafe, stock: 0 }];
  const antes = structuredClone(e);
  const r = operar(e, { tipo: "COMPRAR", idPedido: "GR-2" });
  assert.equal(r.resultado, false);
  assert.deepEqual(r.estado, antes);
  assert.equal(operar(e, { tipo: "AGREGAR", id: "colombia" }).resultado, false);
});
test("la escritura de compra guarda catálogo, pedido y carrito juntos; un fallo no altera el respaldo", () => {
  const e = aplicar(estado(), { tipo: "AGREGAR", id: "colombia" }),
    s = store();
  guardarEstado(s, e);
  const antes = s.getItem(CLAVE_TIENDA);
  let escrituras = 0;
  const nuevo = operar(e, { tipo: "COMPRAR", idPedido: "GR-3" }).estado;
  assert.throws(() =>
    guardarEstado(
      {
        setItem: () => {
          throw Error("quota");
        },
      },
      nuevo,
    ),
  );
  assert.equal(s.getItem(CLAVE_TIENDA), antes);
  guardarEstado(
    {
      setItem: (k, v) => {
        escrituras++;
        s.setItem(k, v);
      },
    },
    nuevo,
  );
  assert.equal(escrituras, 1);
  const restaurado = cargarEstado(s, [cafe]);
  assert.equal(restaurado.productos[0].stock, 1);
  assert.equal(restaurado.pedidos.length, 1);
  assert.equal(restaurado.carrito.length, 0);
});
test("administración crea, edita y elimina incluso productos base sin que reaparezcan", () => {
  let e = estado("admin");
  e = aplicar(e, {
    tipo: "PRODUCTO_GUARDAR",
    producto: { ...cafe, nombre: "Colombia editado", stock: 0, imagen: "" },
  });
  assert.equal(e.productos[0].imagen, cafe.imagen);
  e = aplicar(e, {
    tipo: "PRODUCTO_GUARDAR",
    idNuevo: "nuevo-1",
    producto: {
      ...cafe,
      id: undefined,
      nombre: "Taza",
      categoria: "Accesorios",
      imagen: "data:image/png;base64,YQ==",
    },
  });
  assert.equal(e.productos.length, 2);
  assert.equal(
    operar(e, {
      tipo: "PRODUCTO_GUARDAR",
      producto: { ...cafe, stock: -1, imagen: "" },
    }).resultado,
    false,
  );
  assert.equal(
    operar(e, {
      tipo: "PRODUCTO_GUARDAR",
      producto: { ...cafe, stock: 1.5, imagen: "" },
    }).resultado,
    false,
  );
  e.carrito = [{ ...cafe, cantidad: 1 }];
  e = aplicar(e, { tipo: "PRODUCTO_ELIMINAR", id: "colombia" });
  assert.equal(e.carrito.length, 0);
  const s = store();
  guardarEstado(s, e);
  assert.deepEqual(
    cargarEstado(s, [cafe]).productos.map((p) => p.id),
    ["nuevo-1"],
  );
  e = aplicar(e, { tipo: "PRODUCTO_ELIMINAR", id: "nuevo-1" });
  guardarEstado(s, e);
  assert.deepEqual(cargarEstado(s, [cafe]).productos, []);
});
test("rechaza imágenes no admitidas, demasiado grandes y nombres duplicados", () => {
  const e = estado("admin");
  for (const imagen of [
    "data:image/svg+xml;base64,YQ==",
    "data:image/png;base64," + "A".repeat(700000),
  ])
    assert.equal(
      operar(e, { tipo: "PRODUCTO_GUARDAR", producto: { ...cafe, imagen } })
        .resultado,
      false,
    );
  assert.equal(
    operar(e, {
      tipo: "PRODUCTO_GUARDAR",
      idNuevo: "otro",
      producto: { ...cafe, id: undefined, imagen: "" },
    }).resultado,
    false,
  );
});
test("compradores y vendedores no pueden modificar operaciones de administración", () => {
  for (const rol of ["comprador", "vendedor"]) {
    const e = estado();
    e.usuarios = [
      ...e.usuarios,
      { ...buyer, correo: "venta@example.com", rol },
    ];
    e.sesion = { ...buyer, correo: "venta@example.com", rol };
    for (const tipo of [
      "PRODUCTO_GUARDAR",
      "PRODUCTO_ELIMINAR",
      "USUARIO_GUARDAR",
      "PEDIDO_ESTADO",
      "MENSAJE_LEIDO",
    ])
      assert.equal(operar(e, { tipo }).resultado, false);
    if (rol === "vendedor") {
      e.carrito = [{ ...cafe, cantidad: 1 }];
      assert.equal(operar(e, { tipo: "COMPRAR" }).resultado, false);
    }
  }
});
test("permite cambiar roles y activar usuarios; protege administrador propio y cuentas de prueba", () => {
  let e = estado("admin");
  e = aplicar(e, {
    tipo: "USUARIO_GUARDAR",
    usuario: { ...buyer, rol: "vendedor", activo: false },
  });
  assert.equal(
    e.usuarios.find((u) => u.correo === buyer.correo).rol,
    "vendedor",
  );
  assert.equal(
    operar(e, {
      tipo: "INICIAR",
      correo: buyer.correo,
      contrasena: buyer.contrasena,
    }).resultado,
    false,
  );
  e = aplicar(e, {
    tipo: "USUARIO_GUARDAR",
    usuario: { ...buyer, rol: "vendedor", activo: true },
  });
  assert.equal(
    operar(e, {
      tipo: "INICIAR",
      correo: buyer.correo,
      contrasena: buyer.contrasena,
    }).resultado.rol,
    "vendedor",
  );
  for (const usuario of [
    { ...admin, activo: false },
    { ...admin, rol: "comprador" },
    { ...e.usuarios.find((u) => u.cuentaDemostracion), activo: false },
  ])
    assert.equal(
      operar(e, { tipo: "USUARIO_GUARDAR", usuario }).resultado,
      false,
    );
});
test("las tres cuentas de prueba inician con sus roles y no cambian contraseña", () => {
  const e = estado();
  for (const u of e.usuarios.filter((u) => u.cuentaDemostracion)) {
    assert.equal(
      operar(e, { tipo: "INICIAR", correo: u.correo, contrasena: u.contrasena })
        .resultado.rol,
      u.rol,
    );
    assert.equal(
      operar(e, {
        tipo: "CLAVE",
        correo: u.correo,
        actual: u.contrasena,
        nueva: "Otra123",
      }).resultado,
      false,
    );
  }
});
test("registro público valida RUT, evita duplicados y fuerza rol comprador", () => {
  const e = estado(null),
    u = {
      nombre: "Nueva",
      correo: "nueva@example.com",
      contrasena: "Nueva123",
      rut: "11.111.111-1",
      rol: "admin",
    };
  const nuevo = aplicar(e, { tipo: "REGISTRAR", usuario: u, entrar: true });
  assert.equal(nuevo.sesion.rol, "comprador");
  assert.equal(
    operar(nuevo, { tipo: "REGISTRAR", usuario: u, entrar: true }).resultado,
    false,
  );
  assert.equal(
    operar(e, {
      tipo: "REGISTRAR",
      usuario: { ...u, rut: "12.345.678-9" },
      entrar: true,
    }).resultado,
    false,
  );
  assert.equal(
    operar(e, { tipo: "REGISTRAR", usuario: u, entrar: false }).resultado,
    false,
  );
});
test("perfil conserva permisos, contraseña y datos de dirección; cambio de clave funciona", () => {
  let e = estado();
  e = aplicar(e, {
    tipo: "PERFIL",
    usuario: {
      ...buyer,
      nombre: "Nuevo nombre",
      rol: "admin",
      contrasena: "hack",
      comuna: "Ñuñoa",
      region: "Metropolitana",
      direccion: "Calle 1",
      telefono: "123",
    },
  });
  const u = e.usuarios.find((u) => u.correo === buyer.correo);
  assert.equal(u.rol, "comprador");
  assert.equal(u.contrasena, buyer.contrasena);
  assert.equal(u.comuna, "Ñuñoa");
  assert.equal(e.sesion.nombre, "Nuevo nombre");
  e = aplicar(e, {
    tipo: "CLAVE",
    correo: buyer.correo,
    actual: buyer.contrasena,
    nueva: "Nueva123",
  });
  assert.equal(
    operar(e, { tipo: "INICIAR", correo: buyer.correo, contrasena: "Nueva123" })
      .resultado.correo,
    buyer.correo,
  );
});
test("administración cambia estado de pedidos y marca mensajes; cerrar sesión vacía carrito", () => {
  let e = estado("admin");
  e.pedidos = [{ id: "GR-1", estado: "Recibido" }];
  e = aplicar(e, {
    tipo: "PEDIDO_ESTADO",
    id: "GR-1",
    estado: "En preparación",
  });
  assert.equal(e.pedidos[0].estado, "En preparación");
  assert.equal(
    operar(e, { tipo: "PEDIDO_ESTADO", id: "GR-1", estado: "Inválido" })
      .resultado,
    false,
  );
  e = aplicar(e, {
    tipo: "MENSAJE_ENVIAR",
    mensaje: { texto: "Hola", correo: buyer.correo },
  });
  e = aplicar(e, { tipo: "MENSAJE_LEIDO", indice: 0 });
  assert.equal(e.mensajes[0].estado, "Leído");
  e.carrito = [{ ...cafe, cantidad: 1 }];
  e = aplicar(e, { tipo: "CERRAR" });
  assert.equal(e.sesion, null);
  assert.deepEqual(e.carrito, []);
});
test("migra catálogo completo, cantidades, stock, roles, mensajes y estados desde la rama base", () => {
  const s = store({
    granoCatalogoVersion: 2,
    granoProductosReact: [{ ...cafe, id: 1, stock: 0, nombre: "Editado" }],
    granoCarritoReact: [{ id: 1, cantidad: 2 }],
    granoUsuariosReact: [{ ...buyer, rol: "vendedor", activo: false }],
    granoSesionReact: buyer,
    granoPedidosReact: [
      {
        id: "viejo",
        comprador: buyer.correo,
        total: 3000,
        estado: "Entregado",
        productos: [{ id: 1, precio: 1000, cantidad: 3 }],
      },
    ],
    granoMensajesReact: [{ texto: "Mensaje", estado: "Leído" }],
  });
  const e = cargarEstado(s, [cafe, { ...cafe, id: "etiopia" }]);
  assert.equal(e.productos.length, 1);
  assert.equal(e.productos[0].stock, 0);
  assert.equal(e.productos[0].nombre, "Editado");
  assert.equal(e.carrito[0].cantidad, 2);
  assert.equal(e.sesion, null);
  assert.equal(
    e.usuarios.find((u) => u.correo === buyer.correo).rol,
    "vendedor",
  );
  assert.equal(e.pedidos[0].total, 3000);
  assert.equal(e.pedidos[0].estado, "Entregado");
  assert.equal(e.mensajes[0].estado, "Leído");
});
test("actualiza esquema anterior sin resucitar productos personalizados eliminados", () => {
  const s = store({
    [CLAVE_TIENDA]: {
      version: 1,
      usuarios: [buyer],
      productosNuevos: [],
      carrito: [],
      pedidos: [],
      mensajes: [],
    },
    granoCatalogoVersion: 2,
    granoProductosReact: [
      { ...cafe, id: 1, stock: 4 },
      { ...cafe, id: "nuevo-borrado" },
    ],
    granoUsuariosReact: [{ ...buyer, rol: "vendedor" }],
  });
  const e = cargarEstado(s, [cafe]);
  assert.equal(e.version, 2);
  assert.equal(e.productos.length, 1);
  assert.equal(e.productos[0].stock, 4);
  assert.equal(
    e.usuarios.find((u) => u.correo === buyer.correo).rol,
    "vendedor",
  );
});
