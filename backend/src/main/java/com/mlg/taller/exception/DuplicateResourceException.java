package com.mlg.taller.exception;

/**
 * Excepción personalizada para gestionar conflictos de duplicidad.
 * Se lanza cuando se intenta crear un registro con un identificador único 
 * (como DNI, Email o nombre de taller) que ya existe en el sistema.
 * * Se captura en el GlobalExceptionHandler para devolver un HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}