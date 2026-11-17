package cl.grano.backend;

import cl.grano.backend.repository.ProductoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductoApiTest {
  @Autowired MockMvc api;
  @Autowired ObjectMapper json;
  @Autowired ProductoRepository repositorio;

  @BeforeEach
  void limpiarBaseDePruebas() {
    repositorio.deleteAll();
  }

  private ObjectNode producto(String nombre) {
    return json.createObjectNode()
        .put("nombre", nombre)
        .put("categoria", "Café en grano")
        .put("descripcion", "Cacao y caramelo")
        .put("detalle", "Bolsa de 250 g")
        .put("precio", 12990)
        .put("stock", 12)
        .put("critico", 3);
  }

  private String crear(ObjectNode datos) throws Exception {
    String respuesta = api.perform(post("/api/productos")
        .contentType(MediaType.APPLICATION_JSON).content(datos.toString()))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", containsString("/api/productos/nuevo-")))
        .andReturn().getResponse().getContentAsString();
    return json.readTree(respuesta).get("id").asText();
  }

  @Test
  void permiteCrearListarConsultarEditarYEliminar() throws Exception {
    ObjectNode datos = producto("Café de prueba");
    String id = crear(datos);
    api.perform(get("/api/productos"))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));
    api.perform(get("/api/productos/{id}", id))
        .andExpect(status().isOk()).andExpect(jsonPath("$.precio").value(12990));

    datos.put("precio", 13990).put("stock", 4);
    api.perform(put("/api/productos/{id}", id).contentType(MediaType.APPLICATION_JSON).content(datos.toString()))
        .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id))
        .andExpect(jsonPath("$.precio").value(13990)).andExpect(jsonPath("$.stock").value(4));
    api.perform(delete("/api/productos/{id}", id)).andExpect(status().isNoContent());
    api.perform(get("/api/productos/{id}", id)).andExpect(status().isNotFound());
  }

  @Test
  void elCatalogoComienzaVacioYNoCreaProductosAutomaticamente() throws Exception {
    api.perform(get("/api/productos"))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void informaLosCamposInvalidosSinGuardar() throws Exception {
    ObjectNode datos = producto("   ").put("precio", -1).put("stock", -2);
    api.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON).content(datos.toString()))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.nombre").exists())
        .andExpect(jsonPath("$.campos.precio").exists()).andExpect(jsonPath("$.campos.stock").exists());
    api.perform(get("/api/productos")).andExpect(jsonPath("$", hasSize(0)));
  }

  @Test
  void rechazaStockConDecimalesEnLugarDeRedondearlo() throws Exception {
    api.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON)
        .content(producto("Café").put("stock", 1.5).toString()))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensaje").exists());
  }

  @Test
  void rechazaJsonIncompleto() throws Exception {
    api.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":"))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensaje").exists());
  }

  @Test
  void rechazaNombresRepetidosAunqueCambienMayusculasOEspacios() throws Exception {
    crear(producto("Colombia"));
    api.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON)
        .content(producto("  COLOMBIA  ").toString()))
        .andExpect(status().isConflict()).andExpect(jsonPath("$.mensaje").value("Ya existe un producto con ese nombre."));
  }

  @Test
  void unaOfertaNecesitaUnPrecioAnteriorMayor() throws Exception {
    api.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON)
        .content(producto("Café").put("precioAnterior", 10000).toString()))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensaje").value("El precio anterior debe ser mayor que el precio actual."));
  }

  @Test
  void elClienteNoPuedeDecidirNiCambiarLaId() throws Exception {
    ObjectNode datos = producto("Café").put("id", "id-del-cliente");
    String id = crear(datos);
    assertNotEquals("id-del-cliente", id);
    datos.put("id", "otra-id");
    api.perform(put("/api/productos/{id}", id).contentType(MediaType.APPLICATION_JSON).content(datos.toString()))
        .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
  }

  @Test
  void alEditarNoSePuedeTomarElNombreDeOtroProducto() throws Exception {
    crear(producto("Colombia"));
    String otro = crear(producto("Etiopía"));
    api.perform(put("/api/productos/{id}", otro).contentType(MediaType.APPLICATION_JSON)
        .content(producto("Colombia").toString())).andExpect(status().isConflict());
  }

  @ParameterizedTest
  @ValueSource(strings = {"GET", "PUT", "DELETE"})
  void losProductosAusentesDevuelven404(String metodo) throws Exception {
    api.perform(request(HttpMethod.valueOf(metodo), "/api/productos/no-existe")
        .contentType(MediaType.APPLICATION_JSON).content(producto("Café").toString()))
        .andExpect(status().isNotFound()).andExpect(jsonPath("$.mensaje").value("No encontramos este producto."));
  }

  @Test
  void permiteLasPeticionesDesdeElOrigenLocalDeVite() throws Exception {
    api.perform(options("/api/productos").header("Origin", "http://127.0.0.1:5173")
        .header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "Content-Type"))
        .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:5173"));
  }

  @Test
  void noHabilitaCorsParaOrigenesDesconocidos() throws Exception {
    api.perform(options("/api/productos").header("Origin", "https://otro.example")
        .header("Access-Control-Request-Method", "POST")).andExpect(status().isForbidden());
  }

  @Test
  void publicaLaDocumentacionDeLosEndpoints() throws Exception {
    api.perform(get("/v3/api-docs")).andExpect(status().isOk())
        .andExpect(jsonPath("$.paths['/api/productos'].get").exists())
        .andExpect(jsonPath("$.paths['/api/productos'].post").exists());
  }
}
