package cl.grano.backend.service;

import cl.grano.backend.dto.DatosPedido.*;
import cl.grano.backend.model.*;
import cl.grano.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PedidoService {
  private final PedidoRepository pedidos;
  private final ProductoRepository productos;
  private final UsuarioRepository usuarios;
  private final ObjectMapper json;

  public PedidoService(PedidoRepository pedidos, ProductoRepository productos, UsuarioRepository usuarios, ObjectMapper json) {
    this.pedidos = pedidos; this.productos = productos; this.usuarios = usuarios; this.json = json;
  }

  public Publico crear(String correo, Crear datos) {
    // Bloqueamos la cuenta para que dos reintentos de la misma compra no creen dos pedidos.
    Usuario comprador = usuarios.bloquearPorCorreo(correo).orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "Inicia sesión nuevamente."));
    if (!comprador.activo || !"comprador".equals(comprador.rol)) throw error(HttpStatus.FORBIDDEN, "Solo un comprador activo puede realizar pedidos.");
    String huella = huella(datos);
    var existente = pedidos.findByCompradorAndSolicitudId(correo, datos.solicitudId());
    if (existente.isPresent()) {
      if (!existente.get().huellaSolicitud.equals(huella)) throw error(HttpStatus.CONFLICT, "Esta solicitud ya se usó para otro pedido. Actualiza tus datos antes de continuar.");
      return publico(existente.get());
    }
    EntregaPedido entrega = entrega(datos.entrega());
    if (!"aprobado".equals(datos.resultadoPago())) throw error(HttpStatus.BAD_REQUEST, "El pago de demostración fue rechazado. Tu carrito y el stock se conservan.");
    Pedido pedido = new Pedido();
    pedido.comprador = correo;
    pedido.solicitudId = datos.solicitudId();
    pedido.huellaSolicitud = huella;
    pedido.entrega = entrega;
    Set<String> vistos = new HashSet<>();
    // Tomamos los productos siempre en el mismo orden para evitar bloqueos cruzados.
    for (Linea linea : datos.productos().stream().sorted(Comparator.comparing(Linea::id)).toList()) {
      if (!vistos.add(linea.id())) throw error(HttpStatus.BAD_REQUEST, "Cada producto debe aparecer una sola vez en el carrito.");
      Producto producto = productos.bloquear(linea.id()).orElseThrow(() -> error(HttpStatus.CONFLICT, "Un producto ya no está disponible. Revisa tu carrito."));
      if (producto.getStock() < linea.cantidad()) throw error(HttpStatus.CONFLICT, "No queda stock suficiente de " + producto.getNombre() + ". Ajusta la cantidad del carrito.");
      LineaPedido copia = new LineaPedido();
      copia.id = producto.getId(); copia.nombre = producto.getNombre(); copia.categoria = producto.getCategoria();
      copia.precio = producto.getPrecio(); copia.cantidad = linea.cantidad(); copia.imagen = producto.getImagen();
      pedido.productos.add(copia);
      pedido.total = pedido.total.add(copia.precio.multiply(BigDecimal.valueOf(copia.cantidad)));
      producto.setStock(producto.getStock() - linea.cantidad());
    }
    // Pedido y stock se confirman juntos. Si cualquier validación falla, se revierte todo.
    return publico(pedidos.saveAndFlush(pedido));
  }

  @Transactional(readOnly = true)
  public List<Publico> listar(String correo) {
    Usuario usuario = usuarios.findByCorreo(correo).orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "Inicia sesión nuevamente."));
    List<Pedido> lista = "comprador".equals(usuario.rol) ? pedidos.findByCompradorOrderByCreadoDesc(correo)
        : pedidos.findAll(Sort.by(Sort.Direction.DESC, "creado"));
    return lista.stream().map(this::publico).toList();
  }

  @Transactional(readOnly = true)
  public Publico obtener(String id, String correo) {
    Pedido pedido = buscar(id);
    Usuario usuario = usuarios.findByCorreo(correo).orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "Inicia sesión nuevamente."));
    if ("comprador".equals(usuario.rol) && !pedido.comprador.equals(correo)) throw error(HttpStatus.NOT_FOUND, "No encontramos este pedido.");
    return publico(pedido);
  }

  public Publico cambiarEstado(String id, String estado) {
    Pedido pedido = pedidos.bloquear(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "No encontramos este pedido."));
    pedido.estado = estado;
    return publico(pedido);
  }

  private Pedido buscar(String id) { return pedidos.findById(id).orElseThrow(() -> error(HttpStatus.NOT_FOUND, "No encontramos este pedido.")); }
  private ResponseStatusException error(HttpStatus estado, String mensaje) { return new ResponseStatusException(estado, mensaje); }
  private String texto(String valor) { return valor == null ? "" : valor.trim(); }

  private EntregaPedido entrega(Entrega datos) {
    EntregaPedido entrega = new EntregaPedido();
    entrega.nombre = texto(datos.nombre()); entrega.correo = texto(datos.correo());
    entrega.telefono = texto(datos.telefono()); entrega.metodo = datos.metodo();
    entrega.direccion = texto(datos.direccion()); entrega.comuna = texto(datos.comuna());
    entrega.region = texto(datos.region()); entrega.indicaciones = texto(datos.indicaciones());
    String telefono = entrega.telefono.replaceAll("[()\\s-]", "");
    if (!telefono.matches("(\\+?56)?[2-9][0-9]{8}")) throw error(HttpStatus.BAD_REQUEST, "Ingresa un teléfono chileno válido.");
    if ("domicilio".equals(entrega.metodo) && (entrega.direccion.isBlank() || entrega.comuna.isBlank() || entrega.region.isBlank()))
      throw error(HttpStatus.BAD_REQUEST, "Completa la dirección, comuna y región de entrega.");
    return entrega;
  }

  private String huella(Crear datos) {
    try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json.writeValueAsBytes(datos))); }
    catch (Exception fallo) { throw new IllegalStateException("No se pudo preparar la solicitud del pedido.", fallo); }
  }

  private Publico publico(Pedido pedido) {
    String fecha = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm").withZone(ZoneId.of("America/Santiago")).format(pedido.creado);
    return new Publico(pedido.id, pedido.solicitudId, fecha, pedido.comprador, pedido.estado, pedido.total, pedido.entrega, List.copyOf(pedido.productos));
  }
}
