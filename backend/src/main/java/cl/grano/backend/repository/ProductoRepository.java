package cl.grano.backend.repository;

import cl.grano.backend.model.Producto;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// JPA prepara las consultas básicas; añadimos la búsqueda por nombre.
public interface ProductoRepository extends JpaRepository<Producto, String> {
  Optional<Producto> findByNombreIgnoreCase(String nombre);
}
