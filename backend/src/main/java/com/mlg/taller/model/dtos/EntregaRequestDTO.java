package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la gestión del ciclo de vida de una entrega.
 * Centraliza tanto el envío del trabajo por parte del alumno como 
 * el proceso de evaluación y feedback por parte del docente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaRequestDTO {

    /** Identificador de la tarea a la que pertenece esta entrega. */
    @NotNull(message = "La tarea es obligatoria")
    private Long idTarea;

    /** * Contenido textual de la entrega. 
     * Aquí el alumno puede pegar enlaces a recursos externos (Drive, GitHub, etc.)
     */
    private String textoEntrega;

    /** * Calificación numérica. 
     * Rango validado entre 0 y 10.
     */
    @Min(value = 0, message = "La nota mínima es 0")
    @Max(value = 10, message = "La nota máxima es 10")
    private Double calificacion;

    /** * Comentarios de corrección del profesor. 
     * Espacio para el feedback tras la revisión.
     */
    private String comentarioProfesor;
}