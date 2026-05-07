package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Recupera las tareas visibles para un alumno específico dentro de un taller.
     * * Implementa una lógica de visibilidad híbrida:
     * 1. La tarea debe pertenecer al taller y estar marcada como visible.
     * 2. El alumno verá la tarea si existe una asignación explícita para él
     * en TareaAsignada, O si la tarea no tiene ninguna asignación (tarea global).
     *
     * @param idTaller Identificador del taller.
     * @param idAlumno Identificador del alumno que consulta sus tareas.
     * @return Lista de tareas que el alumno tiene permiso para visualizar y
     *         entregar.
     */
    @Query("SELECT t FROM Tarea t " +
            "WHERE t.taller.id = :idTaller " +
            "AND t.visible = true " +
            "AND (" +
            "  EXISTS (SELECT ta FROM TareaAsignada ta WHERE ta.tarea.id = t.id AND ta.alumno.id = :idAlumno) " +
            "  OR " +
            "  NOT EXISTS (SELECT ta FROM TareaAsignada ta WHERE ta.tarea.id = t.id)" +
            ")")
    List<Tarea> findVisiblesParaAlumno(@Param("idTaller") Long idTaller, @Param("idAlumno") Long idAlumno);
}