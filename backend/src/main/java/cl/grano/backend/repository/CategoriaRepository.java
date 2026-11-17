package cl.grano.backend.repository;

import cl.grano.backend.model.Categoria;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface CategoriaRepository extends JpaRepository<Categoria, String> {
  Optional<Categoria> findByClave(String clave);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select c from Categoria c where c.id = :id")
  Optional<Categoria> bloquear(@Param("id") String id);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select c from Categoria c where c.nombre = :nombre")
  Optional<Categoria> bloquearPorNombre(@Param("nombre") String nombre);
}
