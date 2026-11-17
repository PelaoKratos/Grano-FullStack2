package cl.grano.backend.service;

import cl.grano.backend.model.*;
import cl.grano.backend.repository.*;
import java.text.Normalizer;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CategoriaService {
  private final CategoriaRepository categorias;
  private final ProductoRepository productos;
  private final MarcaInicialRepository marcas;
  public CategoriaService(CategoriaRepository categorias, ProductoRepository productos, MarcaInicialRepository marcas) {
    this.categorias = categorias; this.productos = productos; this.marcas = marcas;
  }

  public void inicializar() {
    if (marcas.existsById("categorias-inicializadas")) return;
    base("cafe", "Café en grano"); base("metodos", "Métodos"); base("accesorios", "Accesorios");
    // Recuperamos también las categorías de productos guardados antes de esta etapa.
    for (String id : productos.listarIds()) {
      Producto producto = productos.bloquear(id).orElse(null);
      if (producto == null) continue;
      String clave = clave(producto.getCategoria());
      if (clave.isBlank()) clave = "importada-" + UUID.randomUUID();
      Categoria categoria = categorias.findByClave(clave).orElse(null);
      if (categoria == null) {
        categoria = new Categoria(); categoria.nombre = producto.getCategoria(); categoria.clave = clave;
        categorias.save(categoria);
      }
      producto.setCategoria(categoria.nombre);
    }
    marcas.save(new MarcaInicial("categorias-inicializadas"));
  }

  private void base(String id, String nombre) {
    if (categorias.findByClave(id).isPresent()) return;
    Categoria categoria = new Categoria(); categoria.id = id; categoria.nombre = nombre; categoria.clave = id;
    categorias.save(categoria);
  }

  @Transactional(readOnly = true)
  public List<Categoria> listar() { return categorias.findAll(Sort.by("nombre")); }
  @Transactional(readOnly = true)
  public Categoria obtener(String id) { return categorias.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "No encontramos esta categoría.")); }

  public Categoria crear(String nombre) {
    Categoria categoria = new Categoria(); validar(nombre, categoria.id);
    categoria.nombre = nombre.trim(); categoria.clave = clave(nombre);
    return categorias.save(categoria);
  }

  public Categoria renombrar(String id, String nombre) {
    Categoria categoria = buscar(id);
    validar(nombre, id);
    // El cambio de nombre y el catálogo se guardan en una sola transacción.
    for (String productoId : productos.buscarIdsPorCategoria(categoria.nombre)) {
      // Leemos el producto después de tomar su bloqueo, para conservar el stock de compras recientes.
      Producto producto = productos.bloquear(productoId).orElse(null);
      if (producto != null && producto.getCategoria().equals(categoria.nombre)) producto.setCategoria(nombre.trim());
    }
    categoria.nombre = nombre.trim(); categoria.clave = clave(nombre);
    return categoria;
  }

  public void eliminar(String id) {
    Categoria categoria = buscar(id);
    if (productos.existsByCategoria(categoria.nombre)) throw error(HttpStatus.CONFLICT, "Quita o cambia los productos de categoría antes de eliminarla.");
    categorias.delete(categoria);
  }

  private Categoria buscar(String id) { return categorias.bloquear(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "No encontramos esta categoría.")); }
  private void validar(String nombre, String id) {
    String clave = clave(nombre);
    if (clave.isBlank() || clave.equals("todos")) throw error(HttpStatus.BAD_REQUEST, "Elige un nombre válido para la categoría.");
    categorias.findByClave(clave).filter(otra -> !otra.id.equals(id)).ifPresent(otra -> {
      throw error(HttpStatus.CONFLICT, "Ya existe una categoría con un nombre equivalente.");
    });
  }
  private ResponseStatusException error(HttpStatus estado, String mensaje) { return new ResponseStatusException(estado, mensaje); }
  private String clave(String nombre) {
    String clave = Normalizer.normalize(nombre, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
        .trim().toLowerCase(Locale.ROOT);
    if (clave.equals("cafe en grano")) return "cafe";
    return clave.replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
  }
}
