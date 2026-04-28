package com.mlg.taller.exception;

import com.mlg.taller.util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Gestor global de excepciones de la aplicación.
 * Centraliza la captura de errores lanzados en las capas de Controller o
 * Service
 * y los transforma en una respuesta estandarizada mediante ApiResponse.
 */

@RestControllerAdvice
public class GlobalExceptionHandler {

    // --- MANEJO DE ERRORES DE CLIENTE (4xx) ---

    /**
     * Gestiona los errores de validación de los campos de los DTOs (@Valid).
     * Construye un mapa detallado de "campo: error" para facilitar el feedback en
     * formularios.
     * 
     * @param ex Excepción lanzada automáticamente por Spring al fallar la
     *           validación.
     * @return Respuesta 400 con el detalle de errores por campo.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String campo = ((FieldError) error).getField();
            String mensaje = error.getDefaultMessage();
            errores.put(campo, mensaje);
        });

        return ApiResponse.error("Errores de validación", errores, HttpStatus.BAD_REQUEST.value());
    }

    /**
     * Gestiona los casos donde el recurso solicitado no existe en la base de datos.
     * 
     * @param ex Excepción lanzada al no encontrar un registro.
     * @return Respuesta estructurada con código 404 (Not Found).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> handleNotFound(ResourceNotFoundException ex) {
        return ApiResponse.error(ex.getMessage(), HttpStatus.NOT_FOUND.value());
    }

    /**
     * Captura excepciones de conflicto por duplicidad de datos únicos (DNI, Email,
     * etc).
     * 
     * @param ex Excepción de recurso ya existente.
     * @return Respuesta estructurada con código 409 (Conflict).
     */
    @ExceptionHandler(DuplicateResourceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<Void> handleDuplicate(DuplicateResourceException ex) {
        return ApiResponse.error(ex.getMessage(), HttpStatus.CONFLICT.value());
    }

    /**
     * Maneja peticiones incorrectas o errores en la lógica de negocio solicitada.
     * 
     * @param ex Excepción por datos mal formados o precondiciones no cumplidas.
     * @return Respuesta estructurada con código 400 (Bad Request).
     */
    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBadRequest(BadRequestException ex) {
        return ApiResponse.error(ex.getMessage(), HttpStatus.BAD_REQUEST.value());
    }

    /**
     * Gestiona intentos de acceso no autorizados a recursos protegidos.
     * 
     * @return Respuesta 403 (Forbidden).
     */
    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleUnauthorized(UnauthorizedException ex) {
        return ApiResponse.error(ex.getMessage(), HttpStatus.FORBIDDEN.value());
    }

    /**
     * Gestiona errores críticos de lectura/escritura de archivos.
     * 
     * @return Respuesta 500 (Internal Server Error).
     */
    @ExceptionHandler(FileStorageException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleFileError(FileStorageException ex) {
        return ApiResponse.error("Error en el almacenamiento: " + ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value());
    }

    // --- MANEJO DE ERRORES DE SERVIDOR (5xx) ---

    /**
     * Captura cualquier excepción no controlada específicamente.
     * Actúa como red de seguridad final para evitar fugas de información técnica.
     * 
     * @param ex Excepción genérica capturada.
     * @return Respuesta estructurada con código 500 (Internal Server Error).
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleGlobal(Exception ex) {
        return ApiResponse.error("Error interno del servidor: " + ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value());
    }
}