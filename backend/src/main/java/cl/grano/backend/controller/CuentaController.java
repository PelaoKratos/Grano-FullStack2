package cl.grano.backend.controller;

import cl.grano.backend.dto.DatosCuenta.*;
import cl.grano.backend.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CuentaController {
  private final UsuarioService cuentas;
  public CuentaController(UsuarioService cuentas) { this.cuentas = cuentas; }

  @GetMapping("/auth/csrf")
  public CsrfToken csrf(CsrfToken token) { return token; }

  @GetMapping("/auth/me")
  public Publico actual(Principal sesion) { return Publico.de(cuentas.buscar(sesion.getName())); }

  @PostMapping("/auth/registro")
  @ResponseStatus(HttpStatus.CREATED)
  public Publico registrar(@Valid @RequestBody Registro datos) { return cuentas.registrar(datos, false); }

  @PutMapping("/auth/perfil")
  public Publico perfil(@Valid @RequestBody Perfil datos, Principal sesion) {
    return cuentas.guardarPerfil(sesion.getName(), datos);
  }

  @PostMapping("/auth/clave")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void clave(@Valid @RequestBody Clave datos, HttpServletRequest peticion) {
    cuentas.cambiarClave(datos);
    if (peticion.getUserPrincipal() != null && peticion.getUserPrincipal().getName().equalsIgnoreCase(datos.correo().trim())) {
      if (peticion.getSession(false) != null) peticion.getSession(false).invalidate();
      org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }
  }

  @GetMapping("/usuarios")
  public List<Publico> listar() { return cuentas.listar(); }

  @PostMapping("/usuarios")
  @ResponseStatus(HttpStatus.CREATED)
  public Publico crear(@Valid @RequestBody Registro datos) { return cuentas.registrar(datos, true); }

  @PutMapping("/usuarios/{id}")
  public Publico editar(@PathVariable String id, @Valid @RequestBody Edicion datos, Principal sesion) {
    return cuentas.editar(id, datos, sesion.getName());
  }
}
