package cl.grano.backend;

import cl.grano.backend.model.*;
import cl.grano.backend.repository.*;
import cl.grano.backend.service.CategoriaService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class ContenidoApiTest {
  @Autowired MockMvc api;
  @Autowired ObjectMapper json;
  @Autowired ProductoRepository productos;
  @Autowired CategoriaRepository categorias;
  @Autowired MensajeRepository mensajes;
  @Autowired MarcaInicialRepository marcas;
  @Autowired UsuarioRepository usuarios;
  @Autowired CategoriaService servicio;

  @BeforeEach
  void preparar() {
    restaurarCategorias(); mensajes.deleteAll(); usuarios.deleteAll();
    for (String rol : List.of("admin", "vendedor", "comprador")) {
      Usuario usuario = new Usuario(); usuario.correo = rol + "@grano.cl"; usuario.nombre = "Cuenta " + rol;
      usuario.rol = rol; usuario.contrasenaHash = "password"; usuarios.save(usuario);
    }
    Producto producto = new Producto(); producto.setId("cafe-prueba"); producto.setNombre("Café de prueba");
    producto.setCategoria("Café en grano"); producto.setDescripcion("Prueba"); producto.setDetalle("Bolsa de 250 g");
    producto.setPrecio(new BigDecimal("10000")); producto.setStock(5); productos.save(producto);
  }

  @AfterEach
  void restaurarCategorias() { productos.deleteAll(); categorias.deleteAll(); marcas.deleteAll(); servicio.inicializar(); }

  private String contacto() { return "{\"nombre\":\"Visita\",\"correo\":\"visita@grano.cl\",\"texto\":\"Quiero consultar por un café.\",\"estado\":\"Leído\",\"fecha\":\"1999\"}"; }
  private String crearMensaje() throws Exception {
    return json.readTree(api.perform(post("/api/mensajes").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(contacto()))
        .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
  }
  private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder nombre(String metodo, String ruta, String nombre) {
    return (metodo.equals("POST") ? post(ruta) : put(ruta)).with(user("admin@grano.cl")).with(csrf())
        .contentType(MediaType.APPLICATION_JSON).content(json.createObjectNode().put("nombre", nombre).toString());
  }

  @Test
  void categoriasSonPublicasYLaCreacionTieneNombreUnicoNormalizado() throws Exception {
    api.perform(get("/api/categorias")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(3));
    api.perform(nombre("POST", "/api/categorias", " Cafeteras ")).andExpect(status().isCreated()).andExpect(jsonPath("$.nombre").value("Cafeteras"));
    api.perform(nombre("POST", "/api/categorias", "CAFETERÁS")).andExpect(status().isConflict());
    for (String invalido : List.of("", "  ", "todos", "!!!", "a".repeat(61))) {
      api.perform(nombre("POST", "/api/categorias", invalido)).andExpect(status().isBadRequest());
    }
  }

  @Test
  void renombrarActualizaProductosSinCambiarSuStock() throws Exception {
    api.perform(nombre("PUT", "/api/categorias/cafe", "Orígenes")).andExpect(status().isOk());
    api.perform(get("/api/productos/cafe-prueba")).andExpect(status().isOk())
        .andExpect(jsonPath("$.categoria").value("Orígenes")).andExpect(jsonPath("$.stock").value(5));
    api.perform(get("/api/categorias/cafe")).andExpect(status().isOk()).andExpect(jsonPath("$.nombre").value("Orígenes"));
    api.perform(nombre("PUT", "/api/categorias/cafe", "Métodos")).andExpect(status().isConflict());
  }

  @Test
  void noEliminaCategoriasUsadasYNuncaResucitaLasEliminadas() throws Exception {
    api.perform(delete("/api/categorias/cafe").with(user("admin@grano.cl")).with(csrf())).andExpect(status().isConflict());
    api.perform(delete("/api/categorias/accesorios").with(user("admin@grano.cl")).with(csrf())).andExpect(status().isNoContent());
    servicio.inicializar();
    api.perform(get("/api/categorias/accesorios")).andExpect(status().isNotFound());
  }

  @Test
  void importaCategoriasAnterioresUnaSolaVez() {
    Producto producto = productos.findById("cafe-prueba").orElseThrow(); producto.setCategoria("Tueste especial"); productos.save(producto);
    categorias.deleteAll(); marcas.deleteAll(); servicio.inicializar(); servicio.inicializar();
    assertEquals(4, categorias.count()); assertTrue(categorias.findByClave("tueste-especial").isPresent());
    assertEquals("Tueste especial", productos.findById("cafe-prueba").orElseThrow().getCategoria());
  }

  @Test
  void soloAdminModificaCategoriasYElProductoExigeUnaExistente() throws Exception {
    api.perform(post("/api/categorias").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Nueva\"}")).andExpect(status().isUnauthorized());
    for (String rol : List.of("comprador", "vendedor")) {
      api.perform(post("/api/categorias").with(user(rol + "@grano.cl")).with(csrf()).contentType(MediaType.APPLICATION_JSON)
          .content("{\"nombre\":\"Nueva\"}")).andExpect(status().isForbidden());
    }
    String cuerpo = "{\"nombre\":\"Otro café\",\"categoria\":\"No existe\",\"descripcion\":\"Prueba\",\"detalle\":\"Bolsa\",\"precio\":10000,\"stock\":1}";
    api.perform(post("/api/productos").with(user("admin@grano.cl")).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(cuerpo)).andExpect(status().isBadRequest());
  }

  @Test
  void visitanteEnviaMensajePeroNoPuedeLeerLaBandeja() throws Exception {
    String id = crearMensaje();
    api.perform(get("/api/mensajes")).andExpect(status().isUnauthorized());
    api.perform(get("/api/mensajes/{id}", id).with(user("admin@grano.cl"))).andExpect(status().isOk())
        .andExpect(jsonPath("$.estado").value("Nuevo")).andExpect(jsonPath("$.fecha").value(org.hamcrest.Matchers.not("1999")));
    for (String rol : List.of("comprador", "vendedor")) {
      api.perform(get("/api/mensajes").with(user(rol + "@grano.cl"))).andExpect(status().isForbidden());
      api.perform(put("/api/mensajes/{id}/leido", id).with(user(rol + "@grano.cl")).with(csrf())).andExpect(status().isForbidden());
    }
  }

  @Test
  void cuentaAutenticadaUsaSuIdentidadRealEnContacto() throws Exception {
    api.perform(post("/api/mensajes").with(user("comprador@grano.cl")).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(contacto()))
        .andExpect(status().isCreated()).andExpect(jsonPath("$.nombre").value("Cuenta comprador"))
        .andExpect(jsonPath("$.correo").value("comprador@grano.cl"));
  }

  @Test
  void validaNombreCorreoTextoYCsrf() throws Exception {
    api.perform(post("/api/mensajes").contentType(MediaType.APPLICATION_JSON).content(contacto())).andExpect(status().isForbidden());
    for (String cuerpo : List.of(contacto().replace("visita@grano.cl", "correo-mal"), contacto().replace("Visita", " "),
        contacto().replace("Quiero consultar por un café.", " "), contacto().replace("Quiero consultar por un café.", "a".repeat(501)))) {
      api.perform(post("/api/mensajes").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(cuerpo)).andExpect(status().isBadRequest());
    }
    assertEquals(0, mensajes.count());
  }

  @Test
  void marcaPorIdAunqueLlegueOtroMensajeYPermiteRepetirLaMarca() throws Exception {
    String primero = crearMensaje(), segundo = crearMensaje();
    for (int intento = 0; intento < 2; intento++) api.perform(put("/api/mensajes/{id}/leido", primero).with(user("admin@grano.cl")).with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("Leído"));
    assertEquals("Leído", mensajes.findById(primero).orElseThrow().estado); assertEquals("Nuevo", mensajes.findById(segundo).orElseThrow().estado);
    api.perform(put("/api/mensajes/no-existe/leido").with(user("admin@grano.cl")).with(csrf())).andExpect(status().isNotFound());
  }

  @Test
  void renombrarNoAlteraLaCategoriaHistoricaDelPedido() throws Exception {
    String cuerpo = "{\"solicitudId\":\"" + UUID.randomUUID() + "\",\"resultadoPago\":\"aprobado\",\"productos\":[{\"id\":\"cafe-prueba\",\"cantidad\":1}],\"entrega\":{\"nombre\":\"Cliente\",\"correo\":\"cliente@grano.cl\",\"telefono\":\"912345678\",\"metodo\":\"retiro\"}}";
    String id = json.readTree(api.perform(post("/api/pedidos").with(user("comprador@grano.cl")).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(cuerpo))
        .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();
    api.perform(nombre("PUT", "/api/categorias/cafe", "Orígenes")).andExpect(status().isOk());
    api.perform(get("/api/pedidos/{id}", id).with(user("comprador@grano.cl"))).andExpect(status().isOk())
        .andExpect(jsonPath("$.productos[0].categoria").value("Café en grano"));
    assertEquals(4, productos.findById("cafe-prueba").orElseThrow().getStock());
  }

  @Test
  void crearProductoYEliminarSuCategoriaAlMismoTiempoNoDejaProductosHuerfanos() throws Exception {
    ExecutorService ejecutor = Executors.newFixedThreadPool(2); CountDownLatch inicio = new CountDownLatch(1);
    try {
      Future<Integer> crear = ejecutor.submit(() -> { inicio.await(); return api.perform(post("/api/productos").with(user("admin@grano.cl")).with(csrf()).contentType(MediaType.APPLICATION_JSON)
          .content("{\"nombre\":\"Taza\",\"categoria\":\"Accesorios\",\"descripcion\":\"Taza\",\"detalle\":\"Cerámica\",\"precio\":5000,\"stock\":1}"))
          .andReturn().getResponse().getStatus(); });
      Future<Integer> borrar = ejecutor.submit(() -> { inicio.await(); return api.perform(delete("/api/categorias/accesorios").with(user("admin@grano.cl")).with(csrf())).andReturn().getResponse().getStatus(); });
      inicio.countDown(); int resultadoCrear = crear.get(10, TimeUnit.SECONDS), resultadoBorrar = borrar.get(10, TimeUnit.SECONDS);
      assertTrue((resultadoCrear == 201 && resultadoBorrar == 409) || (resultadoCrear == 400 && resultadoBorrar == 204));
      assertEquals(productos.existsByCategoria("Accesorios"), categorias.existsById("accesorios"));
    } finally { ejecutor.shutdownNow(); }
  }
}
