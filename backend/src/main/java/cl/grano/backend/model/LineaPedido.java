package cl.grano.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

// Es una copia del producto comprado. No depende de que siga en el catálogo.
@Embeddable
public class LineaPedido {
  public String id;
  public String nombre;
  public String categoria;
  @Column(precision = 10, scale = 0) public BigDecimal precio;
  public Integer cantidad;
  @Lob public String imagen;
}
