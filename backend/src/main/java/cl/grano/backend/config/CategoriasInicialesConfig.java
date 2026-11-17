package cl.grano.backend.config;

import cl.grano.backend.service.CategoriaService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;

@Configuration
public class CategoriasInicialesConfig {
  @Bean
  ApplicationRunner prepararCategorias(CategoriaService categorias) {
    return argumentos -> categorias.inicializar();
  }
}
