import {
  CLAVE_TIENDA,
  cargarEstado,
  guardarEstado,
  normalizarCarrito,
  totalCarrito,
} from "../../src/datos/almacenamiento.js";
import { leerRuta, rutasAnteriores } from "../../src/datos/rutas.js";
import { esRutValido } from "../../src/datos/rut.js";

describe("Reglas de almacenamiento", () => {
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

  it("migra carrito HTML con cantidades y conserva perfil, sesión e historial", () => {
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
    expect(totalCarrito(estado.carrito)).toBe(38970);
    expect(estado.carrito[0].imagen).toBe("/colombia.svg");
    expect(estado.usuarios.find((u) => u.correo === buyer.correo).comuna).toBe(
      "Ñuñoa",
    );
    expect(estado.sesion.correo).toBe(buyer.correo);
    expect(estado.pedidos[0].productos[0].precio).toBe(10000);
    expect(estado.pedidos[0].total).toBe(20000);
    guardarEstado(store, estado);
    expect(store.map.has("usuarios-grano")).toBe(true);
  });
  it("convierte IDs numéricos y artículos repetidos de la práctica React", () => {
    const store = storage({
      granoCarritoReact: [
        { id: 2, precio: 14990 },
        { id: 2, precio: 14990 },
      ],
    });
    const estado = cargarEstado(store, catalogo);
    expect(estado.carrito.length).toBe(1);
    expect(estado.carrito[0].id).toBe("etiopia");
    expect(estado.carrito[0].cantidad).toBe(2);
    expect(totalCarrito(estado.carrito)).toBe(29980);
  });
  it("combina usuarios de ambas versiones y prioriza datos del sitio principal", () => {
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
    expect(
      estado.usuarios.filter((u) => u.correo === buyer.correo).length,
    ).toBe(1);
    expect(estado.usuarios.find((u) => u.correo === buyer.correo).nombre).toBe(
      "Comprador",
    );
    expect(
      estado.usuarios.find((u) => u.correo === "otro@example.com"),
    ).toBeTruthy();
  });
  it("un carrito vaciado y un producto eliminado no reaparecen al recargar", () => {
    const store = storage({
      "carrito-grano": [{ id: "colombia", precio: 12990 }],
      granoProductosReact: [
        { id: "nuevo-1", nombre: "Temporal", precio: 5000 },
      ],
    });
    const estado = cargarEstado(store, catalogo);
    guardarEstado(store, {
      ...estado,
      carrito: [],
      productos: estado.productos.filter((p) => p.id !== "nuevo-1"),
    });
    const restored = cargarEstado(store, catalogo);
    expect(restored.carrito).toEqual([]);
    expect(restored.productos.some((p) => p.id === "nuevo-1")).toBe(false);
  });
  it("JSON dañado, usuarios inválidos y cantidades inválidas no rompen la tienda", () => {
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
    expect(estado.usuarios.length).toBe(3);
    expect(estado.carrito).toEqual([]);
  });
  it("una escritura rechazada no destruye el pedido guardado anteriormente", () => {
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
    expect(() =>
      guardarEstado(bloqueado, {
        version: 1,
        usuarios: [],
        carrito: [],
        pedidos: [{ id: "nuevo" }],
      }),
    ).toThrow();
    expect(store.getItem(CLAVE_TIENDA)).toBe(before);
  });
  it("rutas compartibles y enlaces anteriores conservan detalle y filtros", () => {
    expect(rutasAnteriores["producto-colombia.html"]).toBe(
      "/producto/colombia",
    );
    const ruta = leerRuta("#/productos?categoria=metodos");
    expect(ruta.path).toBe("/productos");
    expect(ruta.params.get("categoria")).toBe("metodos");
    expect(leerRuta("").path).toBe("/");
    expect(leerRuta("#inicio").path).toBe("/");
    expect(leerRuta("#login").path).toBe("/acceso");
    expect(leerRuta("#producto/1").path).toBe("/producto/colombia");
    expect(leerRuta("#admin/productos").path).toBe("/admin/productos");
    expect(leerRuta("#registro").path).toBe("/registro");
    expect(leerRuta("#cambiar-clave").path).toBe("/cambiar-clave");
  });
  it("el registro mantiene la validación del dígito verificador del RUT", () => {
    expect(esRutValido("12.345.678-5")).toBe(true);
    expect(esRutValido("12.345.678-9")).toBe(false);
  });
});
