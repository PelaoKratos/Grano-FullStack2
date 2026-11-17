package cl.grano.backend.controller;

import cl.grano.backend.model.Producto;
import cl.grano.backend.service.ProductoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
  private final ProductoService servicio;

  public ProductoController(ProductoService servicio) {
    this.servicio = servicio;
  }

  @GetMapping
  public List<Producto> listar() { return servicio.listar(); }

  @GetMapping("/{id}")
  public Producto obtener(@PathVariable String id) { return servicio.obtener(id); }

  @PostMapping
  public ResponseEntity<Producto> crear(@Valid @RequestBody Producto datos) {
    Producto producto = servicio.crear(datos);
    return ResponseEntity.created(URI.create("/api/productos/" + producto.getId())).body(producto);
  }

  @PutMapping("/{id}")
  public Producto actualizar(@PathVariable String id, @Valid @RequestBody Producto datos) {
    return servicio.actualizar(id, datos);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable String id) {
    servicio.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
