package cl.grano.backend.service;

import cl.grano.backend.model.Producto;
import cl.grano.backend.repository.ProductoRepository;
import cl.grano.backend.repository.CategoriaRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ProductoService {
  private final ProductoRepository repositorio;
  private final CategoriaRepository categorias;

  public ProductoService(ProductoRepository repositorio, CategoriaRepository categorias) {
    this.repositorio = repositorio;
    this.categorias = categorias;
  }

  @Transactional(readOnly = true)
  public List<Producto> listar() {
    return repositorio.findAll(Sort.by("nombre"));
  }

  @Transactional(readOnly = true)
  public Producto obtener(String id) {
    return repositorio.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "No encontramos este producto."));
  }

  public Producto crear(Producto datos) {
    validar(datos, null);
    comprobarCategoria(datos.getCategoria());
    Producto producto = new Producto();
    // La ID nueva la decide el servidor, aunque el cliente envíe otra.
    producto.setId("nuevo-" + UUID.randomUUID());
    copiarDatos(datos, producto);
    return repositorio.save(producto);
  }

  public Producto actualizar(String id, Producto datos) {
    comprobarCategoria(datos.getCategoria());
    Producto producto = bloquear(id);
    validar(datos, id);
    copiarDatos(datos, producto);
    return repositorio.save(producto);
  }

  private void comprobarCategoria(String nombre) {
    // Tomamos primero la categoría, igual que al renombrar, para no cruzar bloqueos.
    categorias.bloquearPorNombre(nombre.trim()).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona una categoría existente y actualiza el catálogo si cambió."));
  }

  public void eliminar(String id) {
    repositorio.delete(bloquear(id));
  }

  private Producto bloquear(String id) {
    return repositorio.bloquear(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "No encontramos este producto."));
  }

  private void validar(Producto datos, String idActual) {
    Optional<Producto> repetido = repositorio.findByNombreIgnoreCase(datos.getNombre().trim());
    if (repetido.isPresent() && !repetido.get().getId().equals(idActual)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un producto con ese nombre.");
    }
    BigDecimal anterior = datos.getPrecioAnterior();
    if (anterior != null && anterior.signum() > 0 && anterior.compareTo(datos.getPrecio()) <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "El precio anterior debe ser mayor que el precio actual.");
    }
  }

  private void copiarDatos(Producto datos, Producto producto) {
    producto.setNombre(datos.getNombre().trim());
    producto.setCategoria(datos.getCategoria().trim());
    producto.setDescripcion(datos.getDescripcion().trim());
    producto.setDetalle(datos.getDetalle().trim());
    producto.setNotas(datos.getNotas() == null ? "" : datos.getNotas().trim());
    producto.setImagen(datos.getImagen() == null ? "" : datos.getImagen().trim());
    producto.setPrecio(datos.getPrecio());
    producto.setPrecioAnterior(datos.getPrecioAnterior() != null && datos.getPrecioAnterior().signum() == 0
        ? null : datos.getPrecioAnterior());
    producto.setStock(datos.getStock());
    producto.setCritico(datos.getCritico());
  }
}
