package com.mlg.taller.model.dtos;

import java.util.List;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * DTO para la solicitud de asignación de tareas a alumnos.
 * Permite vincular una actividad existente con uno o varios estudiantes
 * específicos.
 */
@Data
public class TareaAsignadaRequestDTO {

    /** Identificador único de la tarea que se va a asignar. */
    @NotNull(message = "El ID de la tarea es obligatorio")
    private Long idTarea;

    /** Listado de identificadores de los alumnos seleccionados. */
    @NotEmpty(message = "La lista de IDs de alumnos no puede estar vacía")
    private List<Long> alumnoIds;
}