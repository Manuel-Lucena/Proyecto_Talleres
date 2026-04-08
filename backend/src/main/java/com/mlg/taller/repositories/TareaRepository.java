package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de actividades y tareas académicas.
 */
@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    /**
     * Recupera todas las tareas publicadas en el contexto de un taller.
     * 
     * @param tallerId Identificador del taller.
     * @return Lista de tareas (enunciados) asociadas al taller.
     */
    List<Tarea> findByTallerId(Long tallerId);

    /**
     * Recupera exclusivamente las tareas de un taller que han sido marcadas como
     * visibles.
     * * @param tallerId Identificador único del taller.
     * 
     * @return Lista de tareas activas y visibles para los alumnos en el taller.
     */
    List<Tarea> findByTallerIdAndVisibleTrue(Long tallerId);

    @Query("SELECT t FROM Tarea t JOIN TareaAsignada ta ON ta.tarea.id = t.id " +
            "WHERE t.taller.id = :idTaller AND ta.alumno.id = :idAlumno AND t.visible = true")
    List<Tarea> findVisiblesParaAlumno(Long idTaller, Long idAlumno);
}