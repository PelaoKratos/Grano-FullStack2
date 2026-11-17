package cl.grano.backend;

import cl.grano.backend.model.Usuario;
import cl.grano.backend.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CuentaApiTest {
  @Autowired MockMvc api;
  @Autowired UsuarioRepository usuarios;
  @Autowired PasswordEncoder claves;
  @Autowired ObjectMapper json;

  @BeforeEach
  void preparar() {
    usuarios.deleteAll();
    crear("admin@grano.cl", "admin");
    crear("venta@grano.cl", "vendedor");
    crear("cliente@grano.cl", "comprador");
  }

  private Usuario crear(String correo, String rol) {
    Usuario usuario = new Usuario();
    usuario.nombre = "Cuenta de prueba";
    usuario.correo = correo;
    usuario.rol = rol;
    usuario.contrasenaHash = claves.encode("Clave123");
    return usuarios.save(usuario);
  }

  private MockHttpSession entrar(String correo) throws Exception {
    return (MockHttpSession) api.perform(post("/api/auth/login").with(csrf())
        .param("correo", correo).param("contrasena", "Clave123"))
        .andExpect(status().isOk()).andExpect(jsonPath("$.contrasenaHash").doesNotExist())
        .andExpect(jsonPath("$.contrasena").doesNotExist()).andReturn().getRequest().getSession(false);
  }

  private String registro(String correo, String rut) {
    return "{\"nombre\":\"Nuevo cliente\",\"correo\":\"" + correo + "\",\"rut\":\"" + rut
        + "\",\"contrasena\":\"Clave123\",\"rol\":\"admin\"}";
  }

  @Test
  void entregaCsrfYNoPermiteEscribirSinToken() throws Exception {
    api.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
    api.perform(post("/api/auth/login").param("correo", "admin@grano.cl").param("contrasena", "Clave123"))
        .andExpect(status().isForbidden());
    api.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void registroPublicoSiempreCreaCompradorConHash() throws Exception {
    api.perform(post("/api/auth/registro").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(registro("nuevo@grano.cl", "12.345.678-5")))
        .andExpect(status().isCreated()).andExpect(jsonPath("$.rol").value("comprador"))
        .andExpect(jsonPath("$.contrasenaHash").doesNotExist());
    Usuario creado = usuarios.findByCorreo("nuevo@grano.cl").orElseThrow();
    assertNotEquals("Clave123", creado.contrasenaHash);
    assertTrue(claves.matches("Clave123", creado.contrasenaHash));
    MockHttpSession sesion = entrar("nuevo@grano.cl");
    api.perform(get("/api/auth/me").session(sesion)).andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("comprador"));
  }

  @Test
  void rechazaCorreoRutYClaveInvalidos() throws Exception {
    api.perform(post("/api/auth/registro").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(registro("nuevo@grano.cl", "12.345.678-9"))).andExpect(status().isBadRequest());
    api.perform(post("/api/auth/registro").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(registro("mal-correo", "12.345.678-5").replace("Clave123", "123")))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.correo").exists());
  }

  @Test
  void noDuplicaCorreoNiRutConDiferenteFormato() throws Exception {
    api.perform(post("/api/auth/registro").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(registro("nuevo@grano.cl", "12.345.678-5"))).andExpect(status().isCreated());
    api.perform(post("/api/auth/registro").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(registro("otro@grano.cl", "123456785"))).andExpect(status().isConflict());
    api.perform(post("/api/auth/registro").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(registro("NUEVO@grano.cl", "11.111.111-1"))).andExpect(status().isConflict());
  }

  @Test
  void rechazaClaveIncorrectaYCuentaDesactivada() throws Exception {
    api.perform(post("/api/auth/login").with(csrf()).param("correo", "admin@grano.cl").param("contrasena", "otra"))
        .andExpect(status().isUnauthorized());
    Usuario cliente = usuarios.findByCorreo("cliente@grano.cl").orElseThrow();
    cliente.activo = false;
    usuarios.save(cliente);
    api.perform(post("/api/auth/login").with(csrf()).param("correo", cliente.correo).param("contrasena", "Clave123"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void soloAdminPuedeModificarProductosOConsultarUsuarios() throws Exception {
    api.perform(get("/api/productos")).andExpect(status().isOk());
    api.perform(post("/api/productos").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isUnauthorized());
    for (String correo : new String[]{"venta@grano.cl", "cliente@grano.cl"}) {
      MockHttpSession sesion = entrar(correo);
      api.perform(post("/api/productos").session(sesion).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
          .andExpect(status().isForbidden());
      api.perform(get("/api/usuarios").session(sesion)).andExpect(status().isForbidden());
    }
    api.perform(get("/api/usuarios").session(entrar("admin@grano.cl"))).andExpect(status().isOk())
        .andExpect(jsonPath("$[0].contrasenaHash").doesNotExist());
  }

  @Test
  void cierraLaSesionEInvalidaSuAcceso() throws Exception {
    MockHttpSession sesion = entrar("cliente@grano.cl");
    api.perform(post("/api/auth/logout").session(sesion).with(csrf())).andExpect(status().isNoContent());
    assertTrue(sesion.isInvalid());
    api.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void guardaPerfilSinPermitirCambiarElRolDesdeEseFormulario() throws Exception {
    MockHttpSession sesion = entrar("cliente@grano.cl");
    api.perform(put("/api/auth/perfil").session(sesion).with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content("{\"nombre\":\"Cliente editado\",\"telefono\":\"+56 9 1234 5678\",\"rol\":\"admin\"}"))
        .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("comprador"));
    api.perform(put("/api/auth/perfil").session(sesion).with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content("{\"nombre\":\"Cliente\",\"telefono\":\"abc123\"}")).andExpect(status().isBadRequest());
  }

  @Test
  void cambiarClaveInvalidaLasSesionesAnteriores() throws Exception {
    MockHttpSession sesion = entrar("cliente@grano.cl");
    api.perform(post("/api/auth/clave").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content("{\"correo\":\"cliente@grano.cl\",\"actual\":\"Clave123\",\"nueva\":\"Nueva123\"}"))
        .andExpect(status().isNoContent());
    api.perform(get("/api/auth/me").session(sesion)).andExpect(status().isUnauthorized());
    api.perform(post("/api/auth/login").with(csrf()).param("correo", "cliente@grano.cl").param("contrasena", "Nueva123"))
        .andExpect(status().isOk());
  }

  @Test
  void desactivarOQuitarRolAdminSeAplicaALaSesionAbierta() throws Exception {
    MockHttpSession sesion = entrar("admin@grano.cl");
    Usuario admin = usuarios.findByCorreo("admin@grano.cl").orElseThrow();
    admin.rol = "comprador";
    usuarios.save(admin);
    api.perform(get("/api/usuarios").session(sesion)).andExpect(status().isForbidden());
    admin.activo = false;
    usuarios.save(admin);
    api.perform(get("/api/auth/me").session(sesion)).andExpect(status().isUnauthorized());
  }

  @Test
  void adminCreaUsuariosYNoPuedeDesactivarseASiMismo() throws Exception {
    MockHttpSession sesion = entrar("admin@grano.cl");
    api.perform(post("/api/usuarios").session(sesion).with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content("{\"nombre\":\"Vendedor nuevo\",\"correo\":\"nuevo@grano.cl\",\"contrasena\":\"Clave123\",\"rol\":\"vendedor\"}"))
        .andExpect(status().isCreated()).andExpect(jsonPath("$.rol").value("vendedor"));
    String id = usuarios.findByCorreo("admin@grano.cl").orElseThrow().id;
    api.perform(put("/api/usuarios/{id}", id).session(sesion).with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content("{\"nombre\":\"Admin\",\"rol\":\"comprador\",\"activo\":false}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void elTokenCsrfRealFuncionaConLoginYLogoutYSeRenueva() throws Exception {
    var inicio = api.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
    MockHttpSession sesion = (MockHttpSession) inicio.getRequest().getSession(false);
    String idAnterior = sesion.getId();
    String token = json.readTree(inicio.getResponse().getContentAsString()).get("token").asText();
    api.perform(post("/api/auth/login").session(sesion).header("X-CSRF-TOKEN", token)
        .param("correo", "admin@grano.cl").param("contrasena", "Clave123")).andExpect(status().isOk());
    assertNotEquals(idAnterior, sesion.getId());
    var siguiente = api.perform(get("/api/auth/csrf").session(sesion)).andReturn();
    String nuevo = json.readTree(siguiente.getResponse().getContentAsString()).get("token").asText();
    assertNotEquals(token, nuevo);
    api.perform(post("/api/auth/logout").session(sesion).header("X-CSRF-TOKEN", nuevo)).andExpect(status().isNoContent());
  }

  @Test
  void adminActualizaUnaCuentaYLosCambiosQuedanEnLaBase() throws Exception {
    MockHttpSession sesion = entrar("admin@grano.cl");
    Usuario cliente = usuarios.findByCorreo("cliente@grano.cl").orElseThrow();
    api.perform(put("/api/usuarios/{id}", cliente.id).session(sesion).with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content("{\"nombre\":\"Ahora vendedor\",\"rol\":\"vendedor\",\"activo\":true}"))
        .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("vendedor"));
    assertEquals("vendedor", usuarios.findById(cliente.id).orElseThrow().rol);
    cliente.cuentaDemostracion = true;
    usuarios.save(cliente);
    api.perform(put("/api/usuarios/{id}", cliente.id).session(sesion).with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content("{\"nombre\":\"Cliente\",\"rol\":\"comprador\",\"activo\":false}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void noCambiaClaveConCredencialesIncorrectasNiEnCuentasDeDemostracion() throws Exception {
    String cuerpo = "{\"correo\":\"cliente@grano.cl\",\"actual\":\"Otra123\",\"nueva\":\"Nueva123\"}";
    api.perform(post("/api/auth/clave").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(cuerpo))
        .andExpect(status().isUnauthorized());
    Usuario cliente = usuarios.findByCorreo("cliente@grano.cl").orElseThrow();
    cliente.cuentaDemostracion = true;
    usuarios.save(cliente);
    api.perform(post("/api/auth/clave").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(cuerpo.replace("Otra123", "Clave123"))).andExpect(status().isBadRequest());
  }

  @Test
  void rechazaClavesQueSuperanElLimiteDeBytesYPermiteCorsConCookies() throws Exception {
    api.perform(post("/api/auth/registro").with(csrf()).contentType(MediaType.APPLICATION_JSON)
        .content(registro("nuevo@grano.cl", "12.345.678-5").replace("Clave123", "á".repeat(40))))
        .andExpect(status().isBadRequest());
    api.perform(options("/api/auth/login").header("Origin", "http://localhost:5173")
        .header("Access-Control-Request-Method", "POST")
        .header("Access-Control-Request-Headers", "X-CSRF-TOKEN,Content-Type"))
        .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Credentials", "true"));
  }
}
