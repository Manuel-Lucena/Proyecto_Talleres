package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de entregas de tareas.
 * Centraliza el seguimiento de las actividades realizadas por los alumnos.
 */
@Repository
public interface EntregaRepository extends JpaRepository<Entrega, Long> {

    /**
     * * Obtiene todas las entregas realizadas para una tarea concreta.
     * * @param idTarea Identificador único de la tarea.
     * 
     * @return Lista de todas las entregas de los alumnos para dicha tarea (Vista
     *         Profesor).
     */
    List<Entrega> findByTareaId(Long idTarea);

    /**
     * * Obtiene el historial completo de entregas de un alumno específico.
     * * @param idUsuario Identificador único del alumno.
     * 
     * @return Lista de entregas realizadas por el usuario en diferentes tareas.
     */
    List<Entrega> findByAlumnoId(Long idUsuario);

    /**
     * * Busca la entrega específica de un alumno para una tarea concreta.
     * * @param idTarea Identificador de la tarea a consultar.
     * 
     * @param idUsuario Identificador del alumno que realiza la entrega.
     * @return Un {@link Optional} que contiene la entrega si existe, o vacío si el
     *         alumno aún no ha entregado.
     *         Esencial para validar duplicados o permitir ediciones de entrega.
     */
    Optional<Entrega> findByTareaIdAndAlumnoId(Long idTarea, Long idUsuario);

    /**
     * Recupera todas las entregas de un alumno específico dentro de un taller
     * concreto.
     * Cruza la relación Alumno -> Entrega -> Tarea -> Taller.
     * * @param idUsuario Identificador del alumno.
     * 
     * @param idTaller Identificador del taller.
     * @return Lista de entregas del alumno en ese taller específico.
     */
    List<Entrega> findByAlumnoIdAndTarea_Taller_Id(Long idUsuario, Long idTaller);
}