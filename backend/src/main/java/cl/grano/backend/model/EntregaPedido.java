package cl.grano.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class EntregaPedido {
  @Column(name = "entrega_nombre") public String nombre;
  @Column(name = "entrega_correo") public String correo;
  public String telefono;
  public String metodo;
  public String direccion;
  public String comuna;
  public String region;
  public String indicaciones;
}
