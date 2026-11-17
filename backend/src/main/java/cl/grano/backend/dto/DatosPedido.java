package cl.grano.backend.dto;

import cl.grano.backend.model.EntregaPedido;
import cl.grano.backend.model.LineaPedido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class DatosPedido {
  public record Linea(@NotBlank @Size(max = 80) String id, @NotNull @Min(1) @Max(999) Integer cantidad) {}
  public record Entrega(
      @NotBlank @Size(max = 250) String nombre,
      @NotBlank @Email @Size(max = 250) String correo,
      @NotBlank @Size(max = 250) String telefono,
      @NotBlank @Pattern(regexp = "retiro|domicilio") String metodo,
      @Size(max = 250) String direccion, @Size(max = 250) String comuna,
      @Size(max = 250) String region, @Size(max = 250) String indicaciones) {}
  public record Crear(
      @NotBlank @Pattern(regexp = "[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}") String solicitudId,
      @NotEmpty @Size(max = 100) List<@NotNull @Valid Linea> productos,
      @NotNull @Valid Entrega entrega,
      @NotBlank @Pattern(regexp = "aprobado|rechazado") String resultadoPago) {}
  public record Estado(@NotBlank @Pattern(regexp = "Recibido|En preparación|Entregado") String estado) {}
  public record Publico(String id, String solicitudId, String fecha, String comprador,
      String estado, BigDecimal total, EntregaPedido entrega, List<LineaPedido> productos) {}
}
