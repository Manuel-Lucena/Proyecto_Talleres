package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para la respuesta detallada de una entrega.
 * Combina datos de la entrega con información descriptiva de la tarea y del alumno
 * para facilitar su visualización en listados y paneles de corrección.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaResponseDTO {

    /** Identificador único de la entrega. */
    private Long idEntrega;

    /** Fecha y hora exacta en la que el alumno registró la entrega. */
    private LocalDateTime fechaEntrega;

    /** Contenido textual o cuerpo del trabajo entregado. */
    private String textoEntrega; 

    /** Nota asignada por el profesor (0.0 a 10.0). */
    private Double calificacion;

    /** Feedback o comentarios de mejora proporcionados por el instructor. */
    private String comentarioProfesor;
    
    /** Identificador de la tarea vinculada. */
    private Long idTarea;

    /** Título de la tarea (para evitar búsquedas adicionales en el frontend). */
    private String tituloTarea;

    /** Identificador del alumno que realizó la entrega. */
    private Long idUsuario;

    /** Nombre completo del alumno para identificar la entrega rápidamente. */
    private String nombreAlumno; 
}