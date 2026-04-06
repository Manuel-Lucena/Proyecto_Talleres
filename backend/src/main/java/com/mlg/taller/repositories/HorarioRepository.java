package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de los horarios y sesiones de los talleres.
 */
@Repository
public interface HorarioRepository extends JpaRepository<Horario, Long> {

    /**
     * Recupera la planificación de días y horas de un taller concreto.
     * * @param idTaller Identificador del taller a consultar.
     * @return Lista de sesiones horarias asociadas al taller.
     */
    List<Horario> findByTallerId(Long idTaller);
}