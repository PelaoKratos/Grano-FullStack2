package cl.grano.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mensajes")
public class Mensaje {
  @Id public String id = UUID.randomUUID().toString();
  @Column(nullable = false, length = 80) public String nombre;
  @Column(nullable = false, length = 120) public String correo;
  @Column(nullable = false, length = 500) public String texto;
  public String estado = "Nuevo";
  public Instant creado = Instant.now();
}
