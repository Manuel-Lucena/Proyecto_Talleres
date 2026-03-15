package com.mlg.taller.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Estructura genérica para todas las respuestas de la API.
 * Garantiza un formato consistente que facilita el consumo desde el frontend.
 * * @param <T> Tipo de dato que contiene la respuesta (Entidad, DTO, List, etc.)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    
    /** Cuerpo de la respuesta con los datos solicitados. */
    private T data;
    
    /** Mensaje descriptivo del resultado de la operación. */
    private String message;
    
    /** Código de estado HTTP (ej: 200, 404, 500). */
    private int status;
    
    /** Indicador booleano de éxito de la petición. */
    private boolean success;

    /**
     * Genera una respuesta exitosa estandarizada.
     * * @param <T>     Tipo del objeto de datos.
     * @param data    Datos a enviar al cliente.
     * @param message Mensaje de confirmación.
     * @return Instancia de ApiResponse con éxito configurado en true.
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message, 200, true);
    }

    /**
     * Genera una respuesta de error simplificada.
     * * @param <T>     Tipo genérico (normalmente nulo en errores simples).
     * @param message Descripción del error.
     * @param status  Código de estado HTTP de error.
     * @return Instancia de ApiResponse con éxito configurado en false.
     */
    public static <T> ApiResponse<T> error(String message, int status) {
        return new ApiResponse<>(null, message, status, false);
    }

    /**
     * Genera una respuesta de error con información detallada adicional.
     * Útil para enviar mapas de errores de validación de formularios.
     * * @param <T>     Tipo del objeto de datos de error (ej: Map de errores).
     * @param message Mensaje general del error.
     * @param data    Detalles técnicos o de validación del error.
     * @param status  Código de estado HTTP de error.
     * @return Instancia de ApiResponse detallada.
     */
    public static <T> ApiResponse<T> error(String message, T data, int status) {
        return new ApiResponse<>(data, message, status, false);
    }
}