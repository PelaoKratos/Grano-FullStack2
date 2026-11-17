package cl.grano.backend.model;

import jakarta.persistence.*;

// Esta marca evita volver a crear categorías que el administrador ya eliminó.
@Entity
@Table(name = "marcas_iniciales")
public class MarcaInicial {
  @Id public String nombre;
  public MarcaInicial() {}
  public MarcaInicial(String nombre) { this.nombre = nombre; }
}
