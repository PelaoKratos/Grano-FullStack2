package cl.grano.backend.repository;

import cl.grano.backend.model.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeRepository extends JpaRepository<Mensaje, String> {}
