package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalTime;

/**
 * DTO para la respuesta detallada de un horario.
 * Incluye el nombre del taller para facilitar la creación de calendarios en el frontend.
 */
@Data
public class HorarioResponseDTO {

    /** Identificador único del registro de horario. */
    private Long idHorario;

    /** ID del taller vinculado. */
    private Long idTaller;

    /** Nombre descriptivo del taller. */
    private String nombreTaller;

    /** Día de la semana asignado. */
    private String diaSemana;

    /** Hora de inicio. */
    private LocalTime horaInicio;

    /** Hora de fin. */
    private LocalTime horaFin;
}