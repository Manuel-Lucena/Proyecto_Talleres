package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO para la estructuración de respuestas de error.
 * Se utiliza en el GlobalExceptionHandler para devolver información coherente
 * cuando ocurre una excepción en el sistema.
 */
@Data
@AllArgsConstructor
public class ErrorResponse {

    /** Momento exacto en el que se produjo el error. */
    private LocalDateTime timestamp;

    /** Código de estado HTTP */
    private int status;

    /** Nombre corto del error */
    private String error;

    /** Mensaje descriptivo sobre la causa del error. */
    private String message;
}