package com.mlg.taller.model.dtos;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para la solicitud de creación de tareas.
 * Permite al profesor definir plazos y qué alumnos deben realizar la actividad.
 */
@Data
public class TareaRequestDTO {

    /** Título de la tarea o práctica. */
    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    /** Instrucciones detalladas de la actividad. */
    private String descripcion;

    /** ID del taller al que pertenece la tarea. */
    private Long idTaller;

    /** Fecha límite para que los alumnos realicen la entrega. */
    private LocalDateTime fechaEntrega;

    /**
     * * Filtro de archivos.
     * 
     * @example ".pdf, .docx, .zip"
     */
    private String extensionesPermitidas;

    /** Define si la tarea se crea como visible u oculta. */
    private boolean visible = true;

    /** Listado de IDs de alumnos asignados específicamente a esta tarea. */
    private List<Long> alumnosIds;
}