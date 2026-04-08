package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.TareaAsignada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de asignaciones individuales de tareas a alumnos.
 */
@Repository
public interface TareaAsignadaRepository extends JpaRepository<TareaAsignada, Long> {

    /**
     * Obtiene todas las asignaciones de tareas para un alumno específico.
     * * @param alumnoId Identificador único del alumno.
     * @return Lista de registros de asignación.
     */
    List<TareaAsignada> findByAlumnoId(Long alumnoId);

    /**
     * Obtiene todas las asignaciones vinculadas a una tarea específica.
     * Esencial para que el profesor vea qué alumnos tienen ya la tarea asignada.
     * * @param tareaId Identificador de la tarea.
     * @return Lista de registros de asignación para esa tarea.
     */
    List<TareaAsignada> findByTareaId(Long tareaId);

    /**
     * Elimina todas las asignaciones vinculadas a una tarea específica.
     * * @param tareaId Identificador de la tarea.
     */
    void deleteByTareaId(Long tareaId);

    /**
     * Verifica si existe una asignación específica entre un alumno y una tarea.
     * * @param tareaId  Identificador de la tarea.
     * @param alumnoId Identificador del alumno.
     * @return true si el alumno tiene la tarea asignada, false en caso contrario.
     */
    boolean existsByTareaIdAndAlumnoId(Long tareaId, Long alumnoId);
}