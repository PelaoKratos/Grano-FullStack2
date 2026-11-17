package cl.grano.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
public class Usuario {
  @Id public String id = UUID.randomUUID().toString();
  @Column(nullable = false, length = 80) public String nombre;
  @Column(nullable = false, unique = true, length = 120) public String correo;
  @Column(unique = true, length = 12) public String rut;
  // El hash nunca debe aparecer en una respuesta JSON.
  @JsonIgnore @Column(nullable = false) public String contrasenaHash;
  @Column(nullable = false) public String rol = "comprador";
  public boolean activo = true;
  public boolean cuentaDemostracion = false;
  public int versionSesion = 0;
  public String telefono = "";
  public String direccion = "";
  public String comuna = "";
  public String region = "";
}
