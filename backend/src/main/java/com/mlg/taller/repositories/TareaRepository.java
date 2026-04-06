package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de actividades y tareas académicas.
 */
@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    /**
     * Recupera todas las tareas publicadas en el contexto de un taller.
     * @param tallerId Identificador del taller.
     * @return Lista de tareas (enunciados) asociadas al taller.
     */
    List<Tarea> findByTallerId(Long tallerId);
}