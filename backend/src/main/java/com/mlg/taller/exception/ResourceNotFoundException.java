package com.mlg.taller.exception;

/**
 * Excepción lanzada cuando un recurso solicitado no se encuentra en la base de datos.
 * Se utiliza típicamente en búsquedas por ID o parámetros únicos (ej: buscar un taller que no existe).
 * * Esta excepción es capturada por el manejador global para devolver un estado HTTP 404 (Not Found).
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}