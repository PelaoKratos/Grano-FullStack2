package cl.grano.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

// Los campos conservan los nombres que ya usamos en React.
@Entity
@Table(name = "productos")
public class Producto {
  @Id
  @Column(length = 80)
  private String id;

  @NotBlank(message = "Escribe el nombre.")
  @Size(max = 80, message = "El nombre admite hasta 80 caracteres.")
  @Column(nullable = false, length = 80, unique = true)
  private String nombre;

  @NotBlank(message = "Selecciona una categoría.")
  @Size(max = 60)
  @Column(nullable = false, length = 60)
  private String categoria;

  @Size(max = 120)
  private String notas;

  @NotBlank(message = "Escribe una descripción.")
  @Size(max = 120)
  @Column(length = 120)
  private String descripcion;

  @NotBlank(message = "Escribe el detalle del producto.")
  @Size(max = 500)
  @Column(length = 500)
  private String detalle;

  @NotNull(message = "Ingresa el precio.")
  @DecimalMin(value = "1", message = "El precio debe ser mayor que cero.")
  @Digits(integer = 10, fraction = 0, message = "Usa pesos enteros para el precio.")
  @Column(nullable = false, precision = 10, scale = 0)
  private BigDecimal precio;

  @DecimalMin(value = "0")
  @Digits(integer = 10, fraction = 0)
  @Column(precision = 10, scale = 0)
  private BigDecimal precioAnterior;

  @NotNull(message = "Ingresa el stock.")
  @Min(value = 0, message = "El stock no puede ser negativo.")
  @Column(nullable = false)
  private Integer stock;

  @NotNull
  @Min(value = 0, message = "El stock crítico no puede ser negativo.")
  private Integer critico = 3;

  @Lob
  @Size(max = 700000, message = "La imagen supera el tamaño admitido.")
  private String imagen;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getNombre() { return nombre; }
  public void setNombre(String nombre) { this.nombre = nombre; }
  public String getCategoria() { return categoria; }
  public void setCategoria(String categoria) { this.categoria = categoria; }
  public String getNotas() { return notas; }
  public void setNotas(String notas) { this.notas = notas; }
  public String getDescripcion() { return descripcion; }
  public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
  public String getDetalle() { return detalle; }
  public void setDetalle(String detalle) { this.detalle = detalle; }
  public BigDecimal getPrecio() { return precio; }
  public void setPrecio(BigDecimal precio) { this.precio = precio; }
  public BigDecimal getPrecioAnterior() { return precioAnterior; }
  public void setPrecioAnterior(BigDecimal precioAnterior) { this.precioAnterior = precioAnterior; }
  public Integer getStock() { return stock; }
  public void setStock(Integer stock) { this.stock = stock; }
  public Integer getCritico() { return critico; }
  public void setCritico(Integer critico) { this.critico = critico; }
  public String getImagen() { return imagen; }
  public void setImagen(String imagen) { this.imagen = imagen; }
}
