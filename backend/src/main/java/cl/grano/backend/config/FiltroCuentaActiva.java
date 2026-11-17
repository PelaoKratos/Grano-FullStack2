package cl.grano.backend.config;

import cl.grano.backend.repository.UsuarioRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

// Si cambia un rol, la activación o la contraseña, no confiamos en una sesión vieja.
public class FiltroCuentaActiva extends OncePerRequestFilter {
  private final UsuarioRepository repositorio;
  public FiltroCuentaActiva(UsuarioRepository repositorio) { this.repositorio = repositorio; }

  @Override
  protected void doFilterInternal(HttpServletRequest peticion, HttpServletResponse respuesta, FilterChain cadena)
      throws ServletException, IOException {
    var autenticacion = SecurityContextHolder.getContext().getAuthentication();
    if (autenticacion != null && autenticacion.getPrincipal() instanceof UserDetails anterior) {
      var usuario = repositorio.findByCorreo(anterior.getUsername()).orElse(null);
      if (usuario == null || !usuario.activo || (anterior instanceof CuentaAutenticada cuenta && cuenta.versionSesion != usuario.versionSesion)) {
        SecurityContextHolder.clearContext();
        if (peticion.getSession(false) != null) peticion.getSession(false).invalidate();
        SeguridadConfig.responder(respuesta, 401, "Tu sesión terminó. Inicia sesión nuevamente.");
        return;
      }
      var actual = new CuentaAutenticada(usuario);
      actual.eraseCredentials();
      SecurityContextHolder.getContext().setAuthentication(
          UsernamePasswordAuthenticationToken.authenticated(actual, null, actual.getAuthorities()));
    }
    cadena.doFilter(peticion, respuesta);
  }
}
