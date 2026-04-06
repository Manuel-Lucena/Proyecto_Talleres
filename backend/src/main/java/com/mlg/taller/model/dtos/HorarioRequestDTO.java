package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalTime;

/**
 * DTO para el registro de una franja horaria asociada a un taller.
 * Permite definir qué día y en qué intervalo de tiempo se imparte la actividad.
 */
@Data
public class HorarioRequestDTO {

    /** Identificador del taller al que se le asigna el horario. */
    private Long idTaller;

    /** Día de la semana (ej: 'LUNES', 'MARTES'). */
    private String diaSemana;

    /** Hora de inicio de la sesión. */
    private LocalTime horaInicio;

    /** Hora de finalización de la sesión. */
    private LocalTime horaFin;
}