package cl.grano.backend.controller;

import cl.grano.backend.dto.DatosContenido.*;
import cl.grano.backend.model.Categoria;
import cl.grano.backend.service.*;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ContenidoController {
  private final CategoriaService categorias;
  private final MensajeService mensajes;
  public ContenidoController(CategoriaService categorias, MensajeService mensajes) { this.categorias = categorias; this.mensajes = mensajes; }
  @GetMapping("/categorias") public List<Categoria> categorias() { return categorias.listar(); }
  @GetMapping("/categorias/{id}") public Categoria categoria(@PathVariable String id) { return categorias.obtener(id); }
  @PostMapping("/categorias") public ResponseEntity<Categoria> crear(@Valid @RequestBody NombreCategoria datos) {
    Categoria categoria = categorias.crear(datos.nombre());
    return ResponseEntity.created(URI.create("/api/categorias/" + categoria.id)).body(categoria);
  }
  @PutMapping("/categorias/{id}") public Categoria renombrar(@PathVariable String id, @Valid @RequestBody NombreCategoria datos) { return categorias.renombrar(id, datos.nombre()); }
  @DeleteMapping("/categorias/{id}") public ResponseEntity<Void> eliminar(@PathVariable String id) { categorias.eliminar(id); return ResponseEntity.noContent().build(); }
  @PostMapping("/mensajes") public ResponseEntity<MensajePublico> enviar(@Valid @RequestBody Contacto datos, Principal sesion) {
    MensajePublico mensaje = mensajes.enviar(datos, sesion == null ? null : sesion.getName());
    return ResponseEntity.created(URI.create("/api/mensajes/" + mensaje.id())).body(mensaje);
  }
  @GetMapping("/mensajes") public List<MensajePublico> mensajes() { return mensajes.listar(); }
  @GetMapping("/mensajes/{id}") public MensajePublico mensaje(@PathVariable String id) { return mensajes.obtener(id); }
  @PutMapping("/mensajes/{id}/leido") public MensajePublico marcar(@PathVariable String id) { return mensajes.marcar(id); }
}
