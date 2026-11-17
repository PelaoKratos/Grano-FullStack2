package cl.grano.backend.dto;

import jakarta.validation.constraints.*;

public class DatosContenido {
  public record NombreCategoria(@NotBlank @Size(max = 60) String nombre) {}
  public record Contacto(@NotBlank @Size(max = 80) String nombre,
      @NotBlank @Email @Size(max = 120) String correo,
      @NotBlank @Size(max = 500) String texto) {}
  public record MensajePublico(String id, String nombre, String correo, String texto, String estado, String fecha) {}
}
