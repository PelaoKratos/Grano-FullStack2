package cl.grano.backend.service;

import cl.grano.backend.dto.DatosCuenta.*;
import cl.grano.backend.model.Usuario;
import cl.grano.backend.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class UsuarioService {
  private final UsuarioRepository repositorio;
  private final PasswordEncoder contrasenas;

  public UsuarioService(UsuarioRepository repositorio, PasswordEncoder contrasenas) {
    this.repositorio = repositorio;
    this.contrasenas = contrasenas;
  }

  public Usuario buscar(String correo) {
    return repositorio.findByCorreo(correo.trim().toLowerCase(Locale.ROOT))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión nuevamente."));
  }

  public List<Publico> listar() {
    return repositorio.findAll().stream().map(Publico::de).toList();
  }

  public Publico registrar(Registro datos, boolean desdeAdmin) {
    String correo = datos.correo().trim().toLowerCase(Locale.ROOT);
    String rut = normalizarRut(datos.rut());
    if (!desdeAdmin && rut == null) fallar("Ingresa un RUT válido.");
    if (repositorio.findByCorreo(correo).isPresent() || (rut != null && repositorio.existsByRut(rut))) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese RUT o correo.");
    }
    comprobarClave(datos.contrasena());
    String rol = desdeAdmin ? datos.rol() : "comprador";
    if (!List.of("admin", "vendedor", "comprador").contains(rol == null ? "" : rol)) fallar("Elige un rol válido.");
    Usuario usuario = new Usuario();
    usuario.nombre = datos.nombre().trim();
    usuario.correo = correo;
    usuario.rut = rut;
    usuario.rol = rol;
    usuario.contrasenaHash = contrasenas.encode(datos.contrasena());
    return Publico.de(repositorio.save(usuario));
  }

  public Publico guardarPerfil(String correo, Perfil datos) {
    Usuario usuario = buscar(correo);
    copiarPerfil(usuario, datos);
    return Publico.de(repositorio.save(usuario));
  }

  public Publico editar(String id, Edicion datos, String correoAdmin) {
    Usuario usuario = repositorio.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "No encontramos esta cuenta."));
    if ((usuario.cuentaDemostracion || usuario.correo.equals(correoAdmin))
        && (!usuario.rol.equals(datos.rol()) || !datos.activo())) {
      fallar("No puedes desactivar ni cambiar el rol de esta cuenta.");
    }
    copiarPerfil(usuario, new Perfil(datos.nombre(), datos.telefono(), datos.direccion(), datos.comuna(), datos.region()));
    usuario.rol = datos.rol();
    if (usuario.activo && !datos.activo()) usuario.versionSesion++;
    usuario.activo = datos.activo();
    return Publico.de(repositorio.save(usuario));
  }

  public void cambiarClave(Clave datos) {
    Usuario usuario = repositorio.findByCorreo(datos.correo().trim().toLowerCase(Locale.ROOT)).orElse(null);
    if (usuario == null || !usuario.activo || !contrasenas.matches(datos.actual(), usuario.contrasenaHash)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No pudimos validar el correo y la contraseña actual.");
    }
    if (usuario.cuentaDemostracion) fallar("Las cuentas de prueba mantienen sus contraseñas de demostración.");
    comprobarClave(datos.nueva());
    usuario.contrasenaHash = contrasenas.encode(datos.nueva());
    usuario.versionSesion++;
    repositorio.save(usuario);
  }

  private void copiarPerfil(Usuario usuario, Perfil datos) {
    String telefono = texto(datos.telefono());
    if (!telefono.isEmpty()) {
      if (!telefono.matches("[+0-9() \\-]+")) fallar("Revisa el formato del teléfono chileno.");
      String compacto = telefono.replaceAll("[()\\s-]", "");
      if (!compacto.matches("(\\+?56)?[2-9][0-9]{8}")) fallar("Usa un teléfono chileno de nueve dígitos, con o sin +56.");
    }
    usuario.nombre = datos.nombre().trim();
    usuario.telefono = telefono;
    usuario.direccion = texto(datos.direccion());
    usuario.comuna = texto(datos.comuna());
    usuario.region = texto(datos.region());
  }

  private String texto(String valor) { return valor == null ? "" : valor.trim(); }

  private void comprobarClave(String clave) {
    if (clave.getBytes(StandardCharsets.UTF_8).length > 72) fallar("La contraseña es demasiado larga para guardarla.");
  }

  // Calculamos módulo 11 igual que en el formulario, pero también en Java.
  private String normalizarRut(String valor) {
    if (valor == null || valor.isBlank()) return null;
    String rut = valor.trim().toUpperCase(Locale.ROOT);
    if (!rut.matches("(?:[0-9]{7,8}-?|[0-9]{1,2}\\.[0-9]{3}\\.[0-9]{3}-)[0-9K]")) fallar("Revisa el formato del RUT.");
    rut = rut.replace(".", "").replace("-", "");
    String cuerpo = rut.substring(0, rut.length() - 1);
    int suma = 0, multiplicador = 2;
    for (int i = cuerpo.length() - 1; i >= 0; i--) {
      suma += (cuerpo.charAt(i) - '0') * multiplicador;
      multiplicador = multiplicador == 7 ? 2 : multiplicador + 1;
    }
    int valorDv = 11 - suma % 11;
    String dv = valorDv == 11 ? "0" : valorDv == 10 ? "K" : String.valueOf(valorDv);
    if (!rut.endsWith(dv) || Long.parseLong(cuerpo) == 0) fallar("El dígito verificador del RUT no es correcto.");
    return Long.parseLong(cuerpo) + "-" + dv;
  }

  private void fallar(String mensaje) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje); }
}
