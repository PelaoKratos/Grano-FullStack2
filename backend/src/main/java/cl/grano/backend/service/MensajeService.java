package cl.grano.backend.service;

import cl.grano.backend.dto.DatosContenido.*;
import cl.grano.backend.model.Mensaje;
import cl.grano.backend.repository.*;
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
public class MensajeService {
  private final MensajeRepository mensajes;
  private final UsuarioRepository usuarios;
  public MensajeService(MensajeRepository mensajes, UsuarioRepository usuarios) { this.mensajes = mensajes; this.usuarios = usuarios; }

  public MensajePublico enviar(Contacto datos, String correoSesion) {
    Mensaje mensaje = new Mensaje();
    mensaje.nombre = datos.nombre().trim(); mensaje.correo = datos.correo().trim().toLowerCase(Locale.ROOT);
    if (correoSesion != null) {
      var usuario = usuarios.findByCorreo(correoSesion).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión nuevamente."));
      mensaje.nombre = usuario.nombre; mensaje.correo = usuario.correo;
    }
    mensaje.texto = datos.texto().trim();
    return publico(mensajes.save(mensaje));
  }

  @Transactional(readOnly = true)
  public List<MensajePublico> listar() { return mensajes.findAll(Sort.by(Sort.Direction.DESC, "creado")).stream().map(this::publico).toList(); }
  @Transactional(readOnly = true)
  public MensajePublico obtener(String id) { return publico(mensajes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No encontramos este mensaje."))); }

  public MensajePublico marcar(String id) {
    Mensaje mensaje = mensajes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No encontramos este mensaje."));
    mensaje.estado = "Leído";
    return publico(mensaje);
  }

  private MensajePublico publico(Mensaje mensaje) {
    String fecha = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm").withZone(ZoneId.of("America/Santiago")).format(mensaje.creado);
    return new MensajePublico(mensaje.id, mensaje.nombre, mensaje.correo, mensaje.texto, mensaje.estado, fecha);
  }
}
