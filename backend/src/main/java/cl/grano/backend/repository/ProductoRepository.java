package cl.grano.backend.repository;

import cl.grano.backend.model.Producto;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// JPA prepara las consultas básicas; añadimos la búsqueda por nombre.
public interface ProductoRepository extends JpaRepository<Producto, String> {
  Optional<Producto> findByNombreIgnoreCase(String nombre);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Producto p where p.id = :id")
  Optional<Producto> bloquear(@Param("id") String id);
}
