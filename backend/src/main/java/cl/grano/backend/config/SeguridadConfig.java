package cl.grano.backend.config;

import cl.grano.backend.dto.DatosCuenta.Publico;
import cl.grano.backend.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;

@Configuration
public class SeguridadConfig {
  @Bean
  PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  UserDetailsService cuentas(UsuarioRepository repositorio) {
    return correo -> {
      var usuario = repositorio.findByCorreo(correo.trim().toLowerCase(Locale.ROOT))
          .orElseThrow(() -> new UsernameNotFoundException("Credenciales incorrectas"));
      return new CuentaAutenticada(usuario);
    };
  }

  @Bean
  SecurityFilterChain seguridad(HttpSecurity http, UsuarioRepository repositorio, ObjectMapper json) throws Exception {
    http.cors(Customizer.withDefaults())
        // Conservamos CSRF. React obtiene el token desde /api/auth/csrf antes de escribir.
        .csrf(Customizer.withDefaults())
        .requestCache(cache -> cache.disable())
        .authorizeHttpRequests(reglas -> reglas
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/productos", "/api/productos/**", "/api/auth/csrf").permitAll()
            .requestMatchers("/api/auth/login", "/api/auth/registro", "/api/auth/clave").permitAll()
            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/error").permitAll()
            .requestMatchers("/api/productos", "/api/productos/**", "/api/usuarios", "/api/usuarios/**").hasRole("admin")
            .requestMatchers("/api/auth/me", "/api/auth/perfil").authenticated()
            .anyRequest().denyAll())
        .exceptionHandling(errores -> errores
            .authenticationEntryPoint((peticion, respuesta, fallo) -> responder(respuesta, 401, "Inicia sesión nuevamente."))
            .accessDeniedHandler((peticion, respuesta, fallo) -> responder(respuesta, 403, "No tienes permiso o la sesión de seguridad cambió. Vuelve a intentar.")))
        .formLogin(login -> login.loginProcessingUrl("/api/auth/login")
            .usernameParameter("correo").passwordParameter("contrasena")
            .successHandler((peticion, respuesta, autenticacion) -> {
              respuesta.setContentType("application/json;charset=UTF-8");
              json.writeValue(respuesta.getWriter(), Publico.de(repositorio.findByCorreo(autenticacion.getName()).orElseThrow()));
            })
            .failureHandler((peticion, respuesta, fallo) -> responder(respuesta, 401, "Correo o contraseña incorrectos, o cuenta desactivada.")))
        .logout(salir -> salir.logoutUrl("/api/auth/logout")
            .deleteCookies("JSESSIONID")
            .logoutSuccessHandler((peticion, respuesta, autenticacion) -> respuesta.setStatus(204)))
        .addFilterBefore(new FiltroCuentaActiva(repositorio), AuthorizationFilter.class);
    return http.build();
  }

  static void responder(HttpServletResponse respuesta, int estado, String mensaje) throws IOException {
    respuesta.setStatus(estado);
    respuesta.setContentType("application/json;charset=UTF-8");
    new ObjectMapper().writeValue(respuesta.getWriter(), Map.of("mensaje", mensaje));
  }
}
