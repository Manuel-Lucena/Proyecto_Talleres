package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la solicitud de creación o actualización de una entrega de tarea.
 * Centraliza la información del alumno, la tarea y la posterior evaluación del profesor.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaRequestDTO {

    /** Identificador de la tarea a la que pertenece esta entrega. */
    @NotNull(message = "La tarea es obligatoria")
    private Long idTarea;
    
    /** Identificador del alumno que realiza la entrega. */
    @NotNull(message = "El ID de alumno es obligatorio")
    private Long idUsuario;
    
    /** Texto explicativo o cuerpo del trabajo enviado por el alumno. */
    private String textoEntrega;

    /** Nota numérica asignada por el profesor tras la revisión. */
    private Double calificacion;

    /** Retroalimentación técnica proporcionada por el instructor. */
    private String comentarioProfesor;
}