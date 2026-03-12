package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByTallerIdOrderByFechaEnvioAsc(Long idTaller);
}