import AdminPedidos from "../../src/components/admin/AdminPedidos.jsx";
import AdminMensajes from "../../src/components/admin/AdminMensajes.jsx";
import AdminResumen from "../../src/components/admin/AdminResumen.jsx";
import AdminReportes from "../../src/components/admin/AdminReportes.jsx";
import Vendedor from "../../src/components/Vendedor.jsx";
import { crearVista } from "../ayudas/renderizar.jsx";

describe("Información de pedidos y administración", () => {
  const vista = crearVista();
  const producto = {
    id: "cafe",
    nombre: "Café de prueba",
    precio: 9000,
    stock: 1,
    critico: 2,
    categoria: "Café en grano",
  };
  const pedido = {
    id: "GR-1",
    comprador: "cliente@example.test",
    fecha: "16/11/2026",
    estado: "Recibido",
    total: 1000,
    productos: [{ nombre: "Café histórico", cantidad: 2 }, { nombre: "Taza" }],
  };

  it("cambia el estado del pedido e incluye su enlace y cantidades", async () => {
    const cambiar = jasmine.createSpy("cambiar");
    await vista.mostrar(
      <AdminPedidos pedidos={[pedido]} onCambiarEstado={cambiar} />,
    );
    await vista.escribir("select", "Entregado");
    expect(cambiar).toHaveBeenCalledOnceWith("GR-1", "Entregado");
    expect(vista.contenedor.textContent).toContain(
      "Café histórico × 2, Taza × 1",
    );
    expect(vista.contenedor.querySelector("a").getAttribute("href")).toBe(
      "/admin/pedidos/GR-1",
    );
    await vista.mostrar(<AdminPedidos pedidos={[]} />);
    expect(vista.contenedor.textContent).toContain(
      "Aún no hay pedidos realizados",
    );
  });

  it("permite marcar solo los mensajes pendientes", async () => {
    const marcar = jasmine.createSpy("marcar");
    await vista.mostrar(
      <AdminMensajes
        mensajes={[
          {
            nombre: "Cliente",
            correo: "cliente@example.test",
            fecha: "hoy",
            texto: "Consulta",
            estado: "Nuevo",
          },
          { nombre: "Otra persona", fecha: "ayer", estado: "Leído" },
        ]}
        onMarcar={marcar}
      />,
    );
    expect(vista.contenedor.querySelectorAll("button").length).toBe(1);
    await vista.clic(vista.contenedor.querySelector("button"));
    expect(marcar).toHaveBeenCalledOnceWith(0);
    await vista.mostrar(<AdminMensajes mensajes={[]} />);
    expect(vista.contenedor.textContent).toContain("Aún no hay mensajes");
  });

  it("el resumen señala stock crítico y contempla listas vacías", async () => {
    await vista.mostrar(
      <AdminResumen
        productos={[producto]}
        pedidos={[pedido]}
        usuarios={[{}]}
        mensajes={[{}]}
      />,
    );
    expect(vista.contenedor.textContent).toContain("Café de prueba: 1 unidad");
    expect(
      [...vista.contenedor.querySelectorAll(".resumen-admin strong")].map(
        (e) => e.textContent,
      ),
    ).toEqual(["1", "1", "1", "1"]);
    await vista.mostrar(
      <AdminResumen productos={[]} pedidos={[]} usuarios={[]} mensajes={[]} />,
    );
    expect(vista.contenedor.textContent).toContain(
      "No hay productos en stock crítico",
    );
    expect(vista.contenedor.textContent).toContain("0 productos");
  });

  it("el reporte usa los precios históricos y presenta las alertas del inventario actual", async () => {
    await vista.mostrar(
      <AdminReportes pedidos={[pedido]} productos={[producto]} />,
    );
    expect(vista.contenedor.querySelectorAll("dd")[1].textContent).toContain(
      "1.000",
    );
    expect(vista.contenedor.textContent).toContain("Recibido: 1");
    expect(vista.contenedor.textContent).toContain(
      "Café de prueba: 1 unidades",
    );
    await vista.mostrar(<AdminReportes pedidos={[]} productos={[]} />);
    expect(vista.contenedor.textContent).toContain(
      "No hay productos en stock crítico",
    );
  });

  it("el vendedor consulta stock y pedidos sin controles de edición", async () => {
    await vista.mostrar(
      <Vendedor
        productos={[producto, { ...producto, id: "otro", stock: 5 }]}
        pedidos={[pedido]}
      />,
    );
    expect(vista.contenedor.textContent).toContain("Stock crítico");
    expect(vista.contenedor.textContent).toContain("Café histórico × 2");
    expect(vista.contenedor.querySelector("button")).toBeNull();
    await vista.mostrar(<Vendedor productos={[]} pedidos={[]} />);
    expect(vista.contenedor.textContent).toContain("Aún no hay pedidos");
  });
});
