package cl.grano.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "categorias")
public class Categoria {
  @Id public String id = UUID.randomUUID().toString();
  @Column(nullable = false, unique = true, length = 60) public String nombre;
  @Column(nullable = false, unique = true, length = 80) public String clave;
}
