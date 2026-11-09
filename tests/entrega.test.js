import test from "node:test";
import assert from "node:assert/strict";
import { operar } from "../src/datos/operaciones.js";
import {
  cargarEstado,
  guardarEstado,
  CLAVE_TIENDA,
} from "../src/datos/almacenamiento.js";
import { estaEnOferta, resumirVentas } from "../src/datos/compra.js";

const producto = {
  id: "colombia",
  nombre: "Colombia",
  categoria: "Café en grano",
  descripcion: "Cacao",
  detalle: "250 g",
  precio: 10000,
  stock: 5,
  critico: 2,
};
const entrega = {
  nombre: "Cliente",
  correo: "cliente@example.com",
  telefono: "+56912345678",
  metodo: "domicilio",
  direccion: "Calle 123",
  comuna: "Santiago",
  region: "Metropolitana",
};
function preparar(rol = "comprador") {
  const estado = cargarEstado({ getItem: () => null }, [producto]);
  const usuario = estado.usuarios.find((usuario) => usuario.rol === rol);
  estado.sesion = { ...usuario };
  estado.carrito = [{ ...producto, cantidad: 2 }];
  return estado;
}

test("checkout valida entrega y rechazo sin modificar inventario ni pedidos", () => {
  const estado = preparar();
  for (const accion of [
    { entrega: { ...entrega, direccion: "" } },
    { entrega, resultadoPago: "rechazado" },
    { entrega, resultadoPago: "desconocido" },
  ]) {
    const antes = structuredClone(estado);
    const respuesta = operar(estado, { tipo: "COMPRAR", ...accion });
    assert.equal(respuesta.resultado, false);
    assert.deepEqual(respuesta.estado, antes);
  }
});

test("el pedido conserva entrega y precios históricos al recargar", () => {
  const respuesta = operar(preparar(), {
    tipo: "COMPRAR",
    entrega,
    idPedido: "GR-NUEVO",
    resultadoPago: "aprobado",
  });
  assert.notEqual(respuesta.resultado, false);
  const pedido = respuesta.resultado;
  assert.equal(pedido.entrega.direccion, "Calle 123");
  assert.equal(pedido.total, 20000);
  let guardado;
  guardarEstado(
    {
      setItem: (clave, valor) => {
        assert.equal(clave, CLAVE_TIENDA);
        guardado = valor;
      },
    },
    respuesta.estado,
  );
  const recargado = cargarEstado(
    { getItem: (clave) => (clave === CLAVE_TIENDA ? guardado : null) },
    [producto],
  );
  assert.deepEqual(recargado.pedidos[0].entrega, pedido.entrega);
  assert.equal(recargado.pedidos[0].productos[0].precio, 10000);
  assert.equal(recargado.productos[0].stock, 3);
  assert.deepEqual(recargado.carrito, []);
});

test("el retiro permite omitir dirección pero conserva nombre y contacto", () => {
  const respuesta = operar(preparar(), {
    tipo: "COMPRAR",
    idPedido: "GR-RETIRO",
    entrega: {
      ...entrega,
      metodo: "retiro",
      direccion: "",
      comuna: "",
      region: "",
    },
  });
  assert.equal(respuesta.resultado.entrega.metodo, "retiro");
  assert.equal(respuesta.resultado.entrega.nombre, entrega.nombre);
});

test("una confirmación repetida no crea un segundo pedido ni descuenta stock dos veces", () => {
  const accion = { tipo: "COMPRAR", entrega, idPedido: "GR-UNICO" };
  const primera = operar(preparar(), accion);
  const segunda = operar(primera.estado, accion);
  assert.equal(segunda.resultado, false);
  assert.equal(segunda.estado.pedidos.length, 1);
  assert.equal(segunda.estado.productos[0].stock, 3);
});

test("categorías permiten crear, renombrar productos y eliminar solo categorías vacías", () => {
  let estado = preparar("admin");
  assert.equal(
    operar(estado, { tipo: "CATEGORIA_GUARDAR", nombre: "Cafe en grano" })
      .resultado,
    false,
  );
  estado = operar(estado, {
    tipo: "CATEGORIA_GUARDAR",
    nombre: "Regalos",
  }).estado;
  assert.equal(
    operar(estado, { tipo: "CATEGORIA_GUARDAR", nombre: "regalos" }).resultado,
    false,
  );
  estado = operar(estado, {
    tipo: "CATEGORIA_GUARDAR",
    anterior: "Café en grano",
    nombre: "Nuestros cafés",
  }).estado;
  assert.equal(estado.productos[0].categoria, "Nuestros cafés");
  assert.equal(
    operar(estado, { tipo: "CATEGORIA_ELIMINAR", nombre: "Nuestros cafés" })
      .resultado,
    false,
  );
  estado = operar(estado, {
    tipo: "CATEGORIA_ELIMINAR",
    nombre: "Regalos",
  }).estado;
  assert.equal(estado.categorias.includes("Regalos"), false);
  assert.equal(
    operar(preparar(), { tipo: "CATEGORIA_GUARDAR", nombre: "Sin permiso" })
      .resultado,
    false,
  );
});

test("las categorías guardadas no reaparecen tras eliminarlas y recargar", () => {
  const estado = {
    ...preparar("admin"),
    productos: [],
    categorias: ["Personalizada"],
  };
  const eliminado = operar(estado, {
    tipo: "CATEGORIA_ELIMINAR",
    nombre: "Personalizada",
  }).estado;
  const recargado = cargarEstado(
    {
      getItem: (clave) =>
        clave === CLAVE_TIENDA ? JSON.stringify(eliminado) : null,
    },
    [producto],
  );
  assert.deepEqual(recargado.categorias, []);
  assert.deepEqual(recargado.productos, []);
});

test("las ofertas se validan, persisten y pueden retirarse sin cambiar el precio vigente", () => {
  const estado = preparar("admin");
  const oferta = operar(estado, {
    tipo: "PRODUCTO_GUARDAR",
    producto: { ...producto, precioAnterior: 12000 },
  });
  assert.notEqual(oferta.resultado, false);
  assert.equal(estaEnOferta(oferta.estado.productos[0]), true);
  const recargado = cargarEstado(
    {
      getItem: (clave) =>
        clave === CLAVE_TIENDA ? JSON.stringify(oferta.estado) : null,
    },
    [producto],
  );
  assert.equal(recargado.productos[0].precioAnterior, 12000);
  assert.equal(recargado.productos[0].precio, 10000);
  assert.equal(
    operar(estado, {
      tipo: "PRODUCTO_GUARDAR",
      producto: { ...producto, precioAnterior: 9000 },
    }).resultado,
    false,
  );
  const retirada = operar(oferta.estado, {
    tipo: "PRODUCTO_GUARDAR",
    producto: { ...producto, precioAnterior: "" },
  });
  assert.equal(estaEnOferta(retirada.estado.productos[0]), false);
});

test("los reportes suman las instantáneas de pedidos sin recalcular precios actuales", () => {
  const pedido = operar(preparar(), {
    tipo: "COMPRAR",
    entrega,
    idPedido: "GR-REPORTE",
  }).resultado;
  const reporte = resumirVentas([pedido], [{ ...producto, precio: 99999 }]);
  assert.equal(reporte.total, 20000);
  assert.equal(reporte.unidades, 2);
  assert.equal(reporte.estados[0].cantidad, 1);
});
