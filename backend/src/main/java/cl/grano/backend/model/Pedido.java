package cl.grano.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pedidos", uniqueConstraints = @UniqueConstraint(columnNames = {"comprador", "solicitud_id"}))
public class Pedido {
  @Id public String id = "GR-" + UUID.randomUUID();
  @Column(name = "solicitud_id", nullable = false, length = 36) public String solicitudId;
  @Column(nullable = false) public String comprador;
  @Column(nullable = false) public String huellaSolicitud;
  public Instant creado = Instant.now();
  public String estado = "Recibido";
  @Column(precision = 15, scale = 0) public BigDecimal total = BigDecimal.ZERO;
  @Embedded public EntregaPedido entrega;
  @ElementCollection
  @CollectionTable(name = "pedido_productos", joinColumns = @JoinColumn(name = "pedido_id"))
  @OrderColumn(name = "posicion")
  public List<LineaPedido> productos = new ArrayList<>();
}
