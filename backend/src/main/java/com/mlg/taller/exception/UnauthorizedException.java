package com.mlg.taller.exception;

/**
 * Excepción lanzada cuando un usuario intenta realizar una acción
 * para la que no tiene permisos suficientes (ej: un alumno intentando borrar un
 * taller).
 * Se traduce en un error HTTP 403 (Forbidden).
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}