package cl.grano.backend.dto;

import cl.grano.backend.model.Usuario;
import jakarta.validation.constraints.*;

// Los DTO separan lo que llega del formulario de lo que guardamos en la base.
public class DatosCuenta {
  public record Registro(
      @NotBlank @Size(max = 80) String nombre,
      @NotBlank @Email @Size(max = 120) String correo,
      @NotBlank @Size(min = 6, max = 72) String contrasena,
      String rut, String rol) {}

  public record Perfil(
      @NotBlank @Size(max = 80) String nombre,
      @Size(max = 30) String telefono,
      @Size(max = 160) String direccion,
      @Size(max = 80) String comuna,
      @Size(max = 80) String region) {}

  public record Edicion(
      @NotBlank @Size(max = 80) String nombre,
      @NotBlank @Pattern(regexp = "admin|vendedor|comprador") String rol,
      @NotNull Boolean activo,
      @Size(max = 30) String telefono,
      @Size(max = 160) String direccion,
      @Size(max = 80) String comuna,
      @Size(max = 80) String region) {}

  public record Clave(@NotBlank @Email String correo, @NotBlank String actual,
      @NotBlank @Size(min = 6, max = 72) String nueva) {}

  // Esta es la única representación de una cuenta que recibe React.
  public record Publico(String id, String nombre, String correo, String rut,
      String rol, boolean activo, boolean cuentaDemostracion, String telefono,
      String direccion, String comuna, String region) {
    public static Publico de(Usuario usuario) {
      return new Publico(usuario.id, usuario.nombre, usuario.correo, usuario.rut,
          usuario.rol, usuario.activo, usuario.cuentaDemostracion, usuario.telefono,
          usuario.direccion, usuario.comuna, usuario.region);
    }
  }
}
