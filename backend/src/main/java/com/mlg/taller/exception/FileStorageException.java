package com.mlg.taller.exception;

/**
 * Excepción lanzada cuando ocurre un error físico al guardar, 
 * leer o borrar un archivo en el servidor.
 */
public class FileStorageException extends RuntimeException {
    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}