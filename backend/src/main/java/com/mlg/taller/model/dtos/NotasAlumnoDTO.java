package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO para el resumen de rendimiento académico de un alumno.
 * Agrupa estadísticas de entregas y promedios para el panel de seguimiento
 * del profesor.
 */
@Data
@AllArgsConstructor
public class NotasAlumnoDTO {

    /** ID único del alumno matriculado. */
    private Long idUsuario;

    /** Nombre y apellidos del alumno para mostrar en la lista. */
    private String nombreCompleto;

    /** Cantidad total de actividades entregadas por el alumno. */
    private long tareasEntregadas;

    /** Cantidad total de actividades asignadas al el alumno. */
    private long tareasTotalesAsignadas;

    /** Media aritmética de todas las calificaciones obtenidas en el taller. */
    private Double promedio;
}