package cl.grano.backend.config;

import cl.grano.backend.model.Usuario;
import cl.grano.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Son las mismas cuentas de la práctica. Solo se crean si todavía no existen.
@Component
@ConditionalOnProperty(name = "grano.cuentas-demo.enabled", havingValue = "true")
public class CuentasDemostracionConfig implements CommandLineRunner {
  private final UsuarioRepository repositorio;
  private final PasswordEncoder contrasenas;
  public CuentasDemostracionConfig(UsuarioRepository repositorio, PasswordEncoder contrasenas) {
    this.repositorio = repositorio;
    this.contrasenas = contrasenas;
  }

  @Override
  public void run(String... argumentos) {
    crear("Administrador de prueba", "admin@duocuc.cl", "1234", "admin");
    crear("Vendedor de prueba", "vendedor@duocuc.cl", "Venta123", "vendedor");
    crear("Comprador de prueba", "comprador@duocuc.cl", "Cliente123", "comprador");
  }

  private void crear(String nombre, String correo, String clave, String rol) {
    if (repositorio.findByCorreo(correo).isPresent()) return;
    Usuario usuario = new Usuario();
    usuario.nombre = nombre;
    usuario.correo = correo;
    usuario.rol = rol;
    usuario.cuentaDemostracion = true;
    usuario.contrasenaHash = contrasenas.encode(clave);
    repositorio.save(usuario);
  }
}
