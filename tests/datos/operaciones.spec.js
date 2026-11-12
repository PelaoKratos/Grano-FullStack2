import { operar } from "../../src/datos/operaciones.js";
import {
  cargarEstado,
  guardarEstado,
  CLAVE_TIENDA,
} from "../../src/datos/almacenamiento.js";

describe("Reglas de operaciones", () => {
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
      rol === "admin"
        ? { ...admin }
        : rol === "comprador"
          ? { ...buyer }
          : null;
    return e;
  }
  const aplicar = (e, a) => {
    const r = operar(e, a);
    expect(r.resultado)
      .withContext(String(r.mensaje || "La operación debería completarse"))
      .not.toBe(false);
    return r.estado;
  };

  it("el carrito respeta stock y cantidad mínima, y puede quitar líneas", () => {
    let e = estado();
    e = aplicar(e, { tipo: "AGREGAR", id: "colombia" });
    e = aplicar(e, { tipo: "AGREGAR", id: "colombia" });
    expect(operar(e, { tipo: "AGREGAR", id: "colombia" }).resultado).toBe(
      false,
    );
    e = aplicar(e, { tipo: "CANTIDAD", id: "colombia", cambio: -1 });
    e = aplicar(e, { tipo: "CANTIDAD", id: "colombia", cambio: -1 });
    expect(e.carrito[0].cantidad).toBe(1);
    e = aplicar(e, { tipo: "CANTIDAD", id: "colombia", cambio: 1 });
    expect(e.carrito[0].cantidad).toBe(2);
    expect(aplicar(e, { tipo: "QUITAR", id: "colombia" }).carrito).toEqual([]);
  });
  it("la compra descuenta stock, usa precio actual y conserva una instantánea histórica", () => {
    let e = aplicar(estado(), { tipo: "AGREGAR", id: "colombia" });
    e.productos = [{ ...cafe, precio: 12000 }];
    const anterior = structuredClone(e);
    const r = operar(e, {
      tipo: "COMPRAR",
      idPedido: "GR-1",
      fecha: "29-10-2026",
    });
    expect(r.resultado.total).toBe(12000);
    expect(r.estado.productos[0].stock).toBe(1);
    expect(r.estado.carrito).toEqual([]);
    expect(e).toEqual(anterior);
    const editado = aplicar(
      { ...r.estado, sesion: admin },
      {
        tipo: "PRODUCTO_GUARDAR",
        producto: { ...cafe, precio: 15000, imagen: "" },
      },
    );
    expect(editado.pedidos[0].productos[0].precio).toBe(12000);
  });
  it("un cambio de stock bloquea la compra completa sin perder el carrito", () => {
    let e = aplicar(estado(), { tipo: "AGREGAR", id: "colombia" });
    e.productos = [{ ...cafe, stock: 0 }];
    const antes = structuredClone(e);
    const r = operar(e, { tipo: "COMPRAR", idPedido: "GR-2" });
    expect(r.resultado).toBe(false);
    expect(r.estado).toEqual(antes);
    expect(operar(e, { tipo: "AGREGAR", id: "colombia" }).resultado).toBe(
      false,
    );
  });
  it("la escritura de compra guarda catálogo, pedido y carrito juntos; un fallo no altera el respaldo", () => {
    const e = aplicar(estado(), { tipo: "AGREGAR", id: "colombia" }),
      s = store();
    guardarEstado(s, e);
    const antes = s.getItem(CLAVE_TIENDA);
    let escrituras = 0;
    const nuevo = operar(e, { tipo: "COMPRAR", idPedido: "GR-3" }).estado;
    expect(() =>
      guardarEstado(
        {
          setItem: () => {
            throw Error("quota");
          },
        },
        nuevo,
      ),
    ).toThrow();
    expect(s.getItem(CLAVE_TIENDA)).toBe(antes);
    guardarEstado(
      {
        setItem: (k, v) => {
          escrituras++;
          s.setItem(k, v);
        },
      },
      nuevo,
    );
    expect(escrituras).toBe(1);
    const restaurado = cargarEstado(s, [cafe]);
    expect(restaurado.productos[0].stock).toBe(1);
    expect(restaurado.pedidos.length).toBe(1);
    expect(restaurado.carrito.length).toBe(0);
  });
  it("administración crea, edita y elimina incluso productos base sin que reaparezcan", () => {
    let e = estado("admin");
    e = aplicar(e, {
      tipo: "PRODUCTO_GUARDAR",
      producto: { ...cafe, nombre: "Colombia editado", stock: 0, imagen: "" },
    });
    expect(e.productos[0].imagen).toBe(cafe.imagen);
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
    expect(e.productos.length).toBe(2);
    expect(
      operar(e, {
        tipo: "PRODUCTO_GUARDAR",
        producto: { ...cafe, stock: -1, imagen: "" },
      }).resultado,
    ).toBe(false);
    expect(
      operar(e, {
        tipo: "PRODUCTO_GUARDAR",
        producto: { ...cafe, stock: 1.5, imagen: "" },
      }).resultado,
    ).toBe(false);
    e.carrito = [{ ...cafe, cantidad: 1 }];
    e = aplicar(e, { tipo: "PRODUCTO_ELIMINAR", id: "colombia" });
    expect(e.carrito.length).toBe(0);
    const s = store();
    guardarEstado(s, e);
    expect(cargarEstado(s, [cafe]).productos.map((p) => p.id)).toEqual([
      "nuevo-1",
    ]);
    e = aplicar(e, { tipo: "PRODUCTO_ELIMINAR", id: "nuevo-1" });
    guardarEstado(s, e);
    expect(cargarEstado(s, [cafe]).productos).toEqual([]);
  });
  it("rechaza imágenes no admitidas, demasiado grandes y nombres duplicados", () => {
    const e = estado("admin");
    for (const imagen of [
      "data:image/svg+xml;base64,YQ==",
      "data:image/png;base64," + "A".repeat(700000),
    ])
      expect(
        operar(e, { tipo: "PRODUCTO_GUARDAR", producto: { ...cafe, imagen } })
          .resultado,
      ).toBe(false);
    expect(
      operar(e, {
        tipo: "PRODUCTO_GUARDAR",
        idNuevo: "otro",
        producto: { ...cafe, id: undefined, imagen: "" },
      }).resultado,
    ).toBe(false);
  });
  it("compradores y vendedores no pueden modificar operaciones de administración", () => {
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
        expect(operar(e, { tipo }).resultado).toBe(false);
      if (rol === "vendedor") {
        e.carrito = [{ ...cafe, cantidad: 1 }];
        expect(operar(e, { tipo: "COMPRAR" }).resultado).toBe(false);
      }
    }
  });
  it("permite cambiar roles y activar usuarios; protege administrador propio y cuentas de prueba", () => {
    let e = estado("admin");
    e = aplicar(e, {
      tipo: "USUARIO_GUARDAR",
      usuario: { ...buyer, rol: "vendedor", activo: false },
    });
    expect(e.usuarios.find((u) => u.correo === buyer.correo).rol).toBe(
      "vendedor",
    );
    expect(
      operar(e, {
        tipo: "INICIAR",
        correo: buyer.correo,
        contrasena: buyer.contrasena,
      }).resultado,
    ).toBe(false);
    e = aplicar(e, {
      tipo: "USUARIO_GUARDAR",
      usuario: { ...buyer, rol: "vendedor", activo: true },
    });
    expect(
      operar(e, {
        tipo: "INICIAR",
        correo: buyer.correo,
        contrasena: buyer.contrasena,
      }).resultado.rol,
    ).toBe("vendedor");
    for (const usuario of [
      { ...admin, activo: false },
      { ...admin, rol: "comprador" },
      { ...e.usuarios.find((u) => u.cuentaDemostracion), activo: false },
    ])
      expect(operar(e, { tipo: "USUARIO_GUARDAR", usuario }).resultado).toBe(
        false,
      );
  });
  it("las tres cuentas de prueba inician con sus roles y no cambian contraseña", () => {
    const e = estado();
    for (const u of e.usuarios.filter((u) => u.cuentaDemostracion)) {
      expect(
        operar(e, {
          tipo: "INICIAR",
          correo: u.correo,
          contrasena: u.contrasena,
        }).resultado.rol,
      ).toBe(u.rol);
      expect(
        operar(e, {
          tipo: "CLAVE",
          correo: u.correo,
          actual: u.contrasena,
          nueva: "Otra123",
        }).resultado,
      ).toBe(false);
    }
  });
  it("registro público valida RUT, evita duplicados y fuerza rol comprador", () => {
    const e = estado(null),
      u = {
        nombre: "Nueva",
        correo: "nueva@example.com",
        contrasena: "Nueva123",
        rut: "11.111.111-1",
        rol: "admin",
      };
    const nuevo = aplicar(e, { tipo: "REGISTRAR", usuario: u, entrar: true });
    expect(nuevo.sesion.rol).toBe("comprador");
    expect(
      operar(nuevo, { tipo: "REGISTRAR", usuario: u, entrar: true }).resultado,
    ).toBe(false);
    expect(
      operar(e, {
        tipo: "REGISTRAR",
        usuario: { ...u, rut: "12.345.678-9" },
        entrar: true,
      }).resultado,
    ).toBe(false);
    expect(
      operar(e, { tipo: "REGISTRAR", usuario: u, entrar: false }).resultado,
    ).toBe(false);
  });
  it("perfil conserva permisos, contraseña y datos de dirección; cambio de clave funciona", () => {
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
    expect(u.rol).toBe("comprador");
    expect(u.contrasena).toBe(buyer.contrasena);
    expect(u.comuna).toBe("Ñuñoa");
    expect(e.sesion.nombre).toBe("Nuevo nombre");
    e = aplicar(e, {
      tipo: "CLAVE",
      correo: buyer.correo,
      actual: buyer.contrasena,
      nueva: "Nueva123",
    });
    expect(
      operar(e, {
        tipo: "INICIAR",
        correo: buyer.correo,
        contrasena: "Nueva123",
      }).resultado.correo,
    ).toBe(buyer.correo);
  });
  it("administración cambia estado de pedidos y marca mensajes; cerrar sesión vacía carrito", () => {
    let e = estado("admin");
    e.pedidos = [{ id: "GR-1", estado: "Recibido" }];
    e = aplicar(e, {
      tipo: "PEDIDO_ESTADO",
      id: "GR-1",
      estado: "En preparación",
    });
    expect(e.pedidos[0].estado).toBe("En preparación");
    expect(
      operar(e, { tipo: "PEDIDO_ESTADO", id: "GR-1", estado: "Inválido" })
        .resultado,
    ).toBe(false);
    e = aplicar(e, {
      tipo: "MENSAJE_ENVIAR",
      mensaje: { texto: "Hola", correo: buyer.correo },
    });
    e = aplicar(e, { tipo: "MENSAJE_LEIDO", indice: 0 });
    expect(e.mensajes[0].estado).toBe("Leído");
    e.carrito = [{ ...cafe, cantidad: 1 }];
    e = aplicar(e, { tipo: "CERRAR" });
    expect(e.sesion).toBe(null);
    expect(e.carrito).toEqual([]);
  });
  it("migra catálogo completo, cantidades, stock, roles, mensajes y estados desde la rama base", () => {
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
    expect(e.productos.length).toBe(1);
    expect(e.productos[0].stock).toBe(0);
    expect(e.productos[0].nombre).toBe("Editado");
    expect(e.carrito[0].cantidad).toBe(2);
    expect(e.sesion).toBe(null);
    expect(e.usuarios.find((u) => u.correo === buyer.correo).rol).toBe(
      "vendedor",
    );
    expect(e.pedidos[0].total).toBe(3000);
    expect(e.pedidos[0].estado).toBe("Entregado");
    expect(e.mensajes[0].estado).toBe("Leído");
  });
  it("actualiza esquema anterior sin resucitar productos personalizados eliminados", () => {
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
    expect(e.version).toBe(2);
    expect(e.productos.length).toBe(1);
    expect(e.productos[0].stock).toBe(4);
    expect(e.usuarios.find((u) => u.correo === buyer.correo).rol).toBe(
      "vendedor",
    );
  });
});
