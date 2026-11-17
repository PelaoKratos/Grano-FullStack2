package cl.grano.backend;

import cl.grano.backend.model.Producto;
import cl.grano.backend.repository.ProductoRepository;
import cl.grano.backend.repository.CategoriaRepository;
import cl.grano.backend.model.Categoria;
import cl.grano.backend.service.ProductoService;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {
  @Mock ProductoRepository repositorio;
  @Mock CategoriaRepository categorias;
  @InjectMocks ProductoService servicio;

  private Producto producto() {
    Producto producto = new Producto();
    producto.setNombre(" Colombia ");
    producto.setCategoria(" Café en grano ");
    producto.setDescripcion(" Cacao ");
    producto.setDetalle(" Bolsa de 250 g ");
    producto.setPrecio(new BigDecimal("12990"));
    producto.setStock(12);
    return producto;
  }

  @Test
  void generaIdNormalizaCamposYGuardaSinModificarLaSolicitud() {
    when(categorias.bloquearPorNombre("Café en grano")).thenReturn(Optional.of(new Categoria()));
    Producto datos = producto();
    datos.setId("id-del-cliente");
    datos.setPrecioAnterior(BigDecimal.ZERO);
    when(repositorio.save(any(Producto.class))).thenAnswer(llamada -> llamada.getArgument(0));
    Producto guardado = servicio.crear(datos);
    assertTrue(guardado.getId().startsWith("nuevo-"));
    assertEquals("Colombia", guardado.getNombre());
    assertEquals("Café en grano", guardado.getCategoria());
    assertEquals("", guardado.getImagen());
    assertNull(guardado.getPrecioAnterior());
    assertEquals(" Colombia ", datos.getNombre());
    verify(repositorio).save(guardado);
  }

  @Test
  void noGuardaSiElNombrePerteneceAOtroProducto() {
    Producto existente = producto();
    existente.setId("colombia");
    when(repositorio.findByNombreIgnoreCase("Colombia")).thenReturn(Optional.of(existente));
    ResponseStatusException error = assertThrows(ResponseStatusException.class, () -> servicio.crear(producto()));
    assertEquals(409, error.getStatusCode().value());
    verify(repositorio, never()).save(any());
  }

  @Test
  void buscarUnProductoAusenteDevuelve404() {
    ResponseStatusException error = assertThrows(ResponseStatusException.class, () -> servicio.obtener("ausente"));
    assertEquals(404, error.getStatusCode().value());
  }

  @Test
  void noGuardaUnaOfertaConPrecioAnteriorMenorAlActual() {
    Producto datos = producto();
    datos.setPrecioAnterior(new BigDecimal("10000"));
    ResponseStatusException error = assertThrows(ResponseStatusException.class, () -> servicio.crear(datos));
    assertEquals(400, error.getStatusCode().value());
    verify(repositorio, never()).save(any());
  }
}
