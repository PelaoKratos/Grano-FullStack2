package cl.grano.backend.repository;

import cl.grano.backend.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
  Optional<Usuario> findByCorreo(String correo);
  boolean existsByRut(String rut);
}
