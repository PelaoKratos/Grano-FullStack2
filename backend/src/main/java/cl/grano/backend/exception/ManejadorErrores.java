package cl.grano.backend.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// Las respuestas de error llevan un mensaje que puede mostrar React.
@RestControllerAdvice
public class ManejadorErrores {
  @ExceptionHandler(PessimisticLockingFailureException.class)
  public ResponseEntity<?> manejarInventarioOcupado(PessimisticLockingFailureException error) {
    return ResponseEntity.status(409).body(Map.of("mensaje", "El inventario está siendo actualizado. Vuelve a intentar el pedido."));
  }
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<?> manejarEstado(ResponseStatusException error) {
    return ResponseEntity.status(error.getStatusCode()).body(Map.of("mensaje", error.getReason()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> manejarValidacion(MethodArgumentNotValidException error) {
    Map<String, String> campos = new LinkedHashMap<>();
    for (var campo : error.getBindingResult().getFieldErrors()) {
      campos.putIfAbsent(campo.getField(), campo.getDefaultMessage());
    }
    return ResponseEntity.badRequest().body(Map.of("mensaje", "Revisa los datos del formulario.", "campos", campos));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<?> manejarJson(HttpMessageNotReadableException error) {
    return ResponseEntity.badRequest().body(Map.of("mensaje", "Envía un JSON válido y usa el tipo de dato correcto en cada campo."));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<?> manejarBaseDeDatos(DataIntegrityViolationException error) {
    return ResponseEntity.status(409).body(Map.of("mensaje", "No se pudieron guardar los datos porque ya existe un registro con esos valores."));
  }
}
