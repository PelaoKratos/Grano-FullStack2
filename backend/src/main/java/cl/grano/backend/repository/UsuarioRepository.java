package cl.grano.backend.repository;

import cl.grano.backend.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
  Optional<Usuario> findByCorreo(String correo);
  boolean existsByRut(String rut);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select u from Usuario u where u.correo = :correo")
  Optional<Usuario> bloquearPorCorreo(@Param("correo") String correo);
}
