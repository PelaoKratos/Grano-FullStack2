package cl.grano.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
  private final String[] origenes;

  public CorsConfig(@Value("${grano.frontend.origins}") String[] origenes) {
    this.origenes = origenes;
  }

  @Override
  public void addCorsMappings(CorsRegistry registro) {
    registro.addMapping("/api/**")
        .allowedOrigins(origenes)
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("Content-Type", "Accept", "X-CSRF-TOKEN")
        .allowCredentials(true);
  }
}
