package cl.grano.backend;

import cl.grano.backend.model.*;
import cl.grano.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PedidoApiTest {
  @Autowired MockMvc api;
  @Autowired ObjectMapper json;
  @Autowired ProductoRepository productos;
  @Autowired PedidoRepository pedidos;
  @Autowired UsuarioRepository usuarios;

  @BeforeEach
  void preparar() {
    pedidos.deleteAll(); productos.deleteAll(); usuarios.deleteAll();
    cuenta("cliente@grano.cl", "comprador"); cuenta("otro@grano.cl", "comprador");
    cuenta("admin@grano.cl", "admin"); cuenta("venta@grano.cl", "vendedor");
    producto("cafe", 5); producto("metodo", 1);
  }

  private void cuenta(String correo, String rol) {
    Usuario usuario = new Usuario(); usuario.correo = correo; usuario.nombre = "Prueba";
    usuario.rol = rol; usuario.contrasenaHash = "password"; usuarios.save(usuario);
  }

  private void producto(String id, int stock) {
    Producto producto = new Producto(); producto.setId(id); producto.setNombre(id);
    producto.setCategoria("Café en grano"); producto.setDescripcion("Prueba"); producto.setDetalle("Bolsa de 250 g");
    producto.setPrecio(new BigDecimal("10000")); producto.setStock(stock);
    producto.setImagen("data:image/png;base64,YQ=="); productos.save(producto);
  }

  private ObjectNode compra() {
    ObjectNode datos = json.createObjectNode().put("solicitudId", UUID.randomUUID().toString()).put("resultadoPago", "aprobado");
    datos.putArray("productos").addObject().put("id", "cafe").put("cantidad", 2);
    datos.putObject("entrega").put("nombre", "Cliente").put("correo", "cliente@grano.cl")
        .put("telefono", "+56 9 1234 5678").put("metodo", "retiro");
    return datos;
  }

  private org.springframework.test.web.servlet.ResultActions enviar(ObjectNode datos, String correo) throws Exception {
    return api.perform(post("/api/pedidos").with(user(correo)).with(csrf())
        .contentType(MediaType.APPLICATION_JSON).content(datos.toString()));
  }

  private String crear() throws Exception {
    return json.readTree(enviar(compra(), "cliente@grano.cl").andExpect(status().isCreated())
        .andReturn().getResponse().getContentAsString()).get("id").asText();
  }

  @Test
  void guardaElPedidoYDescuentaStockConPrecioYCompradorDelServidor() throws Exception {
    ObjectNode datos = compra().put("comprador", "otro@grano.cl").put("total", 1).put("estado", "Entregado");
    ((ObjectNode) datos.withArray("productos").get(0)).put("precio", 1);
    enviar(datos, "cliente@grano.cl").andExpect(status().isCreated())
        .andExpect(jsonPath("$.total").value(20000)).andExpect(jsonPath("$.comprador").value("cliente@grano.cl"))
        .andExpect(jsonPath("$.estado").value("Recibido")).andExpect(jsonPath("$.productos[0].imagen").isNotEmpty());
    assertEquals(3, productos.findById("cafe").orElseThrow().getStock());
    assertEquals(1, pedidos.count());
  }

  @Test
  void rechazaPagoSinCambiarCarritoServidorNiStock() throws Exception {
    enviar(compra().put("resultadoPago", "rechazado"), "cliente@grano.cl").andExpect(status().isBadRequest());
    assertEquals(5, productos.findById("cafe").orElseThrow().getStock()); assertEquals(0, pedidos.count());
  }

  @Test
  void revierteTodosLosDescuentosSiOtroProductoNoTieneStock() throws Exception {
    ObjectNode datos = compra(); datos.withArray("productos").addObject().put("id", "metodo").put("cantidad", 2);
    enviar(datos, "cliente@grano.cl").andExpect(status().isConflict());
    assertEquals(5, productos.findById("cafe").orElseThrow().getStock()); assertEquals(0, pedidos.count());
  }

  @Test
  void rechazaProductoEliminadoCarritoVacioCantidadesInvalidasYDuplicados() throws Exception {
    ObjectNode datos = compra(); ((ObjectNode) datos.withArray("productos").get(0)).put("id", "eliminado");
    enviar(datos, "cliente@grano.cl").andExpect(status().isConflict());
    datos = compra(); datos.putArray("productos"); enviar(datos, "cliente@grano.cl").andExpect(status().isBadRequest());
    for (int cantidad : new int[]{0, -1, 1000}) {
      datos = compra(); ((ObjectNode) datos.withArray("productos").get(0)).put("cantidad", cantidad);
      enviar(datos, "cliente@grano.cl").andExpect(status().isBadRequest());
    }
    datos = compra(); ((ObjectNode) datos.withArray("productos").get(0)).put("cantidad", 1.5);
    enviar(datos, "cliente@grano.cl").andExpect(status().isBadRequest());
    datos = compra(); datos.withArray("productos").addObject().put("id", "cafe").put("cantidad", 1);
    enviar(datos, "cliente@grano.cl").andExpect(status().isBadRequest());
    assertEquals(0, pedidos.count()); assertEquals(5, productos.findById("cafe").orElseThrow().getStock());
  }

  @Test
  void validaTelefonoYDireccionAntesDeGuardar() throws Exception {
    ObjectNode datos = compra(); ((ObjectNode) datos.get("entrega")).put("telefono", "++56 9 1234 5678");
    enviar(datos, "cliente@grano.cl").andExpect(status().isBadRequest());
    datos = compra(); ((ObjectNode) datos.get("entrega")).put("metodo", "domicilio");
    enviar(datos, "cliente@grano.cl").andExpect(status().isBadRequest());
    ((ObjectNode) datos.get("entrega")).put("direccion", "Calle 123").put("comuna", "Santiago").put("region", "Metropolitana");
    enviar(datos, "cliente@grano.cl").andExpect(status().isCreated());
  }

  @Test
  void reintentarLaMismaSolicitudNoDuplicaElPedidoNiElDescuento() throws Exception {
    ObjectNode datos = compra();
    String primero = json.readTree(enviar(datos, "cliente@grano.cl").andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
    enviar(datos, "cliente@grano.cl").andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(primero));
    assertEquals(1, pedidos.count()); assertEquals(3, productos.findById("cafe").orElseThrow().getStock());
    ((ObjectNode) datos.withArray("productos").get(0)).put("cantidad", 1);
    enviar(datos, "cliente@grano.cl").andExpect(status().isConflict());
  }

  @Test
  void compradorSoloVeSusPedidosYNoPuedeConsultarLosDeOtraCuenta() throws Exception {
    String id = crear();
    api.perform(get("/api/pedidos").with(user("otro@grano.cl"))).andExpect(status().isOk()).andExpect(content().json("[]"));
    api.perform(get("/api/pedidos/{id}", id).with(user("otro@grano.cl"))).andExpect(status().isNotFound());
    api.perform(get("/api/pedidos/{id}", id).with(user("cliente@grano.cl"))).andExpect(status().isOk());
    api.perform(get("/api/pedidos").with(user("cliente@grano.cl"))).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));
  }

  @Test
  void adminYVendedorVenLosPedidosYPuedenActualizarEstados() throws Exception {
    String id = crear();
    for (String correo : new String[]{"admin@grano.cl", "venta@grano.cl"}) {
      api.perform(get("/api/pedidos/{id}", id).with(user(correo))).andExpect(status().isOk());
      api.perform(put("/api/pedidos/{id}/estado", id).with(user(correo)).with(csrf())
          .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"En preparación\"}"))
          .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("En preparación"));
    }
    api.perform(put("/api/pedidos/{id}/estado", id).with(user("venta@grano.cl")).with(csrf())
        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"Entregado\"}"))
        .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("Entregado"));
    assertEquals(3, productos.findById("cafe").orElseThrow().getStock());
  }

  @Test
  void impideComprasDeOtrosRolesYEstadosInvalidos() throws Exception {
    api.perform(get("/api/pedidos")).andExpect(status().isUnauthorized());
    for (String correo : new String[]{"admin@grano.cl", "venta@grano.cl"}) enviar(compra(), correo).andExpect(status().isForbidden());
    String id = crear();
    api.perform(put("/api/pedidos/{id}/estado", id).with(user("cliente@grano.cl")).with(csrf())
        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"Entregado\"}")).andExpect(status().isForbidden());
    api.perform(put("/api/pedidos/{id}/estado", id).with(user("admin@grano.cl")).with(csrf())
        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"Cancelado\"}")).andExpect(status().isBadRequest());
  }

  @Test
  void elComprobanteConservaNombrePrecioEImagenAunqueSeElimineElProducto() throws Exception {
    String id = crear();
    productos.deleteById("cafe");
    api.perform(get("/api/pedidos/{id}", id).with(user("cliente@grano.cl"))).andExpect(status().isOk())
        .andExpect(jsonPath("$.productos[0].nombre").value("cafe")).andExpect(jsonPath("$.productos[0].precio").value(10000))
        .andExpect(jsonPath("$.total").value(20000));
  }

  @Test
  void dosCompradoresNoPuedenLlevarseLaMismaUltimaUnidad() throws Exception {
    Producto cafe = productos.findById("cafe").orElseThrow(); cafe.setStock(1); productos.save(cafe);
    ObjectNode primero = compra(), segundo = compra();
    ((ObjectNode) primero.withArray("productos").get(0)).put("cantidad", 1);
    ((ObjectNode) segundo.withArray("productos").get(0)).put("cantidad", 1);
    List<Integer> resultados = concurrentes(primero, segundo, "cliente@grano.cl", "otro@grano.cl");
    assertEquals(List.of(201, 409), resultados.stream().sorted().toList());
    assertEquals(0, productos.findById("cafe").orElseThrow().getStock()); assertEquals(1, pedidos.count());
  }

  @Test
  void dosReintentosSimultaneosSeConviertenEnUnSoloPedido() throws Exception {
    ObjectNode datos = compra();
    assertEquals(List.of(201, 201), concurrentes(datos, datos, "cliente@grano.cl", "cliente@grano.cl"));
    assertEquals(3, productos.findById("cafe").orElseThrow().getStock()); assertEquals(1, pedidos.count());
  }

  private List<Integer> concurrentes(ObjectNode primero, ObjectNode segundo, String correo1, String correo2) throws Exception {
    ExecutorService ejecutor = Executors.newFixedThreadPool(2);
    CountDownLatch inicio = new CountDownLatch(1);
    try {
      Future<Integer> uno = ejecutor.submit(() -> { inicio.await(); return enviar(primero, correo1).andReturn().getResponse().getStatus(); });
      Future<Integer> dos = ejecutor.submit(() -> { inicio.await(); return enviar(segundo, correo2).andReturn().getResponse().getStatus(); });
      inicio.countDown(); return List.of(uno.get(10, TimeUnit.SECONDS), dos.get(10, TimeUnit.SECONDS));
    } finally { ejecutor.shutdownNow(); }
  }
}
