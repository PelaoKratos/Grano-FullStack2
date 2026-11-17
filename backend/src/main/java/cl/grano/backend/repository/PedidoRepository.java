package cl.grano.backend.repository;

import cl.grano.backend.model.Pedido;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, String> {
  Optional<Pedido> findByCompradorAndSolicitudId(String comprador, String solicitudId);
  List<Pedido> findByCompradorOrderByCreadoDesc(String comprador);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Pedido p where p.id = :id")
  Optional<Pedido> bloquear(@Param("id") String id);
}
