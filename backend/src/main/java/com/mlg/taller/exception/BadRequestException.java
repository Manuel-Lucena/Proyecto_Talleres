package com.mlg.taller.exception;

/**
 * Excepción lanzada cuando la petición del usuario no cumple con la lógica de negocio 
 * o contiene datos semánticamente incorrectos.
 * Se traduce en un error HTTP 400 (Bad Request).
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}