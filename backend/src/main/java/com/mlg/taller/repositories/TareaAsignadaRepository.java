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
     * @param alumnoId Identificador único del alumno.
     * @return Lista de tareas asignadas al usuario.
     */
    List<TareaAsignada> findByAlumnoId(Long alumnoId);

    /**
     * Elimina todas las asignaciones vinculadas a una tarea específica.
     * @param tareaId Identificador de la tarea.
     * @note Se utiliza al reasignar o eliminar una actividad.
     */
    void deleteByTareaId(Long tareaId);
}