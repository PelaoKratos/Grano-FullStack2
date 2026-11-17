package cl.grano.backend.controller;

import cl.grano.backend.dto.DatosPedido.*;
import cl.grano.backend.service.PedidoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
  private final PedidoService pedidos;
  public PedidoController(PedidoService pedidos) { this.pedidos = pedidos; }
  @GetMapping
  public List<Publico> listar(Principal sesion) { return pedidos.listar(sesion.getName()); }
  @GetMapping("/{id}")
  public Publico obtener(@PathVariable String id, Principal sesion) { return pedidos.obtener(id, sesion.getName()); }
  @PostMapping
  public ResponseEntity<Publico> crear(@Valid @RequestBody Crear datos, Principal sesion) {
    Publico pedido = pedidos.crear(sesion.getName(), datos);
    return ResponseEntity.created(URI.create("/api/pedidos/" + pedido.id())).body(pedido);
  }
  @PutMapping("/{id}/estado")
  public Publico estado(@PathVariable String id, @Valid @RequestBody Estado datos) { return pedidos.cambiarEstado(id, datos.estado()); }
}
