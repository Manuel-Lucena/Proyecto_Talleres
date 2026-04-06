package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para la visualización de archivos de material didáctico.
 * Incluye la extensión para permitir al frontend mostrar iconos representativos (PDF, Word, etc.).
 */
@Data
public class ArchivoMaterialResponseDTO {

    /** Identificador único del archivo en base de datos. */
    private Long id;

    /** Nombre del archivo que verá el usuario. */
    private String nombre;

    /** Ruta de almacenamiento para gestionar la descarga segura. */
    private String rutaArchivo;

    /** Extensión del archivo para lógica de iconos o previsualización. */
    private String extension; 

    /** ID del material vinculado. */
    private Long idMaterial;
}