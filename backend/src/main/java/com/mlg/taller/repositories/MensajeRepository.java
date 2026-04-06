package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión del historial de mensajes en los talleres.
 */
@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    /**
     * Recupera el hilo de conversación de un taller ordenado por fecha de envío.
     * @param idTaller Identificador del taller.
     * @return Lista de mensajes en orden cronológico (del más antiguo al más reciente).
     */
    List<Mensaje> findByTallerIdOrderByFechaEnvioAsc(Long idTaller);
}