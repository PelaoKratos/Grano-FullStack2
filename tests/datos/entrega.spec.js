import { operar } from "../../src/datos/operaciones.js";
import {
  cargarEstado,
  guardarEstado,
  CLAVE_TIENDA,
} from "../../src/datos/almacenamiento.js";
import { estaEnOferta, resumirVentas } from "../../src/datos/compra.js";

describe("Reglas de entrega", () => {
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

  it("checkout valida entrega y rechazo sin modificar inventario ni pedidos", () => {
    const estado = preparar();
    for (const accion of [
      { entrega: { ...entrega, direccion: "" } },
      { entrega, resultadoPago: "rechazado" },
      { entrega, resultadoPago: "desconocido" },
    ]) {
      const antes = structuredClone(estado);
      const respuesta = operar(estado, { tipo: "COMPRAR", ...accion });
      expect(respuesta.resultado).toBe(false);
      expect(respuesta.estado).toEqual(antes);
    }
  });

  it("el pedido conserva entrega y precios históricos al recargar", () => {
    const respuesta = operar(preparar(), {
      tipo: "COMPRAR",
      entrega,
      idPedido: "GR-NUEVO",
      resultadoPago: "aprobado",
    });
    expect(respuesta.resultado).not.toBe(false);
    const pedido = respuesta.resultado;
    expect(pedido.entrega.direccion).toBe("Calle 123");
    expect(pedido.total).toBe(20000);
    let guardado;
    guardarEstado(
      {
        setItem: (clave, valor) => {
          expect(clave).toBe(CLAVE_TIENDA);
          guardado = valor;
        },
      },
      respuesta.estado,
    );
    const recargado = cargarEstado(
      { getItem: (clave) => (clave === CLAVE_TIENDA ? guardado : null) },
      [producto],
    );
    expect(recargado.pedidos[0].entrega).toEqual(pedido.entrega);
    expect(recargado.pedidos[0].productos[0].precio).toBe(10000);
    expect(recargado.productos[0].stock).toBe(3);
    expect(recargado.carrito).toEqual([]);
  });

  it("el retiro permite omitir dirección pero conserva nombre y contacto", () => {
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
    expect(respuesta.resultado.entrega.metodo).toBe("retiro");
    expect(respuesta.resultado.entrega.nombre).toBe(entrega.nombre);
  });

  it("una confirmación repetida no crea un segundo pedido ni descuenta stock dos veces", () => {
    const accion = { tipo: "COMPRAR", entrega, idPedido: "GR-UNICO" };
    const primera = operar(preparar(), accion);
    const segunda = operar(primera.estado, accion);
    expect(segunda.resultado).toBe(false);
    expect(segunda.estado.pedidos.length).toBe(1);
    expect(segunda.estado.productos[0].stock).toBe(3);
  });

  it("categorías permiten crear, renombrar productos y eliminar solo categorías vacías", () => {
    let estado = preparar("admin");
    expect(
      operar(estado, { tipo: "CATEGORIA_GUARDAR", nombre: "Cafe en grano" })
        .resultado,
    ).toBe(false);
    estado = operar(estado, {
      tipo: "CATEGORIA_GUARDAR",
      nombre: "Regalos",
    }).estado;
    expect(
      operar(estado, { tipo: "CATEGORIA_GUARDAR", nombre: "regalos" })
        .resultado,
    ).toBe(false);
    estado = operar(estado, {
      tipo: "CATEGORIA_GUARDAR",
      anterior: "Café en grano",
      nombre: "Nuestros cafés",
    }).estado;
    expect(estado.productos[0].categoria).toBe("Nuestros cafés");
    expect(
      operar(estado, { tipo: "CATEGORIA_ELIMINAR", nombre: "Nuestros cafés" })
        .resultado,
    ).toBe(false);
    estado = operar(estado, {
      tipo: "CATEGORIA_ELIMINAR",
      nombre: "Regalos",
    }).estado;
    expect(estado.categorias.includes("Regalos")).toBe(false);
    expect(
      operar(preparar(), { tipo: "CATEGORIA_GUARDAR", nombre: "Sin permiso" })
        .resultado,
    ).toBe(false);
  });

  it("las categorías guardadas no reaparecen tras eliminarlas y recargar", () => {
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
    expect(recargado.categorias).toEqual([]);
    expect(recargado.productos).toEqual([]);
  });

  it("las ofertas se validan, persisten y pueden retirarse sin cambiar el precio vigente", () => {
    const estado = preparar("admin");
    const oferta = operar(estado, {
      tipo: "PRODUCTO_GUARDAR",
      producto: { ...producto, precioAnterior: 12000 },
    });
    expect(oferta.resultado).not.toBe(false);
    expect(estaEnOferta(oferta.estado.productos[0])).toBe(true);
    const recargado = cargarEstado(
      {
        getItem: (clave) =>
          clave === CLAVE_TIENDA ? JSON.stringify(oferta.estado) : null,
      },
      [producto],
    );
    expect(recargado.productos[0].precioAnterior).toBe(12000);
    expect(recargado.productos[0].precio).toBe(10000);
    expect(
      operar(estado, {
        tipo: "PRODUCTO_GUARDAR",
        producto: { ...producto, precioAnterior: 9000 },
      }).resultado,
    ).toBe(false);
    const retirada = operar(oferta.estado, {
      tipo: "PRODUCTO_GUARDAR",
      producto: { ...producto, precioAnterior: "" },
    });
    expect(estaEnOferta(retirada.estado.productos[0])).toBe(false);
  });

  it("los reportes suman las instantáneas de pedidos sin recalcular precios actuales", () => {
    const pedido = operar(preparar(), {
      tipo: "COMPRAR",
      entrega,
      idPedido: "GR-REPORTE",
    }).resultado;
    const reporte = resumirVentas([pedido], [{ ...producto, precio: 99999 }]);
    expect(reporte.total).toBe(20000);
    expect(reporte.unidades).toBe(2);
    expect(reporte.estados[0].cantidad).toBe(1);
  });
});
