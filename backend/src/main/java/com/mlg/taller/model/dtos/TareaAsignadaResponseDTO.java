package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para la visualización de una tarea asignada.
 * Proporciona información detallada del alumno para facilitar la gestión 
 * y seguimiento individual por parte del profesor.
 */
@Data
public class TareaAsignadaResponseDTO {

    /** Identificador único del registro de asignación. */
    private Long idAsignacion;

    /** ID de la tarea vinculada. */
    private Long idTarea;

    /** ID del alumno que tiene la tarea pendiente. */
    private Long idAlumno;

    /** Nombre del alumno */
    private String nombreAlumno;

    /** Apellidos del alumno */
    private String apellidosAlumno;
}